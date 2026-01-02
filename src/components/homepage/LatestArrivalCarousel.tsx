"use client";

import type { CarWithImages } from "@/config/types";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay, Keyboard, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import CarCard from "../inventory/car-card";
import SwiperButton from "../shared/swiper-button";
import HomepageTaxonomyFilters from "@/components/homepage/homepage-filter";
import { SearchButton } from "@/components/homepage/search-button";
import { HomepageClearFilters } from "@/components/homepage/homepage-clear-filters";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

interface LatestArrivalCarouselProps {
  cars: CarWithImages[];
  favourites: number[];
  searchParams?: any;
  carsCount?: number;
  emptyMinMax?: any;
}

export const LatestArrivalsCarousel = (props: LatestArrivalCarouselProps) => {
  const { cars, favourites, searchParams = {}, carsCount, emptyMinMax } = props;
  const t = useTranslations("Homepage.Hero");
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [canScroll, setCanScroll] = useState(false);

      const totalSlides = Object.keys(searchParams).length > 0 ? cars.length + 1 : cars.length;
  
  useEffect(() => {
    if (!swiperInstance) return;

    const checkScrollability = () => {
      // Use actual slide count vs slidesPerView as a fallback for scrollability check
      const isScrollable = (swiperInstance as any).virtualSize > (swiperInstance as any).size;
      setCanScroll(isScrollable);
    };

    checkScrollability();
    swiperInstance.on('update', checkScrollability);
    swiperInstance.on('resize', checkScrollability);

    return () => {
      swiperInstance.off('update', checkScrollability);
      swiperInstance.off('resize', checkScrollability);
    };
  }, [swiperInstance]);

  let arrowPrevClass = "left-0 md:left-4";
  let arrowNextClass = "right-0 md:right-4";

  if (totalSlides === 1) {
    arrowPrevClass = "left-[calc(50%-220px)] md:left-[calc(50%-260px)]";
    arrowNextClass = "right-[calc(50%-220px)] md:right-[calc(50%-260px)]";
  } else if (totalSlides === 2) {
    arrowPrevClass = "lg:left-[calc(50%-440px)] left-0 md:left-4";
    arrowNextClass = "lg:right-[calc(50%-440px)] right-0 md:right-4";
  }

  const handleInteractionStart = () => {
    if (swiperInstance && swiperInstance.autoplay.running) {
      swiperInstance.autoplay.stop();
    }
  };

  const handleInteractionEnd = () => {
    if (swiperInstance && !swiperInstance.autoplay.running) {
      swiperInstance.autoplay.start();
    }
  };

  const handleFocus = () => {
    if (swiperInstance) {
      swiperInstance.autoplay.stop();
      swiperInstance.allowTouchMove = false; 
    }
  };

  const handleBlur = () => {
    if (swiperInstance) {
      swiperInstance.autoplay.start();
      swiperInstance.allowTouchMove = true;
    }
  };

  return (
    <div className="mt-0 relative group w-full px-0 sm:px-12 md:px-24">
      <Swiper
        onSwiper={setSwiperInstance}
        speed={800}
        grabCursor={true}
        rewind={true}
        threshold={15} // Slightly higher threshold to prioritize vertical scroll
        noSwiping={true}
        noSwipingClass="no-swipe"
        noSwipingSelector="input, select, button, .no-swipe, [role='combobox']"
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        keyboard={{
          enabled: true,
        }}
        modules={[Navigation, Autoplay, Keyboard]}
        touchStartPreventDefault={false}
        touchMoveStopPropagation={true}
        spaceBetween={12}
        slidesPerView={1}
        centerInsufficientSlides={true}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 24 },
          1024: { slidesPerView: 3, spaceBetween: 32 },
          1536: { slidesPerView: 4, spaceBetween: 32 },
        }}
        className="!h-auto h-full !px-0 !pt-0 !pb-12"
      >
        {searchParams && (
          <SwiperSlide className="!h-auto h-full">
            <div
              onMouseEnter={handleInteractionStart}
              onMouseLeave={handleInteractionEnd}
              onFocusCapture={() => {
                if (swiperInstance) {
                  swiperInstance.allowTouchMove = false;
                  swiperInstance.autoplay.stop();
                }
              }}
              onBlurCapture={() => {
                if (swiperInstance) {
                  swiperInstance.allowTouchMove = true;
                  swiperInstance.autoplay.start();
                }
              }}
              // Prevent any touch event from reaching Swiper
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              className="group relative h-full w-full overflow-hidden rounded-3xl bg-card shadow-lg flex flex-col hover:border-primary/50 transition-all duration-300 antialiased touch-pan-y"
            >
              <div className="p-2 sm:p-3 flex flex-col h-full">
                <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar scrollbar-hide [&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:mb-1">
                  <HomepageTaxonomyFilters
                    searchParams={searchParams}
                    minMaxValue={emptyMinMax}
                  />
                </div>
                <div className="pt-2 mt-auto border-t border-white/5 space-y-1.5">
                  <SearchButton initialCount={carsCount ?? 0} label={t("discover")} size="sm" />
                  <div className="flex justify-center scale-90 origin-center">
                    <HomepageClearFilters />
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        )}

        {cars.map((car, index) => (
          <SwiperSlide key={car.id} className="!h-auto h-full">
            <CarCard 
                car={car} 
                isFavourite={favourites.includes(car.id)} 
                priority={index < 2}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <SwiperButton
        prevClassName={`${arrowPrevClass} latest-prev-button z-[60] transition-all duration-300 -left-8 sm:-left-6 lg:left-4 ${canScroll ? "opacity-100 md:opacity-0 md:group-hover:opacity-100" : "opacity-0 md:opacity-0 pointer-events-none"
          }`}
        nextClassName={`${arrowNextClass} latest-next-button z-[60] transition-all duration-300 -right-8 sm:-right-6 lg:right-4 ${canScroll ? "opacity-100 md:opacity-0 md:group-hover:opacity-100" : "opacity-0 md:opacity-0 pointer-events-none"
          }`}
        onPrevClick={() => {
          if (swiperInstance) swiperInstance.slidePrev();
        }}
        onNextClick={() => {
          if (swiperInstance) swiperInstance.slideNext();
        }}
        onMouseEnter={handleInteractionStart}
        onMouseLeave={handleInteractionEnd}
      />
    </div>
  );
};