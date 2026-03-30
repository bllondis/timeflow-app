import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { saveGoogleCalendarTokens } from "@/services/timeflow";

const GoogleCalendarCallback = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        if (!supabase) {
          throw new Error("Supabase is not configured");
        }

        const hash = window.location.hash.startsWith("#")
          ? new URLSearchParams(window.location.hash.slice(1))
          : new URLSearchParams();

        const hasOAuthTokens =
          hash.has("access_token") ||
          hash.has("refresh_token") ||
          hash.has("provider_token") ||
          hash.has("provider_refresh_token");

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!session?.user) {
          if (hasOAuthTokens) {
            throw new Error("We could not read the Google Calendar session from the callback.");
          }

          navigate("/settings/integrations", { replace: true });
          return;
        }

        if (session.provider_token) {
          await saveGoogleCalendarTokens({
            authUserId: session.user.id,
            accessToken: session.provider_token,
            refreshToken: session.provider_refresh_token,
            expiresAt: session.expires_at
              ? new Date(session.expires_at * 1000).toISOString()
              : null,
          });
        }

        if (active) {
          navigate("/settings/integrations", { replace: true });
        }
      } catch (error) {
        console.error(error);
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : JSON.stringify(error));
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-[480px] rounded-[24px] border border-border bg-card px-8 py-10 shadow-card text-center">
        <h1 className="font-medium text-[32px] tracking-tight mb-3">
          {errorMessage ? "Google Calendar connect failed" : "Connecting Google Calendar"}
        </h1>
        <p className="text-[16px] leading-7 text-muted">
          {errorMessage
            ? errorMessage
            : "We are saving your read-only calendar access and bringing you back to Integrations."}
        </p>
      </div>
    </div>
  );
};

export default GoogleCalendarCallback;
