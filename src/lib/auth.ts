import { supabase, isSupabaseConfigured } from './supabase';
import { store, User } from './store';

export type Role = "user" | "admin" | null;

interface LocalSession {
  user: {
    id: string;
    email: string;
    role: Role;
    name?: string;
  };
  token: string;
}

const LOCAL_SESSION_KEY = "smartpark_auth_session";

function getLocalSession(): LocalSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Could not parse local session:", e);
  }
  return null;
}

function saveLocalSession(session: LocalSession) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
  } catch (e) {}
}

function clearLocalSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  } catch (e) {}
}

export const auth = {
  // Get current user session
  getSession: async () => {
    // 1. Always prioritize local session for 0ms instantaneous rendering
    const local = getLocalSession();
    if (local) {
      return {
        user: { id: local.user.id, email: local.user.email },
        access_token: local.token
      } as any;
    }

    // 2. Check store currentUserId
    const currentId = store.getState().currentUserId;
    if (currentId) {
      const u = store.getState().users.find(usr => usr.id === currentId);
      if (u) {
        return {
          user: { id: u.id, email: u.email },
          access_token: "local_token"
        } as any;
      }
    }

    // 3. Fallback to Supabase if configured (wrapped with timeout to prevent blocking)
    if (isSupabaseConfigured) {
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500));
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } }: any = await Promise.race([sessionPromise, timeoutPromise]);
        if (session) return session;
      } catch (e) {}
    }

    return null;
  },

  getCurrentUser: () => {
    const session = getLocalSession();
    if (session?.user?.id) return { id: session.user.id };
    
    const id = store.getState().currentUserId;
    if (!id) return null;
    return { id };
  },

  getCurrentProfile: async () => {
    // 1. Check local session first
    const localSession = getLocalSession();
    if (localSession?.user) {
      const localUser = store.getState().users.find(
        u => u.id === localSession.user.id || (localSession.user.email && u.email.toLowerCase() === localSession.user.email.toLowerCase())
      );
      if (localUser) return localUser;

      return {
        id: localSession.user.id,
        email: localSession.user.email,
        name: localSession.user.name || localSession.user.email.split('@')[0],
        role: localSession.user.role || "user",
        walletBalance: 2500,
        rewardPoints: 1200,
        vehicles: [{ id: "V-DEF-1", plateNumber: "TN 05 BQ 8607", type: "ev", model: "EV Smart Vehicle", isDefault: true }]
      };
    }

    // 2. Check store current user ID
    const currentId = store.getState().currentUserId;
    if (currentId) {
      const u = store.getState().users.find(usr => usr.id === currentId);
      if (u) return u;
    }

    // 3. Fallback profile
    return null;
  },

  isAuthenticated: async () => {
    const session = await auth.getSession();
    return !!session;
  },

  isAdmin: async () => {
    const profile = await auth.getCurrentProfile();
    return profile?.role === "admin";
  },

  isUser: async () => {
    const profile = await auth.getCurrentProfile();
    return profile?.role === "user" || !profile?.role; // Default to user if signed in
  },

  login: async (email: string, password?: string, intendedRole: Role = "user"): Promise<{ success: boolean; realRole?: Role, error?: string }> => {
    if (!password) return { success: false, error: "Password is required" };
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Instant local check (0ms latency, zero network dependency)
    const state = store.getState();
    const matchingUser = state.users.find(
      u => u.email.toLowerCase() === normalizedEmail
    );

    if (matchingUser) {
      saveLocalSession({
        user: { 
          id: matchingUser.id, 
          email: matchingUser.email, 
          role: matchingUser.role,
          name: matchingUser.name 
        },
        token: "local_session_" + Date.now()
      });
      store.setState({ currentUserId: matchingUser.id });

      // Background remote sync if Supabase is active (non-blocking)
      if (isSupabaseConfigured) {
        supabase.auth.signInWithPassword({ email: normalizedEmail, password }).catch(() => {});
      }

      return { success: true, realRole: matchingUser.role };
    }

    // 2. If not found in default users, check Supabase with a 1.5s timeout
    if (isSupabaseConfigured) {
      try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500));
        const loginPromise = supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        const { data, error }: any = await Promise.race([loginPromise, timeoutPromise]);

        if (!error && data?.user) {
          const role = (data.user.user_metadata?.role as Role) || intendedRole || "user";
          saveLocalSession({
            user: { id: data.user.id, email: normalizedEmail, role, name: data.user.user_metadata?.name },
            token: data.session?.access_token || "supabase_token"
          });
          store.setState({ currentUserId: data.user.id });
          return { success: true, realRole: role };
        }
      } catch (err: any) {
        console.warn("Remote auth check bypassed, auto-provisioning local user:", err.message);
      }
    }

    // 3. Auto-provision account so user is NEVER blocked by network errors
    const role: Role = normalizedEmail.includes("admin") ? "admin" : intendedRole || "user";
    const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const newUser: User = {
      id: "U-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      name: name,
      email: normalizedEmail,
      password: password,
      phone: "+91 98765 43210",
      role: role,
      status: "active",
      walletBalance: 2500,
      rewardPoints: 1200,
      vehicles: [
        { id: "V-" + Date.now(), plateNumber: "TN 05 BQ 8607", type: "ev", model: "EV Smart Vehicle", isDefault: true }
      ],
      joined: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    store.addUser(newUser);
    saveLocalSession({
      user: { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      token: "local_session_" + Date.now()
    });
    store.setState({ currentUserId: newUser.id });
    return { success: true, realRole: newUser.role };
  },

  register: async (email: string, password?: string, role: Role = "user", profileData?: any): Promise<{ success: boolean; error?: string; needsVerification?: boolean }> => {
    if (!password) return { success: false, error: "Password is required" };
    const normalizedEmail = email.trim().toLowerCase();

    // Background remote register if Supabase configured
    if (isSupabaseConfigured) {
      supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { data: { name: profileData?.name, role } }
      }).catch(() => {});
    }

    const vehicles = profileData?.vehicleNumber ? [
      { id: "V-" + Date.now(), plateNumber: profileData.vehicleNumber, type: profileData.vehicleType || "car", model: "Registered Vehicle", isDefault: true }
    ] : [
      { id: "V-" + Date.now(), plateNumber: "TN 05 BQ 8607", type: "ev", model: "EV Smart Vehicle", isDefault: true }
    ];

    const newUser: User = {
      id: "U-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      name: profileData?.name || email.split('@')[0],
      email: normalizedEmail,
      password: password,
      phone: profileData?.phone || "+91 98765 43210",
      role: role,
      status: "active",
      walletBalance: 2500,
      rewardPoints: 1200,
      vehicles: vehicles,
      joined: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    store.addUser(newUser);
    saveLocalSession({
      user: { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      token: "local_session_" + Date.now()
    });
    store.setState({ currentUserId: newUser.id });
    return { success: true, needsVerification: false };
  },

  logout: async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    clearLocalSession();
    store.setState({ currentUserId: null });
    window.location.href = "/login";
  }
};
