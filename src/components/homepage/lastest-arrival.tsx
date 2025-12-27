import { Favourites } from '@/config/types'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis-store'
import { getSourceId } from '@/lib/source-id'
import { ClassifiedStatus } from '@prisma/client'
import React from 'react'
import { LatestArrivalsCarousel } from './LatestArrivalCarousel'
import { getTranslations } from "next-intl/server";

const LastestArrival = async () => {
    const t = await getTranslations("Homepage.LatestArrivals");
    
    // Fetch all potential candidates in ONE query
    // We fetch cars that are either manually selected OR are among the 6 newest
    const cars = await prisma.classified.findMany({
        where: {
            status: ClassifiedStatus.LIVE,
        },
        orderBy: [
            { isLatestArrival: 'desc' }, // Manually selected ones first
            { createdAt: 'desc' }        // Then by date
        ],
        take: 10, // Limit to top 10 total
        include: {
            images: true
        }
    });

    // Filter logic: If we have manually selected ones, show ONLY them (up to 10)
    // If we have NONE manually selected, the query already returned the latest 10 by date.
    // Let's refine: If any car has isLatestArrival, show only those.
    const manuallySelected = cars.filter(c => c.isLatestArrival);
    const finalCars = manuallySelected.length > 0 ? manuallySelected : cars.slice(0, 6);

    const sourceId = await getSourceId();
	const favourites = await redis.get<Favourites>(sourceId || "");

  return (
    <section className="py-16 sm:py-24 bg-secondary">
			<div className="container mx-auto max-w-[80vw]">
				<h2 className="mt-2 uppercase text-2xl font-bold tracking-tight text-foreground sm:text-4xl text-center">
					{t("title")}
				</h2>
				<LatestArrivalsCarousel
					cars={finalCars}
					favourites={favourites ? favourites.ids : []}
				/>
			</div>
		</section>
  )
}

export default LastestArrival
