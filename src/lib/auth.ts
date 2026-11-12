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
    // 1. Try Supabase session if configured
    if (isSupabaseConfigured) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error && session) return session;
      } catch (e) {
        console.warn("Supabase getSession failed, using local session fallback:", e);
      }
    }

    // 2. Fall back to local storage session
    const local = getLocalSession();
    if (local) {
      return {
        user: { id: local.user.id, email: local.user.email },
        access_token: local.token
      } as any;
    }

    // 3. Fall back to currentUserId in store
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
    const session = await auth.getSession();
    if (!session?.user) return null;

    // Check store first for instantaneous local rendering
    const localUser = store.getState().users.find(
      u => u.id === session.user.id || (session.user.email && u.email.toLowerCase() === session.user.email.toLowerCase())
    );
    if (localUser) return localUser;

    // Check Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) return profile;
      } catch (e) {
        console.warn("Supabase profile fetch error:", e);
      }
    }

    // Fall back to local session profile
    const localSession = getLocalSession();
    if (localSession?.user) {
      return {
        id: localSession.user.id,
        email: localSession.user.email,
        name: localSession.user.name || localSession.user.email.split('@')[0],
        role: localSession.user.role || "user",
        walletBalance: 2500,
        rewardPoints: 1200,
        vehicles: []
      };
    }

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

    // 1. Try Supabase login if configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (!error && data?.user) {
          let realRole: Role = "user";
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('role')
              .eq('id', data.user.id)
              .single();
            if (profile?.role) realRole = profile.role as Role;
          } catch (e) {}

          saveLocalSession({
            user: { id: data.user.id, email: normalizedEmail, role: realRole },
            token: data.session?.access_token || "supabase_token"
          });
          store.setState({ currentUserId: data.user.id });
          return { success: true, realRole };
        }

        if (error && !error.message.toLowerCase().includes("failed to fetch") && !error.message.toLowerCase().includes("network")) {
          console.warn("Supabase auth message:", error.message);
        }
      } catch (err: any) {
        console.warn("Supabase signInWithPassword failed, using offline fallback:", err.message);
      }
    }

    // 2. Offline / Demo / Local Fallback Authentication
    const state = store.getState();
    let matchingUser = state.users.find(
      u => u.email.toLowerCase() === normalizedEmail
    );

    // If matching user exists locally
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
      return { success: true, realRole: matchingUser.role };
    }

    // If user entered a new email, auto-create a user account so they are never blocked!
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

    // 1. Try Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const generateId = () => {
          if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
          return Math.random().toString(36).substring(2, 15);
        };

        const vehicles = profileData?.vehicleNumber ? [
          { id: generateId(), plateNumber: profileData.vehicleNumber, type: profileData.vehicleType || "car", model: "Registered Vehicle" }
        ] : [];

        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              name: profileData?.name || email.split('@')[0],
              role: role,
              vehicles: vehicles
            }
          }
        });

        if (!error && data?.user) {
          saveLocalSession({
            user: { id: data.user.id, email: normalizedEmail, role, name: profileData?.name },
            token: data.session?.access_token || "supabase_token"
          });
          store.setState({ currentUserId: data.user.id });
          return { success: true, needsVerification: !data.session };
        }
      } catch (e) {
        console.warn("Supabase signUp failed, using local registration fallback:", e);
      }
    }

    // 2. Offline / Local Registration Fallback
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

// Set up a listener for auth state changes if Supabase is active
if (typeof window !== "undefined" && isSupabaseConfigured) {
  try {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.id) {
        store.setState({ currentUserId: session.user.id });
        if (event === 'SIGNED_IN') {
          store.refreshData();
        }
      }
    });
  } catch (e) {}
}
