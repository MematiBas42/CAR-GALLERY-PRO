import HomepageTaxonomyFilters from "@/components/homepage/homepage-filter";
import { AwaitedPageProps } from "@/config/types";
import { prisma } from "@/lib/prisma";
import { SearchButton } from "@/components/homepage/search-button";
import { HomepageClearFilters } from "@/components/homepage/homepage-clear-filters";
import { buildClassifiedFilterQuery } from "@/lib/utils";
import { routes } from "@/config/routes";
import { getTranslations } from "next-intl/server";
import LastestArrival from "./lastest-arrival";
import { Suspense } from "react";

const HeroSection = async (props: AwaitedPageProps) => {
  const t = await getTranslations("Homepage.Hero");
  const { searchParams } = props;
  
  const filterParams = Object.entries(searchParams || {})
    .filter(([key, value]) => key !== "page" && value);
  const totalFiltersApplied = filterParams.length;
  const isFilterApplied = totalFiltersApplied > 0;

  const carsCount = await prisma.classified.count({
    where: buildClassifiedFilterQuery(searchParams),
  });

  const emptyMinMax = {
    _min: { year: 1900, price: 0, odoReading: 0 },
    _max: { year: new Date().getFullYear(), price: 1000000, odoReading: 1000000 }
  } as any;

  return (
    <section
      className="relative flex flex-col items-center justify-center h-[calc(100vh-4rem)] min-h-[600px] w-full bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `url('/assets/hero-bg.jpg')`,
      }}
    >
      <div className="absolute inset-0 bg-gray-900 opacity-30 dark:opacity-50" />
      
      {/* Main Container */}
      <div className="container relative z-10 flex flex-col gap-4 lg:gap-6 w-full h-full max-w-[1920px] mx-auto justify-center py-4">

        {/* TOP: "Your Next Chapter" Text */}
        <div className="w-full flex justify-center px-4">
            <div className="px-6 py-4 md:px-10 md:py-5 bg-black/20 backdrop-blur-md rounded-2xl text-center max-w-5xl w-full mx-auto border border-white/5 shadow-xl">
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl uppercase font-bold text-white leading-none tracking-tight text-balance drop-shadow-lg">
                {t("title")}
                </h1>
                <h2 className="mt-2 uppercase text-xs sm:text-sm md:text-lg lg:text-xl text-white/90 font-medium tracking-wide text-balance">
                {t("subtitle")}
                </h2>
            </div>
        </div>

        {/* BOTTOM: Carousel (Filter is inside now) */}
        <div className="w-full flex flex-col items-center gap-1">
            
            {/* Title */}
            <h2 className="uppercase text-sm md:text-lg font-bold tracking-wider text-white px-4 py-1 bg-black/30 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                Latest Arrivals
            </h2>

            {/* Carousel Container */}
            <div className="w-full lg:scale-95 origin-center px-6 lg:px-0">
                <Suspense fallback={<div className="h-[300px] w-full animate-pulse bg-white/5 rounded-2xl border border-white/10" />}>
                    <div className="[&_section]:bg-transparent [&_section]:py-0 [&_div.container]:max-w-full [&_div.container]:px-0">
                        <LastestArrival 
                            searchParams={searchParams}
                            carsCount={carsCount}
                            emptyMinMax={emptyMinMax}
                        />
                    </div>
                </Suspense>
            </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
