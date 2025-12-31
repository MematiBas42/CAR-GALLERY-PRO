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
import { Button } from "../ui/button";
import Link from "next/link";

const HeroSection = async (props: AwaitedPageProps) => {
  const { searchParams } = props;

  const [t, carsCount] = await Promise.all([
    getTranslations("Homepage.Hero"),
    prisma.classified.count({
        where: buildClassifiedFilterQuery(searchParams),
    })
  ]);
  
  const filterParams = Object.entries(searchParams || {})
    .filter(([key, value]) => key !== "page" && value);
  const totalFiltersApplied = filterParams.length;
  const isFilterApplied = totalFiltersApplied > 0;

  const emptyMinMax = {
    _min: { year: 1900, price: 0, odoReading: 0 },
    _max: { year: new Date().getFullYear(), price: 1000000, odoReading: 1000000 }
  } as any;

  return (
    <section
      className="relative flex flex-col items-center justify-start lg:justify-center min-h-[600px] lg:min-h-[calc(100vh-4rem)] w-full bg-cover bg-center pt-4 lg:pt-0 pb-12"
      style={{
        backgroundImage: `url('/assets/hero-bg.jpg')`,
      }}
    >
      <div className="absolute inset-0 bg-gray-900 opacity-30 dark:opacity-50" />
      
      {/* Main Container */}
      <div className="container relative z-10 flex flex-col gap-2 lg:gap-4 w-full max-w-[1920px] mx-auto py-2">

        {/* TOP: "Your Next Chapter" Text */}
        <div className="w-full flex justify-center px-4 shrink-0">
            <div className="px-6 py-3 md:px-10 md:py-4 bg-black/20 backdrop-blur-md rounded-2xl text-center max-w-5xl w-full mx-auto border border-white/5 shadow-xl">
                <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl uppercase font-bold text-white leading-none tracking-tight text-balance drop-shadow-lg">
                {t("title")}
                </h1>
                <h2 className="mt-1 uppercase text-[10px] sm:text-sm md:text-lg lg:text-xl text-white/90 font-medium tracking-wide text-balance">
                {t("subtitle")}
                </h2>
            </div>
        </div>

        {/* BOTTOM: Carousel (Filter is inside now) */}
        <div className="w-full flex flex-col items-center gap-0">
            
            {/* Title */}
            <h2 className="uppercase text-[10px] md:text-sm font-bold tracking-wider text-white px-3 py-0.5 bg-black/30 backdrop-blur-md rounded-full border border-white/10 shadow-lg mb-1">
                Latest Arrivals
            </h2>

            {/* Carousel Container */}
            <div className="w-full lg:scale-95 origin-center px-6 lg:px-0">
                <Suspense fallback={<div className="h-[400px] md:h-[500px] w-full animate-pulse bg-white/5 rounded-2xl border border-white/10" />}>
                    <div className="[&_section]:bg-transparent [&_section]:py-0 [&_div.container]:max-w-full [&_div.container]:px-0">
                        <LastestArrival 
                            searchParams={searchParams}
                            carsCount={carsCount}
                            emptyMinMax={emptyMinMax}
                        />
                    </div>
                </Suspense>
            </div>

            {/* View All Cars Button - Flush with carousel */}
            <div className="mt-[-12px] md:mt-[-24px] flex justify-center relative z-30">
                <Button
                    asChild
                    variant="secondary"
                    className="h-8 md:h-10 px-8 rounded-full font-bold transition-all duration-300 shadow-2xl border border-white/10
                    bg-gray-200 text-gray-900 hover:bg-gray-300 
                    dark:bg-white dark:text-black dark:hover:bg-gray-100"
                >
                    <Link href={routes.inventory}>
                        {t("viewAll")}
                    </Link>
                </Button>
            </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
