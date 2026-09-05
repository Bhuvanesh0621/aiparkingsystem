import { supabase } from './supabase';
import { store } from './store';

export type Role = "user" | "admin" | null;

export const auth = {
  // Get current user session from Supabase
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) console.error("Get session error:", error);
    return session;
  },

  getCurrentUser: () => {
    const id = store.getState().currentUserId;
    if (!id) return null;
    return { id };
  },

  // Get current user profile from public.users table
  getCurrentProfile: async () => {
    const session = await auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return profile;
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
    return profile?.role === "user";
  },

  login: async (email: string, password?: string): Promise<{ success: boolean; realRole?: Role, error?: string }> => {
    if (!password) return { success: false, error: "Password is required" };
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login failed:", error.message);
      return { success: false, error: error.message };
    }

    // Fetch role from public users table
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    return { success: true, realRole: profile?.role as Role };
  },

  register: async (email: string, password?: string, role: Role = "user", profileData?: any): Promise<{ success: boolean; error?: string; needsVerification?: boolean }> => {
    if (!password) return { success: false, error: "Password is required" };

    const generateId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    const vehicles = profileData?.vehicleNumber ? [
      { id: generateId(), plateNumber: profileData.vehicleNumber, type: profileData.vehicleType || "car", model: "Registered Vehicle" }
    ] : [];

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: profileData?.name || email.split('@')[0],
          role: role,
          vehicles: vehicles
        }
      }
    });

    if (error) {
      console.error("Registration failed:", error.message);
      if (error.message.toLowerCase().includes("rate limit") || error.message.toLowerCase().includes("email limit")) {
        return { 
          success: false, 
          error: "Supabase Email Limit Exceeded! For testing, go to your Supabase Dashboard -> Authentication -> Providers -> Email -> Turn OFF 'Confirm email'." 
        };
      }
      return { success: false, error: error.message };
    }

    return { success: true, needsVerification: !data.session };
  },

  logout: async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }
};

// Set up a listener for auth state changes
if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((event, session) => {
    store.setState({ currentUserId: session?.user?.id || null });
    if (event === 'SIGNED_IN') {
      store.refreshData();
    }
    if (event === 'SIGNED_OUT') {
      // Clear store data on logout
      store.setState({ users: [], bookings: [], incidents: [] });
    }
  });
}
