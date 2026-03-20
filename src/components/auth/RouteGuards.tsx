import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAppContext } from "@/contexts/AppContext";
import { isCurrentUserProfileComplete } from "@/services/timeflow";

const FullPageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="rounded-[18px] border border-border bg-card px-6 py-4 text-[14px] text-muted shadow-card">
      Loading your workspace...
    </div>
  </div>
);

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <FullPageLoader />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const ProfileCompletionRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, hydrated } = useAppContext();
  const location = useLocation();

  if (!hydrated) {
    return <FullPageLoader />;
  }

  if (!isCurrentUserProfileComplete(currentUser) && location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace />;
  }

  if (isCurrentUserProfileComplete(currentUser) && location.pathname === "/complete-profile") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
