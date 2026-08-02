"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
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

const REGION_CHANGE_EVENT = "ibirdchef-region-change";

function subscribeRegion(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === REGION_STORAGE_KEY || event.key === null) {
      onStoreChange();
    }
  };
  const onLocal = () => onStoreChange();

  window.addEventListener("storage", onStorage);
  window.addEventListener(REGION_CHANGE_EVENT, onLocal);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(REGION_CHANGE_EVENT, onLocal);
  };
}

function readStoredRegion(): ServiceRegion | "" {
  try {
    const stored = window.localStorage.getItem(REGION_STORAGE_KEY);
    return isServiceRegion(stored) ? stored : "";
  } catch {
    return "";
  }
}

function getServerRegionSnapshot(): ServiceRegion | "" {
  return "";
}

export function RegionProvider({ children }: { children: ReactNode }) {
  const region = useSyncExternalStore(
    subscribeRegion,
    readStoredRegion,
    getServerRegionSnapshot,
  );
  const ready = useSyncExternalStore(
    subscribeRegion,
    () => true,
    () => false,
  );

  const setRegion = useCallback((next: ServiceRegion | "") => {
    try {
      if (next) {
        window.localStorage.setItem(REGION_STORAGE_KEY, next);
      } else {
        window.localStorage.removeItem(REGION_STORAGE_KEY);
      }
    } catch {
      // Ignore storage access errors.
    }
    window.dispatchEvent(new Event(REGION_CHANGE_EVENT));
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
