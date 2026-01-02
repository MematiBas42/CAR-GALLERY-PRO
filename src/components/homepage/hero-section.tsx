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

import { HeroVideo } from "./hero-video";

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
      className="relative flex flex-col items-center justify-start min-h-[600px] lg:min-h-[calc(100vh-4rem)] w-full bg-cover bg-center pt-2 lg:pt-6 pb-12"
      style={{
        backgroundImage: `url('/assets/hero-bg.jpg')`,
      }}
    >
      <div className="absolute inset-0 bg-gray-900 opacity-30 dark:opacity-50" />
      
      {/* Main Container */}
      <div className="container relative z-10 flex flex-col gap-4 lg:gap-8 w-full max-w-[1920px] mx-auto py-2">

        {/* TOP: Carousel (Now at the very top) */}
        <div className="w-full flex flex-col items-center gap-y-4">
            
            {/* Title */}
            <h2 className="uppercase text-sm md:text-base font-black tracking-[0.25em] text-white px-6 py-2 bg-white/10 md:backdrop-blur-md rounded-full border border-white/20 md:shadow-xl shrink-0">
                Latest Arrivals
            </h2>

            {/* Carousel Container */}
            <div className="w-full px-6 lg:px-0">
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

            {/* View All Cars Button */}
            <div className="mt-[-12px] md:mt-[-24px] flex justify-center relative z-30">
                <Button
                    asChild
                    variant="secondary"
                    className="h-10 md:h-12 px-12 rounded-full text-sm md:text-base font-black transition-all duration-300 shadow-2xl border border-white/10
                    bg-white text-black hover:bg-gray-100 hover:scale-105 uppercase tracking-wider"
                >
                    <Link href={routes.inventory}>
                        {t("viewAll")}
                    </Link>
                </Button>
            </div>
        </div>

        {/* BOTTOM: Punchy Marketing Text */}
        <div className="w-full flex justify-center px-4 mt-4">
            <div className="text-center max-w-4xl space-y-2">
                <div className="w-fit mx-auto px-4 py-1 bg-black/20 backdrop-blur-sm rounded-full">
                    <p className="text-slate-300 text-xs md:text-sm font-semibold tracking-widest uppercase">
                        {t("marketingSubtitle")}
                    </p>
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-2xl">
                    {t("marketingTitle")}
                </h1>
            </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
