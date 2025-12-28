"use client";

import { useState, useEffect } from "react";

const LOADING_EVENT = "global_loading_state_change";
let pendingRequests = 0;

export function setIsLoading(loading: boolean) {
  if (typeof window !== "undefined") {
    if (loading) pendingRequests++;
    else pendingRequests = Math.max(0, pendingRequests - 1);
    
    window.dispatchEvent(new CustomEvent(LOADING_EVENT, { detail: pendingRequests > 0 }));
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