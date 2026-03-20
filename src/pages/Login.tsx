import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { hasSupabaseConfig } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import googleGIcon from "@/assets/google-g.svg";

const Login = () => {
  const { toast } = useToast();
  const { signInWithGoogle, signInWithMagicLink } = useAuthContext();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState<"google" | "email" | null>(null);

  const handleGoogleSignIn = async () => {
    setSubmitting("google");

    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        title: "Could not start Google sign in",
        description: "Please check your Supabase Google provider settings.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(null);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      return;
    }

    setSubmitting("email");

    try {
      await signInWithMagicLink(email.trim());
      toast({
        title: "Magic link sent",
        description: "Check your inbox and open the sign-in link on this device.",
      });
    } catch (error) {
      toast({
        title: "Could not send magic link",
        description: "Please verify your email auth settings in Supabase.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(152,208,255,0.22),_transparent_32%),linear-gradient(180deg,_#FCFDFF_0%,_#F7FAFF_100%)]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1460px] gap-16 px-6 py-12 lg:grid-cols-[minmax(0,1.08fr)_620px] lg:items-center lg:px-12">
        <div className="hidden min-w-0 pr-10 lg:block">
          <div className="max-w-[640px]">
            <p className="mb-12 text-[34px] font-medium tracking-tight text-foreground">Timeflow</p>

            <p className="font-mono text-[13px] font-medium uppercase tracking-[0.26em] text-[#14B8A6]">
              AI Timesheet Assistant
            </p>

            <h1 className="mt-10 max-w-[11ch] text-[74px] font-medium leading-[0.95] tracking-tight text-foreground">
              You work. <span className="whitespace-nowrap">AI fills in the <span className="text-[#14C8B8]">rest.</span></span>
            </h1>

            <p className="mt-8 max-w-[38ch] text-[23px] leading-[1.55] text-muted">
              Connect your tools, review what AI prepared, and confirm in seconds, not minutes.
            </p>

            <div className="mt-20 max-w-[560px] space-y-0">
              {[
                {
                  index: "01",
                  color: "bg-[hsl(199_100%_92%)] text-[hsl(210_45%_42%)]",
                  title: "Connect your signals",
                  pill: "AI Insights",
                  copy: "Link Figma, Calendar, Jira or browser activity. AI reads your day automatically with your permission.",
                },
                {
                  index: "02",
                  color: "bg-[hsl(131_52%_90%)] text-[hsl(145_40%_40%)]",
                  title: "Review the AI draft",
                  copy: "Every day a draft timesheet is ready. Edit, split or add entries manually if something needs a second look.",
                },
                {
                  index: "03",
                  color: "bg-[hsl(300_46%_91%)] text-[hsl(286_32%_46%)]",
                  title: "Confirm & submit",
                  copy: "One click and your day is logged. The manager sees the update and the week keeps moving cleanly.",
                },
              ].map((item, itemIndex, items) => (
                <div key={item.index} className={itemIndex < items.length - 1 ? "border-b border-border/70 pb-12" : "pb-0"}>
                  <div className={`flex items-start gap-6 ${itemIndex > 0 ? "pt-12" : "pt-0"}`}>
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[16px] font-semibold ${item.color}`}>
                      {item.index}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-[24px] font-medium tracking-tight text-foreground">{item.title}</p>
                        {item.pill && (
                          <span className="rounded-full bg-[hsl(206_76%_90%)] px-4 py-1 text-[11px] font-mono font-medium uppercase tracking-[0.18em] text-[hsl(210_40%_42%)]">
                            {item.pill}
                          </span>
                        )}
                      </div>
                      <p className="mt-3 max-w-[50ch] text-[18px] leading-[1.7] text-muted">
                        {item.copy}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full max-w-[560px] justify-self-end">
          <div className="rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-modal backdrop-blur lg:p-10">
            <div className="mb-8 lg:hidden">
              <p className="mb-4 text-[28px] font-medium tracking-tight text-foreground">Timeflow</p>
            </div>

            <div className="mb-10">
              <h2 className="text-[58px] font-medium leading-[0.98] tracking-tight text-foreground lg:text-[56px]">Sign in</h2>
              <p className="mt-4 max-w-[42ch] text-[18px] leading-[1.55] text-muted">
                Use Google for the smoothest setup, or send yourself a magic link if you just want a quick test login.
              </p>
            </div>

            {!hasSupabaseConfig && (
              <div className="mb-5 rounded-[16px] border border-[hsl(15_90%_88%)] bg-[hsl(20_100%_98%)] px-4 py-3 text-[13px] leading-6 text-[hsl(20_60%_35%)]">
                Add your Supabase keys to <code>.env</code> before using login on this machine.
              </div>
            )}

            <div className="space-y-4">
              <Button
                className="h-16 w-full rounded-[18px] text-[15px] font-medium"
                onClick={handleGoogleSignIn}
                disabled={!hasSupabaseConfig || submitting !== null}
              >
                <span className="flex items-center justify-center gap-4">
                  <img src={googleGIcon} alt="" className="h-7 w-7" />
                  <span>{submitting === "google" ? "Redirecting..." : "Continue with Google"}</span>
                </span>
              </Button>

              <div className="flex items-center gap-5 py-3">
                <div className="h-px flex-1 bg-border/80" />
                <span className="text-[12px] uppercase tracking-[0.18em] text-muted">or</span>
                <div className="h-px flex-1 bg-border/80" />
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] uppercase tracking-[0.18em] text-muted">
                  Work email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="h-16 rounded-[18px] px-5 text-[15px]"
                />
                <Button
                  variant="outline"
                  className="h-16 w-full rounded-[18px] text-[15px]"
                  onClick={handleMagicLink}
                  disabled={!hasSupabaseConfig || !email.trim() || submitting !== null}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {submitting === "email" ? "Sending..." : "Send magic link"}
                </Button>
              </div>
            </div>

            <div className="mt-10 border-t border-border/80 pt-8">
              <p className="text-[13px] leading-7 text-muted">
              After sign in, we create a starter profile for you automatically. You can refine it later in{" "}
              <Link to="/settings/profile" className="text-primary underline-offset-4 hover:underline">
                Profile settings
              </Link>
              .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
