"use client";

import { useState, useEffect } from "react";

const LOADING_EVENT = "global_loading_state_change";
const activeTasks = new Set<string>();

export function setIsLoading(loading: boolean, taskId: string = "default") {
  if (typeof window !== "undefined") {
    if (loading) activeTasks.add(taskId);
    else activeTasks.delete(taskId);
    
    window.dispatchEvent(new CustomEvent(LOADING_EVENT, { detail: activeTasks.size > 0 }));
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
