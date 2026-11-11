import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import { DEMO_USER_ID, isDemoModeActive, setDemoModeActive } from "@/lib/demoMode";
import { ensureCurrentUserProfile } from "@/services/timeflow";

type AuthUser = Pick<User, "id" | "email" | "user_metadata">;

interface AuthContextValue {
  session: Session | null;
  user: AuthUser | null;
  loading: boolean;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signInDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const demoUser: AuthUser = {
  id: DEMO_USER_ID,
  email: "freja@company.com",
  user_metadata: {
    full_name: "Freja Lindström",
  },
};

const getRedirectUrl = () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  return `${window.location.origin}/`;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(isDemoModeActive);
  const [loading, setLoading] = useState(() => hasSupabaseConfig && !isDemoModeActive());

  useEffect(() => {
    if (isDemoModeActive()) {
      setLoading(false);
      return;
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    const syncSession = async (nextSession: Session | null) => {
      setSession(nextSession);

      if (nextSession?.user) {
        await ensureCurrentUserProfile(nextSession.user);
      }

      if (active) {
        setLoading(false);
      }
    };

    void supabase.auth
      .getSession()
      .then(({ data }) => syncSession(data.session))
      .catch(() => {
        if (active) {
          setLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!supabase) {
      throw new Error("Supabase is not configured");
    }

    setDemoModeActive(false);
    setIsDemoMode(false);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getRedirectUrl(),
      },
    });

    if (error) {
      throw error;
    }
  };

  const signInWithMagicLink = async (email: string) => {
    if (!supabase) {
      throw new Error("Supabase is not configured");
    }

    setDemoModeActive(false);
    setIsDemoMode(false);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getRedirectUrl(),
      },
    });

    if (error) {
      throw error;
    }
  };

  const signInDemo = () => {
    setSession(null);
    setDemoModeActive(true);
    setIsDemoMode(true);
    setLoading(false);
  };

  const signOut = async () => {
    if (isDemoMode) {
      setDemoModeActive(false);
      setIsDemoMode(false);
      setSession(null);
      return;
    }

    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: isDemoMode ? demoUser : session?.user ?? null,
        loading,
        isDemoMode,
        signInWithGoogle,
        signInWithMagicLink,
        signInDemo,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be inside AuthProvider");
  }

  return context;
};
