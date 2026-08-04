"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearDevice,
  createDevice,
  readDevice,
  type StoredDevice,
  saveDevice,
} from "@/utils/device";

/** Reads after mount — localStorage isn't available during the server render. */
export function useDevice() {
  const [device, setDevice] = useState<StoredDevice | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDevice(readDevice());
    setReady(true);
  }, []);

  const provision = useCallback(() => {
    const next = createDevice();
    saveDevice(next);
    setDevice(next);
    return next;
  }, []);

  const forget = useCallback(() => {
    clearDevice();
    setDevice(null);
  }, []);

  return { device, ready, provision, forget };
}
