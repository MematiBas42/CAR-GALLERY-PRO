"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCcw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Panel Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-gray-900 rounded-xl border border-red-500/20">
      <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold text-white mb-2">Admin Panel Error</h1>
      <p className="text-gray-400 max-w-lg mb-8">
        The admin interface encountered a problem while processing your request. You can try to reset the current view or return to the dashboard.
      </p>
      
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="secondary" className="flex gap-2">
          <RefreshCcw className="w-4 h-4" /> Reset View
        </Button>
        <Button asChild variant="outline" className="flex gap-2">
          <Link href="/admin/dashboard">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
        </Button>
      </div>

      <div className="mt-12 w-full text-left">
        <p className="text-xs font-mono text-red-400 mb-2">Technical Details:</p>
        <div className="p-4 bg-black/40 rounded border border-white/5 font-mono text-xs text-gray-500 overflow-auto max-h-40">
          {error.stack || error.message}
        </div>
      </div>
    </div>
  );
}
