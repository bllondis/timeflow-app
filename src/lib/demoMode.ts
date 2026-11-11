export const DEMO_MODE_STORAGE_KEY = "timeflow-demo-mode";
export const DEMO_USER_ID = "timeflow-demo-user-v1";
let demoModeMemory = false;

export const isDemoModeActive = () => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    demoModeMemory = window.localStorage.getItem(DEMO_MODE_STORAGE_KEY) === "true";
    return demoModeMemory;
  } catch {
    return demoModeMemory;
  }
};

export const setDemoModeActive = (active: boolean) => {
  if (typeof window === "undefined") {
    return;
  }

  demoModeMemory = active;

  try {
    if (active) {
      window.localStorage.setItem(DEMO_MODE_STORAGE_KEY, "true");
      return;
    }

    window.localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
  } catch {
    // Demo mode still works for the current tab when storage is unavailable.
  }
};
