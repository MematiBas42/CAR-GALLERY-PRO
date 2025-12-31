import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SectionSkeletonProps {
  type?: "vertical" | "horizontal";
  hasHeader?: boolean;
}

export const SectionSkeleton = ({ type = "vertical", hasHeader = true }: SectionSkeletonProps) => {
  return (
    <div className={cn(
        "container mx-auto px-4 sm:px-6 md:px-12",
        type === "vertical" ? "py-24" : "py-16"
    )}>
      {hasHeader && (
        <div className="flex flex-col items-center mb-16 text-center max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-10 w-3/4 rounded-lg" />
          <Skeleton className="h-6 w-1/2 rounded-lg" />
        </div>
      )}
      {/* Mimic Swiper Layout to prevent jump */}
      <div className="flex gap-6 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="min-w-full sm:min-w-[calc(50%-1.5rem)] lg:min-w-[calc(25%-1.5rem)] space-y-4 shrink-0">
            <Skeleton 
              className={cn(
                "w-full rounded-[1.5rem] sm:rounded-[2rem]",
                type === "vertical" ? "aspect-[2/3] sm:aspect-[3/4]" : "aspect-video sm:aspect-[4/3]"
              )} 
            />
            <div className="space-y-2">
              <Skeleton className="h-6 w-2/3 mx-auto" />
              {type === "vertical" && <Skeleton className="h-1 w-10 mx-auto" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};