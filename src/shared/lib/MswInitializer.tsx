"use client";
import { useEffect } from "react";
import { initMockServiceWorker } from "@/shared/lib/msw";

export function MswInitializer() {
  useEffect(() => {
    initMockServiceWorker();
  }, []);
  return null;
} 