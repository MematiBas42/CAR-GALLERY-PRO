import React from 'react'
import { getComingSoonCars } from '@/app/_actions/car';
import { ComingSoonCarousel } from './ComingSoonCarousel';
import { getTranslations } from "next-intl/server";
import { getSourceId } from '@/lib/source-id';
import { redis } from '@/lib/redis-store';
import { Favourites } from '@/config/types';

const ComingSoon = async () => {
    const cars = await getComingSoonCars();
    const t = await getTranslations("Homepage.ComingSoon");
    
    const sourceId = await getSourceId();
	const favourites = await redis.get<Favourites>(sourceId || "");

    if (cars.length === 0) return null;

    return (
        <section className="pt-8 sm:pt-12 pb-0 bg-gray-50/50 dark:bg-white/5 border-t border-white/5">
			<div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col items-center mb-8 sm:mb-12 text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground/90">
                        {t("title")}
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        {t("description")}
                    </p>
                </div>
                
                <ComingSoonCarousel cars={cars} favourites={favourites ? favourites.ids : []} />
			</div>
		</section>
    )
}

export default ComingSoon;
