import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Review from "@/pages/Review";
import WeekView from "@/pages/WeekView";
import Timesheets from "@/pages/Timesheets";
import ManagerView from "@/pages/ManagerView";
import Reports from "@/pages/Reports";
import Insights from "@/pages/Insights";
import { SettingsIntegrations, SettingsPrivacy, SettingsProfile, SettingsNotifications } from "@/pages/Settings";
import Approvals from "@/pages/Approvals";
import Notifications from "@/pages/Notifications";
import NotFound from "./pages/NotFound";
import ScrollToTop from "@/components/layout/ScrollToTop";
import RoleRouteSync from "@/components/layout/RoleRouteSync";
import Login from "@/pages/Login";
import { ProfileCompletionRoute, ProtectedRoute, PublicOnlyRoute } from "@/components/auth/RouteGuards";
import CompleteProfile from "@/pages/CompleteProfile";

const queryClient = new QueryClient();

const AppShell = () => (
  <ProtectedRoute>
    <AppProvider>
      <ProfileCompletionRoute>
        <RoleRouteSync />
        <Routes>
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route
            path="/*"
            element={
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/review" element={<Review />} />
                  <Route path="/week" element={<WeekView />} />
                  <Route path="/timesheets" element={<Timesheets />} />
                  <Route path="/manager" element={<ManagerView />} />
                  <Route path="/approvals" element={<Approvals />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/settings" element={<Navigate to="/settings/integrations" replace />} />
                  <Route path="/settings/integrations" element={<SettingsIntegrations />} />
                  <Route path="/settings/privacy" element={<SettingsPrivacy />} />
                  <Route path="/settings/profile" element={<SettingsProfile />} />
                  <Route path="/settings/notifications" element={<SettingsNotifications />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            }
          />
        </Routes>
      </ProfileCompletionRoute>
    </AppProvider>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route path="/*" element={<AppShell />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
