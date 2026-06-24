import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/contexts/AppContext";
import { useAuthContext } from "@/contexts/AuthContext";
import { isCurrentUserProfileComplete, updateCurrentUser } from "@/services/timeflow";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthContext();
  const { currentUser, setCurrentUser, hydrated } = useAppContext();
  const [fullName, setFullName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [location, setLocation] = useState(currentUser.location);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFullName(currentUser.name);
    setRole(currentUser.role);
    setLocation(currentUser.location);
  }, [currentUser]);

  if (hydrated && isCurrentUserProfileComplete(currentUser)) {
    return <Navigate to="/" replace />;
  }

  const handleContinue = async () => {
    setIsSaving(true);

    try {
      const savedUser = await updateCurrentUser(
        {
          name: fullName.trim(),
          role: role.trim(),
          email: currentUser.email,
          location: location.trim(),
        },
        user?.id
      );

      setCurrentUser(savedUser);
      toast({
        title: "Profile saved",
        description: "Your workspace is ready.",
      });
      navigate("/", { replace: true });
    } catch (error) {
      toast({
        title: "Could not save profile",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(152,208,255,0.22),_transparent_32%),linear-gradient(180deg,_#FCFDFF_0%,_#F7FAFF_100%)] px-6 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-[980px] items-center justify-center">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_520px]">
          <div className="hidden lg:block">
            <p className="font-mono text-[13px] font-medium uppercase tracking-[0.26em] text-[#14B8A6]">
              Complete Your Profile
            </p>
            <h1 className="mt-10 max-w-[9ch] text-[72px] font-medium leading-[0.95] tracking-tight text-foreground">
              Before we drop you in, tell Timeflow who you are.
            </h1>
            <p className="mt-8 max-w-[34ch] text-[22px] leading-[1.55] text-muted">
              We already know your email from Google. Add the basics once so your drafts, reviews and future integrations feel personal from the start.
            </p>
          </div>

          <div className="rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-modal backdrop-blur lg:p-10">
            <div className="mb-10">
              <p className="text-[32px] font-medium tracking-tight text-foreground">Complete your profile</p>
              <p className="mt-3 max-w-[34ch] text-[16px] leading-7 text-muted">
                This takes a minute. You can edit it again later in settings.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <Label className="text-[11px] uppercase tracking-[0.18em] text-muted">Full name</Label>
                <Input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="mt-2 h-14 rounded-[16px] px-5 text-[15px]"
                  placeholder="Tetiana Dovgalenko"
                />
              </div>

              <div>
                <Label className="text-[11px] uppercase tracking-[0.18em] text-muted">Work email</Label>
                <Input value={currentUser.email} disabled className="mt-2 h-14 rounded-[16px] px-5 text-[15px] opacity-80" />
              </div>

              <div>
                <Label className="text-[11px] uppercase tracking-[0.18em] text-muted">Profession</Label>
                <Input
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="mt-2 h-14 rounded-[16px] px-5 text-[15px]"
                  placeholder=""
                />
              </div>

              <div>
                <Label className="text-[11px] uppercase tracking-[0.18em] text-muted">Location</Label>
                <Input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="mt-2 h-14 rounded-[16px] px-5 text-[15px]"
                  placeholder=""
                />
              </div>
            </div>

            <Button
              className="mt-8 h-14 w-full rounded-[16px] text-[15px]"
              onClick={handleContinue}
              disabled={isSaving || !fullName.trim() || !role.trim() || !location.trim()}
            >
              {isSaving ? "Saving..." : "Continue to Timeflow"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
