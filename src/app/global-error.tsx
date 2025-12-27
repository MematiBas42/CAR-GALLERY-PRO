"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-background font-sans">
          <h1 className="text-4xl font-bold mb-4">Critical System Error</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            A critical error has occurred that affected the entire application. We apologize for the inconvenience.
          </p>
          <Button onClick={() => reset()} size="lg">
            Restart Application
          </Button>
        </div>
      </body>
    </html>
  );
}
