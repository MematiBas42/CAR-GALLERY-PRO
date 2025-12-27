"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Presentation Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="bg-red-500/10 p-6 rounded-full mb-6">
        <AlertTriangle className="w-16 h-16 text-red-500" />
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Something went wrong!</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        We encountered an unexpected error. Our team has been notified. Please try refreshing the page or return to the homepage.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => reset()} size="lg" className="flex gap-2">
          <RefreshCcw className="w-5 h-5" /> Try Again
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
      
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-8 p-4 bg-muted rounded-lg text-xs text-left overflow-auto max-w-full">
          {error.message}
        </pre>
      )}
    </div>
  );
}
