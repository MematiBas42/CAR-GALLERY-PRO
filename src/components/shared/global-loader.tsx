"use client";

import { useLoading } from "@/hooks/use-loading";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const GlobalLoader = () => {
  const isLoading = useLoading();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 right-6 z-[99999] pointer-events-none"
        >
          <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md border border-border px-4 py-2 rounded-full shadow-2xl flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-xs font-medium tracking-wider uppercase">
              Updating...
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};