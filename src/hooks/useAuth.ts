import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type SupabaseAuthError = {
  message?: string;
  status?: number;
  name?: string;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        console.log("🔍 Getting initial session...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        console.log("📊 Initial session result:", {
          session: session ? "Present" : "None",
          user: session?.user?.email || "None",
          error: error?.message || "None",
        });

        if (error) {
          console.error("❌ Error getting session:", error);
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setInitialized(true);
          setLoading(false);
        }
      } catch (error: unknown) {
        const typedError = error as SupabaseAuthError;
        console.error("💥 Error in getInitialSession:", typedError.message);
        if (mounted) {
          setSession(null);
          setUser(null);
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", {
        event,
        user: session?.user?.email || "None",
        sessionId: session?.access_token ? "Present" : "None",
      });

      if (mounted) {
        if (initialized || event === "INITIAL_SESSION") {
          setSession(session);
          setUser(session?.user ?? null);
        }

        if (!initialized) {
          setInitialized(true);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  const signUp = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<{
    data: any;
    error: SupabaseAuthError | null;
    needsConfirmation?: boolean;
  }> => {
    try {
      console.log("📝 Attempting sign up for:", email, "with name:", fullName);

      const signUpData: any = {
        email,
        password,
      };

      if (fullName && fullName.trim()) {
        signUpData.options = {
          data: {
            full_name: fullName.trim(),
          },
        };
      }

      const { data, error } = await supabase.auth.signUp(signUpData);

      console.log("📝 Sign up result:", {
        user: data?.user?.email || "None",
        session: data?.session ? "Present" : "None",
        error: error?.message || "None",
      });

      if (data?.user && !data?.session && !error) {
        console.log("📧 Email confirmation required for:", email);
        return {
          data,
          error: null,
          needsConfirmation: true,
        };
      }

      if (error) {
        console.error("❌ Sign up error:", error);
        return { data, error };
      }

      if (data?.session) {
        console.log("✅ Sign up successful with immediate session");

        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
          let profile = null;
          let profileError = null;
          if (data.user) {
            const result = await supabase
              .from("user_profiles")
              .select("id")
              .eq("user_id", data.user.id)
              .single();
            profile = result.data;
            profileError = result.error;
          } else {
            profileError = { message: "User is null after signup" };
          }

          if (profileError || !profile) {
            console.warn(
              "⚠️ Profile not found after signup, creating manually..."
            );

            let createError = null;

            if (data.user) {
              const { error } = await supabase.from("user_profiles").insert({
                user_id: data.user.id,
                full_name:
                  fullName?.trim() || data.user.email?.split("@")[0] || "User",
                credits: 100,
                plan: "free",
              });
              createError = error;

              if (createError) {
                console.error(
                  "❌ Failed to create profile manually:",
                  createError
                );
              } else {
                console.log("✅ Profile created manually");
              }
            } else {
              console.error("❌ Cannot create profile: data.user is null");
            }
          } else {
            console.log("✅ Profile found after signup");
          }
        } catch (profileCheckError: unknown) {
          const typedProfileError = profileCheckError as SupabaseAuthError;
          console.error(
            "❌ Error checking/creating profile:",
            typedProfileError.message
          );
        }
      }

      return { data, error: null };
    } catch (error: unknown) {
      const typedError = error as SupabaseAuthError;
      console.error("💥 Sign up error:", typedError.message);
      return { data: null, error: typedError };
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{
    data: any;
    error: SupabaseAuthError | null;
  }> => {
    try {
      console.log("🔑 Attempting sign in for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log("🔑 Sign in result:", {
        user: data?.user?.email || "None",
        session: data?.session ? "Present" : "None",
        error: error?.message || "None",
      });
      return { data, error };
    } catch (error: unknown) {
      const typedError = error as SupabaseAuthError;
      console.error("💥 Sign in error:", typedError.message);
      return { data: null, error: typedError };
    }
  };

  const signOut = async (): Promise<{
    error: SupabaseAuthError | null;
  }> => {
    try {
      console.log("🚪 Attempting sign out");
      const { error } = await supabase.auth.signOut();
      console.log("🚪 Sign out result:", { error: error?.message || "None" });
      return { error };
    } catch (error: unknown) {
      const typedError = error as SupabaseAuthError;
      console.error("💥 Sign out error:", typedError.message);
      return { error: typedError };
    }
  };

  console.log("🎯 useAuth current state:", {
    user: user?.email || "None",
    loading,
    initialized,
    sessionExists: !!session,
  });

  return {
    user,
    session,
    loading,
    initialized,
    signUp,
    signIn,
    signOut,
  };
};
