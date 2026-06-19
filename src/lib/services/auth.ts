import { supabase, isMockMode } from "../supabase";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
}

type AuthChangeCallback = (user: UserProfile | null) => void;
const listeners = new Set<AuthChangeCallback>();

let currentUser: UserProfile | null = null;

// Initialize mock session from localStorage
if (typeof window !== "undefined" && isMockMode) {
  const saved = localStorage.getItem("pixelai_current_user");
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
    } catch {
      currentUser = null;
    }
  }
}

function notifyListeners() {
  listeners.forEach((callback) => callback(currentUser));
}

export const authService = {
  isMock: isMockMode,

  async signUp(email: string, password: string, fullName: string): Promise<{ user: UserProfile | null; error: Error | null }> {
    if (isMockMode) {
      // Mock registration
      const usersRaw = localStorage.getItem("pixelai_users") || "[]";
      const users: UserProfile[] = JSON.parse(usersRaw);

      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { user: null, error: new Error("User already exists.") };
      }

      const newUser: UserProfile = {
        id: "mock-uid-" + Math.random().toString(36).substring(2, 9),
        email: email.toLowerCase(),
        fullName,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem("pixelai_users", JSON.stringify(users));

      // Auto sign-in
      currentUser = newUser;
      localStorage.setItem("pixelai_current_user", JSON.stringify(newUser));

      // Set initial credits (5 credits for new user)
      localStorage.setItem(`pixelai_credits_${newUser.id}`, JSON.stringify({
        credits_remaining: 5,
        plan_type: "free"
      }));

      notifyListeners();
      return { user: newUser, error: null };
    } else {
      // Supabase registration
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`,
          },
        },
      });

      if (error) return { user: null, error };
      if (!data.user) return { user: null, error: new Error("Sign up failed") };

      const profile: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: data.user.user_metadata?.full_name || fullName,
        avatarUrl: data.user.user_metadata?.avatar_url,
        createdAt: data.user.created_at,
      };

      return { user: profile, error: null };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: UserProfile | null; error: Error | null }> {
    if (isMockMode) {
      // Mock Sign In
      const usersRaw = localStorage.getItem("pixelai_users") || "[]";
      const users: UserProfile[] = JSON.parse(usersRaw);

      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        return { user: null, error: new Error("Invalid email or password.") };
      }

      // Password checks omitted in mock mode for developer convenience
      currentUser = found;
      localStorage.setItem("pixelai_current_user", JSON.stringify(found));
      notifyListeners();
      return { user: found, error: null };
    } else {
      // Supabase Sign In
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { user: null, error };
      if (!data.user) return { user: null, error: new Error("Sign in failed") };

      const profile: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: data.user.user_metadata?.full_name || "User",
        avatarUrl: data.user.user_metadata?.avatar_url,
        createdAt: data.user.created_at,
      };

      currentUser = profile;
      notifyListeners();
      return { user: profile, error: null };
    }
  },

  async signOut(): Promise<{ error: Error | null }> {
    if (isMockMode) {
      currentUser = null;
      localStorage.removeItem("pixelai_current_user");
      notifyListeners();
      return { error: null };
    } else {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        currentUser = null;
        notifyListeners();
      }
      return { error };
    }
  },

  getCurrentUserSync(): UserProfile | null {
    return currentUser;
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    if (isMockMode) {
      return currentUser;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const profile: UserProfile = {
        id: user.id,
        email: user.email || "",
        fullName: user.user_metadata?.full_name || "User",
        avatarUrl: user.user_metadata?.avatar_url,
        createdAt: user.created_at,
      };
      currentUser = profile;
      return profile;
    }
  },

  onAuthStateChange(callback: AuthChangeCallback): () => void {
    listeners.add(callback);
    // Emit current state immediately
    callback(currentUser);

    if (!isMockMode) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || "",
            fullName: session.user.user_metadata?.full_name || "User",
            avatarUrl: session.user.user_metadata?.avatar_url,
            createdAt: session.user.created_at,
          };
          currentUser = profile;
          callback(profile);
        } else {
          currentUser = null;
          callback(null);
        }
      });

      return () => {
        listeners.delete(callback);
        subscription.unsubscribe();
      };
    }

    return () => {
      listeners.delete(callback);
    };
  },
};
