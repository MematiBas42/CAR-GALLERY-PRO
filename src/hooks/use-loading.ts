"use client";

import { useState, useEffect } from "react";

const LOADING_EVENT = "global_loading_state_change";

export function setIsLoading(loading: boolean) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(LOADING_EVENT, { detail: loading }));
  }
}

export function useLoading() {
  const [isLoading, setInternalLoading] = useState(false);

  useEffect(() => {
    const handler = (e: any) => setInternalLoading(e.detail);
    window.addEventListener(LOADING_EVENT, handler);
    return () => window.removeEventListener(LOADING_EVENT, handler);
  }, []);

  return isLoading;
}
