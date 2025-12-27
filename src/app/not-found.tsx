import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("Errors.notAvailable"); // Reusing translations

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-9xl font-bold text-primary opacity-20">404</h1>
      <h2 className="text-3xl font-bold mt-4 mb-2">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        We couldn't find the page you were looking for. It might have been removed, renamed, or doesn't exist.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/">Return Home</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/inventory">Browse Inventory</Link>
        </Button>
      </div>
    </div>
  );
}
