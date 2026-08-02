"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  isServiceRegion,
  REGION_STORAGE_KEY,
  type ServiceRegion,
} from "@/lib/regions";

type RegionContextValue = {
  region: ServiceRegion | "";
  setRegion: (region: ServiceRegion | "") => void;
  ready: boolean;
};

const RegionContext = createContext<RegionContextValue | null>(null);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<ServiceRegion | "">("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(REGION_STORAGE_KEY);
      if (isServiceRegion(stored)) {
        setRegionState(stored);
      }
    } catch {
      // Ignore storage access errors.
    }
    setReady(true);
  }, []);

  const setRegion = useCallback((next: ServiceRegion | "") => {
    setRegionState(next);
    try {
      if (next) {
        window.localStorage.setItem(REGION_STORAGE_KEY, next);
      } else {
        window.localStorage.removeItem(REGION_STORAGE_KEY);
      }
    } catch {
      // Ignore storage access errors.
    }
  }, []);

  const value = useMemo(
    () => ({ region, setRegion, ready }),
    [region, setRegion, ready],
  );

  return (
    <RegionContext.Provider value={value}>{children}</RegionContext.Provider>
  );
}

export function useRegion(): RegionContextValue {
  const value = useContext(RegionContext);
  if (!value) {
    throw new Error("useRegion must be used within RegionProvider");
  }
  return value;
}
