import { AwaitedPageProps } from "@/config/types";
import { SearchButton } from "@/components/homepage/search-button";
import { HomepageClearFilters } from "@/components/homepage/homepage-clear-filters";
import { routes } from "@/config/routes";
import { getTranslations } from "next-intl/server";
import LastestArrival from "./lastest-arrival";
import { Suspense } from "react";
import { Button } from "../ui/button";
import Link from "next/link";

import { HeroVideo } from "./hero-video";

const HeroSection = async (props: AwaitedPageProps) => {
  const { searchParams } = props;

  const t = await getTranslations("Homepage.Hero");

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
                        <LastestArrival />
                    </div>
                </Suspense>
            </div>

            {/* View All Cars Button - The "Click Magnet" */}
            <div className="mt-[-12px] md:mt-[-24px] flex justify-center relative z-30 group/cta">
                {/* 1. Pulse Ring (Breathing Glow) */}
                <div className="absolute inset-0 rounded-full bg-white/20 blur-xl scale-110 animate-pulse group-hover/cta:animate-none group-hover/cta:scale-125 transition-all duration-500 pointer-events-none" />
                
                {/* 2. Magnetic Glow (Backlight on Hover) */}
                <div className="absolute -inset-1 rounded-full bg-linear-to-r from-primary/50 via-white/50 to-primary/50 opacity-0 group-hover/cta:opacity-100 blur-lg transition-opacity duration-500 pointer-events-none" />

                <Button
                    asChild
                    variant="secondary"
                    className="relative h-12 md:h-14 px-16 rounded-full text-sm md:text-base font-black transition-all duration-500 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] border border-white/20
                    bg-white/90 backdrop-blur-md text-black hover:bg-white hover:scale-110 hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.6)] uppercase tracking-[0.2em] overflow-hidden"
                >
                    <Link href={routes.inventory} className="relative z-10 flex items-center gap-2">
                        {/* Shimmer Effect (Light Reflection) */}
                        <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-25deg] animate-shimmer pointer-events-none" />
                        
                        <span>{t("viewAll")}</span>
                        {/* Animated Arrow Icon */}
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-transform group-hover/cta:translate-x-1"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
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
