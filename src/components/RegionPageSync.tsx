"use client";

import { useEffect } from "react";
import { useRegion } from "@/components/RegionProvider";
import type { ServiceRegion } from "@/lib/regions";

export default function RegionPageSync({ region }: { region: ServiceRegion }) {
  const { setRegion } = useRegion();

  useEffect(() => {
    setRegion(region);
  }, [region, setRegion]);

  return null;
}
