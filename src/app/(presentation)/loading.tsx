export default function Loading() {
  return (
    <div className="w-full">
      {/* A simple top progress bar is already handled by NextTopLoader */}
      {/* This component ensures the rest of the layout doesn't jump too much */}
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-12 w-1/3 bg-muted rounded-md" />
          <div className="h-64 w-full bg-muted/50 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-muted/30 rounded-lg" />
            <div className="h-48 bg-muted/30 rounded-lg" />
            <div className="h-48 bg-muted/30 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}