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

    // Global click listener to detect navigation
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (
        anchor && 
        anchor.href && 
        anchor.href.startsWith(window.location.origin) && 
        !anchor.href.includes("#") &&
        anchor.target !== "_blank" &&
        !e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey
      ) {
        // Only trigger for internal links that aren't anchors or new tabs
        if (anchor.href !== window.location.href) {
            setIsLoading(true, "navigation");
        }
      }
    };

    window.addEventListener("click", clickHandler);

    return () => {
      window.removeEventListener(LOADING_EVENT, handler);
      window.removeEventListener("click", clickHandler);
    };
  }, []);

  return isLoading;
}
