import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";

const managerRoutes = new Set(["/manager", "/approvals", "/reports"]);

const RoleRouteSync = () => {
  const location = useLocation();
  const { role, setRole } = useAppContext();

  useEffect(() => {
    if (managerRoutes.has(location.pathname) && role !== "manager") {
      setRole("manager");
    }
  }, [location.pathname, role, setRole]);

  return null;
};

export default RoleRouteSync;
