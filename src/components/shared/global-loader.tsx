"use client";

import { useLoading, setIsLoading } from "@/hooks/use-loading";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

// Navigation Watcher to clear loading state when route changes
const NavigationWatcher = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // When pathname or searchParams change, it means navigation finished
    setIsLoading(false, "navigation");
  }, [pathname, searchParams]);

  return null;
};

export const GlobalLoader = () => {
  const isLoading = useLoading();
  const t = useTranslations("Filters"); // Borrowing 'loading' from Filters if it exists, or fallback

  return (
    <>
      <NavigationWatcher />
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="fixed top-20 right-4 md:right-8 z-[99999] pointer-events-none"
          >
            <div className="bg-background/80 backdrop-blur-xl border border-primary/20 px-5 py-2.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center gap-3">
              <div className="relative">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div className="absolute inset-0 blur-sm bg-primary/20 animate-pulse rounded-full"></div>
              </div>
              <span className="text-xs font-bold tracking-widest uppercase text-foreground/80">
                {t("loading") || "Loading..."}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};