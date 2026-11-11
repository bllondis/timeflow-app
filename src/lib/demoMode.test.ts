import { beforeEach, describe, expect, it } from "vitest";
import {
  DEMO_MODE_STORAGE_KEY,
  isDemoModeActive,
  setDemoModeActive,
} from "@/lib/demoMode";

describe("demo mode storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("is disabled by default", () => {
    expect(isDemoModeActive()).toBe(false);
  });

  it("persists and clears demo mode", () => {
    setDemoModeActive(true);

    expect(isDemoModeActive()).toBe(true);
    expect(window.localStorage.getItem(DEMO_MODE_STORAGE_KEY)).toBe("true");

    setDemoModeActive(false);

    expect(isDemoModeActive()).toBe(false);
    expect(window.localStorage.getItem(DEMO_MODE_STORAGE_KEY)).toBeNull();
  });
});
