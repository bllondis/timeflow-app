import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeGoogleCalendarOAuth } from "@/services/timeflow";

const GoogleCalendarCallback = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        await completeGoogleCalendarOAuth();
        if (active) {
          navigate("/settings/integrations", { replace: true });
        }
      } catch (error) {
        console.error(error);
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "We could not finish the Google Calendar connection."
          );
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
