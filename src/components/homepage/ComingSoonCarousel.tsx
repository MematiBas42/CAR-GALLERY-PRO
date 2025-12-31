"use client";

import React, { useState, useEffect, useRef, memo } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Keyboard, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/autoplay";
import SwiperButton from "../shared/swiper-button";
import { CarCardData, CarWithImages } from '@/config/types';
import Link from "next/link";
import { routes } from "@/config/routes";
import ImgixImage from "../ui/imgix-image";
import { cn } from '@/lib/utils';

interface ComingSoonCarouselProps {
    cars: CarCardData[];
    favourites: number[];
}

const ComingSoonCard = memo(({ car, isFavourite, priority }: { car: CarCardData, isFavourite: boolean, priority?: boolean }) => {
    const innerSwiperRef = useRef<SwiperType | null>(null);

    const startInnerAutoplay = () => innerSwiperRef.current?.autoplay.start();
    const stopInnerAutoplay = () => {
        // Stop and reset to the first slide for a consistent experience
        if (innerSwiperRef.current) {
            innerSwiperRef.current.autoplay.stop();
            innerSwiperRef.current.slideTo(0, 0); // Reset instantly
        }
    };

    return (
        <Link 
            href={routes.singleClassified(car.slug)}
            className="group/card block relative h-full"
            onMouseEnter={startInnerAutoplay}
            onMouseLeave={stopInnerAutoplay}
            onTouchStart={startInnerAutoplay}
            onTouchEnd={stopInnerAutoplay}
            onTouchCancel={stopInnerAutoplay}
        >
            <div className={cn(
                "relative aspect-[2/3] sm:aspect-[3/4] overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] bg-card border shadow-xl",
                "border-black/10 dark:border-white/10",
                "transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
                "group-hover/card:shadow-2xl group-hover/card:shadow-primary/40 dark:group-hover/card:shadow-primary/60 group-hover/card:-translate-y-3 group-hover/card:border-primary/50"
            )}>
                {/* Inner Swiper for Image transitions */}
                <div className="absolute inset-0">
                    <Swiper
                        onSwiper={(swiper) => {
                            innerSwiperRef.current = swiper;
                            swiper.autoplay.stop(); // Stop autoplay initially
                        }}
                        modules={[Autoplay, EffectFade]}
                        effect="fade"
                        fadeEffect={{ crossFade: true }}
                        speed={1000}
                        allowTouchMove={false}
                        autoplay={{
                            delay: 1200,
                            disableOnInteraction: true,
                        }}
                        className="w-full h-full"
                    >
                        {car.images && car.images.length > 0 ? (
                            car.images.map((image, idx) => (
                                <SwiperSlide key={image.id}>
                                    <ImgixImage
                                        src={image.src}
                                        alt={car.title || "Coming Soon"}
                                        fill
                                        className="object-cover transition-transform duration-1000 ease-in-out group-hover/card:scale-105"
                                        quality={80}
                                        priority={priority && idx === 0}
                                    />
                                </SwiperSlide>
                            ))
                        ) : (
                            <SwiperSlide>
                                <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-secondary-foreground/10 flex items-center justify-center p-12">
                                    <div className="w-full h-full border-2 border-dashed border-primary/20 rounded-[2rem] flex items-center justify-center">
                                        <span className="text-primary/10 font-black text-8xl rotate-12 select-none uppercase">RIM</span>
                                    </div>
                                </div>
                            </SwiperSlide>
                        )}
                    </Swiper>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 transition-opacity duration-500 group-hover/card:opacity-70" />
                </div>

                {/* Luxury Details Badge - BLUR REMOVED */}
                <div className="absolute top-6 left-6 z-20 transition-transform duration-500">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-primary blur-lg opacity-30 group-hover/card:opacity-50 transition-opacity" />
                        <span className="relative px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] shadow-lg border border-white/20 block">
                            Coming Soon
                        </span>
                    </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 z-20">
                    <div className="space-y-3 translate-y-6 group-hover/card:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
                        <div className="space-y-1">
                            <h3 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tighter drop-shadow-md">
                                {car.title?.replace(/^0\s+/, '')}
                            </h3>
                        </div>
                        <div className="h-1 w-10 group-hover/card:w-full bg-primary transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] delay-100" />
                    </div>
                </div>

                {/* Hover Shine Effect - with mix-blend-mode */}
                <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-tr from-white/0 via-white/40 to-white/0 transform -translate-x-[150%] group-hover/card:translate-x-[150%] transition-transform duration-1000 ease-in-out opacity-30 mix-blend-overlay pointer-events-none" />
            </div>
        </Link>
    );
});

ComingSoonCard.displayName = "ComingSoonCard";

export const ComingSoonCarousel = ({ cars, favourites }: ComingSoonCarouselProps) => {
    const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
    const [canScroll, setCanScroll] = useState(false);
    const totalSlides = cars.length;

    useEffect(() => {
        if (!swiperInstance) return;

        const checkScrollability = () => {
            if (swiperInstance) {
                const isScrollable = (swiperInstance as any).virtualSize > (swiperInstance as any).size;
                setCanScroll(isScrollable);
            }
        };

        checkScrollability();
        swiperInstance.on('update', checkScrollability);
        swiperInstance.on('resize', checkScrollability);

        return () => {
            swiperInstance.off('update', checkScrollability);
            swiperInstance.off('resize', checkScrollability);
        };
    }, [swiperInstance, totalSlides]);

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

    return (
        <div className="relative group w-full px-0 sm:px-12 md:px-24">
            <Swiper
                onSwiper={setSwiperInstance}
                speed={800}
                grabCursor={true}
                rewind={true}
                threshold={15}
                noSwiping={true}
                noSwipingClass="no-swipe"
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
                spaceBetween={12}
                slidesPerView={1}
                centerInsufficientSlides={true}
                breakpoints={{
                    640: { slidesPerView: 2, spaceBetween: 24 },
                    1024: { slidesPerView: 3, spaceBetween: 32 },
                    1536: { slidesPerView: 4, spaceBetween: 32 },
                }}
                className="!h-auto h-full !px-2 sm:!px-0 !pb-12"
            >
                {cars.map((car, index) => (
                    <SwiperSlide key={car.id} className="!h-auto h-full">
                        <ComingSoonCard 
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