import React from 'react'
import { getComingSoonCars } from '@/app/_actions/car';
import { ComingSoonCarousel } from './ComingSoonCarousel';
import { getTranslations } from "next-intl/server";

const ComingSoon = async () => {
    const cars = await getComingSoonCars();
    const t = await getTranslations("Homepage.ComingSoon");

    if (cars.length === 0) return null;

    return (
        <section className="pt-24 pb-0 bg-linear-to-b from-background to-secondary/20 border-t border-white/5">
			<div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col items-center mb-16 text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground/90">
                        {t("title")}
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        {t("description")}
                    </p>
                </div>
                
                <ComingSoonCarousel cars={cars} />
			</div>
		</section>
    )
}

export default ComingSoon;
