import { pageSchema } from "@/app/schemas/page.schema";
import CarCard from "@/components/inventory/car-card";
import CustomPagination from "@/components/shared/custom-pagination";
import { CARS_PER_PAGE } from "@/config/constants";
import { routes } from "@/config/routes";
import { Favourites, PageProps } from "@/config/types";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis-store";
import { getSourceId } from "@/lib/source-id";
import { ClassifiedStatus } from "@prisma/client";
import React from "react";
import { z } from "zod";
import { getTranslations } from "next-intl/server";

const FavsPage = async (props: PageProps) => {
  const t = await getTranslations("Favourites");
  const searchParams = await props.searchParams;
  const validPage = pageSchema.parse(searchParams?.page);

  // get the current page
  const page = validPage ? validPage : 1;

  // calculate the offset
  const offset = (page - 1) * CARS_PER_PAGE;

  const sourceId = await getSourceId();
  const favourites = await redis.get<Favourites>(sourceId ?? "");
  const favIds = favourites?.ids || [];

  // Get only LIVE classifieds from the favorites list
  const classifieds = await prisma.classified.findMany({
    where: { 
        id: { in: favIds },
        status: ClassifiedStatus.LIVE
    },
    select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        previousPrice: true,
        odoReading: true,
        odoUnit: true,
        transmission: true,
        fuelType: true,
        colour: true,
        bodyType: true,
        status: true,
        isLatestArrival: true,
        images: {
            select: {
                id: true,
                src: true,
                alt: true,
                blurhash: true,
                classifiedId: true,
                isMain: true,
            },
            take: 1,
        }
    },
    skip: offset,
    take: CARS_PER_PAGE,
  });

  // Atomic sync check
  const totalLiveCount = await prisma.classified.count({
      where: { id: { in: favIds }, status: ClassifiedStatus.LIVE }
  });

  // Devils Advocate: Cleanup only if absolutely necessary to save Redis writes
  if (favIds.length > 0 && totalLiveCount < favIds.length) {
      // Run cleanup as a side effect (non-blocking in many environments, but here we await for data integrity)
      const liveIdsInDb = await prisma.classified.findMany({
          where: { id: { in: favIds }, status: ClassifiedStatus.LIVE },
          select: { id: true }
      }).then(res => res.map(r => r.id));

      if (sourceId) {
        await redis.set(sourceId, { ids: liveIdsInDb });
      }
  }

  const totalPages = Math.ceil(totalLiveCount / CARS_PER_PAGE);
  const liveIds = classifieds.map(c => c.id);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[80dvh]">
			<h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
      
      <div className="mb-6 flex justify-end">
        <CustomPagination
          baseURL={routes.favourites}
          totalPages={totalPages}
          styles={{
            paginationRoot: "justify-end hidden lg:flex",
            paginationPrevious: "",
            paginationNext: "",
            paginationLink: "border active:border",
            paginationLinkActive: "bg-primary text-primary-foreground",
          }}
        />
      </div>

			<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
				{classifieds.map((classified) => {
					return (
						<CarCard
							key={classified.id}
							car={classified}
							isFavourite={true}
						/>
					);
				})}
			</div>


			<div className="mt-8 flex justify-center lg:justify-end pb-8">
				<CustomPagination
					baseURL={routes.favourites}
					totalPages={totalPages}
					styles={{
						paginationRoot: "flex",
						paginationPrevious: "",
						paginationNext: "",
						paginationLink: "border active:border",
						paginationLinkActive: "bg-primary text-primary-foreground",
					}}
				/>
			</div>
		</div>
  );
};

export default FavsPage;
