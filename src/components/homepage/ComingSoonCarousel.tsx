"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Keyboard, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import SwiperButton from "../shared/swiper-button";
import { CarWithImages } from '@/config/types';
import Link from "next/link";
import { routes } from "@/config/routes";
import ImgixImage from "../ui/imgix-image";
import { cn } from '@/lib/utils';

interface ComingSoonCarouselProps {
    cars: CarWithImages[];
}

const ComingSoonCard = ({ car }: { car: CarWithImages }) => {
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
                            car.images.map(image => (
                                <SwiperSlide key={image.id}>
                                    <ImgixImage
                                        src={image.src}
                                        alt={car.title || "Coming Soon"}
                                        fill
                                        className="object-cover transition-transform duration-1000 ease-in-out group-hover/card:scale-105"
                                        quality={80}
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
};


export const ComingSoonCarousel = ({ cars }: ComingSoonCarouselProps) => {
    const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
    const [canScroll, setCanScroll] = useState(false);

    useEffect(() => {
        if (!swiperInstance) return;
        const checkScrollability = () => {
            const slidesPerView = swiperInstance.params.slidesPerView;
            if (typeof slidesPerView === 'number') {
                setCanScroll(cars.length > slidesPerView);
            }
        };
        checkScrollability();
        swiperInstance.on('update', checkScrollability);
        swiperInstance.on('resize', checkScrollability);
        return () => {
            swiperInstance.off('update', checkScrollability);
            swiperInstance.off('resize', checkScrollability);
        };
    }, [swiperInstance, cars]);

    // Initially stop inner carousels
    useEffect(() => {
        if (swiperInstance) {
            swiperInstance.slides.forEach(slide => {
                const innerSwiper = (slide as any).swiper;
                if (innerSwiper) innerSwiper.autoplay.stop();
            });
        }
    }, [swiperInstance]);

    return (
        <div className="relative group max-w-7xl px-0 sm:px-4 md:px-12 mx-auto">
            <Swiper
                onSwiper={setSwiperInstance}
                speed={1000}
                spaceBetween={30}
                slidesPerView={1}
                centeredSlides={true}
                centerInsufficientSlides={true}
                loop={true}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                }}
                keyboard={{ enabled: true }}
                modules={[Autoplay, Navigation, Keyboard]}
                breakpoints={{
                    640: { slidesPerView: 2, centeredSlides: false },
                    1024: { slidesPerView: 3, centeredSlides: false },
                    1536: { slidesPerView: 4, centeredSlides: false },
                }}
                className="!pb-8 !overflow-visible !px-4 sm:!px-0" // Allow cards to overflow vertically
            >
                {cars.map((car) => (
                    <SwiperSlide key={car.id} className="h-auto">
                        <ComingSoonCard car={car} />
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Theme-aware Arrow Buttons */}
            <SwiperButton
                prevClassName={`-left-8 sm:-left-6 lg:left-4 z-30 transition-all duration-300 h-14 w-14 bg-background/60 dark:bg-card/60 backdrop-blur-md border border-white/10 ${
                    canScroll ? "opacity-100 md:opacity-0 md:group-hover:opacity-100" : "opacity-0 pointer-events-none"
                }`}
                nextClassName={`-right-8 sm:-right-6 lg:right-4 z-30 transition-all duration-300 h-14 w-14 bg-background/60 dark:bg-card/60 backdrop-blur-md border border-white/10 ${
                    canScroll ? "opacity-100 md:opacity-0 md:group-hover:opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onPrevClick={() => swiperInstance?.slidePrev()}
                onNextClick={() => swiperInstance?.slideNext()}
                onMouseEnter={() => swiperInstance?.autoplay.stop()}
                onMouseLeave={() => swiperInstance?.autoplay.start()}
            />
        </div>
    );
};