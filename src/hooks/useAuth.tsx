import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface Profile {
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  avatar_url: string | null;
}

interface AppUser {
  id: string;
  email: string | null;
  user_metadata?: {
    full_name?: string | null;
  };
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  needsOnboarding: boolean;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const profileKey = (userId: string) => `trip_profile_${userId}`;

const emptyProfile: Profile = {
  full_name: null,
  phone: null,
  address: null,
  city: null,
  latitude: null,
  longitude: null,
  avatar_url: null,
};

const mapSupabaseUser = (sbUser: User): AppUser => ({
  id: sbUser.id,
  email: sbUser.email ?? null,
  user_metadata: {
    full_name: sbUser.user_metadata?.full_name ?? null,
  },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const fetchProfile = async (userId: string, fallbackName?: string | null) => {
    try {
      const raw = localStorage.getItem(profileKey(userId));

      if (raw) {
        const parsed = JSON.parse(raw) as Profile;
        setProfile(parsed);

        setNeedsOnboarding(
          !parsed.full_name || (!parsed.address && parsed.latitude == null)
        );
        return;
      }

      const initialProfile: Profile = {
        ...emptyProfile,
        full_name: fallbackName ?? null,
      };

      setProfile(initialProfile);
      setNeedsOnboarding(true);
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error(error);
        }

        const session = data.session;
        setSession(session);

        if (session?.user) {
          const appUser = mapSupabaseUser(session.user);
          setUser(appUser);
          await fetchProfile(appUser.id, appUser.user_metadata?.full_name ?? null);
        }
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        (async () => {
          setSession(session);

          if (session?.user) {
            const appUser = mapSupabaseUser(session.user);
            setUser(appUser);
            await fetchProfile(appUser.id, appUser.user_metadata?.full_name ?? null);
          } else {
            setUser(null);
            setProfile(null);
            setNeedsOnboarding(false);
          }

          setLoading(false);
        })();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`
        },
      });

      return { error: error?.message || null };
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "Google sign-in failed.",
      };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error: error?.message || null };
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "Email sign-in failed.",
      };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      return { error: error?.message || null };
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "Email sign-up failed.",
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setNeedsOnboarding(false);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return;

    const updated: Profile = {
      ...(profile ?? emptyProfile),
      ...data,
    };

    localStorage.setItem(profileKey(user.id), JSON.stringify(updated));

    setProfile(updated);

    setNeedsOnboarding(
      !updated.full_name || (!updated.address && updated.latitude == null)
    );
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        needsOnboarding,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
