import { pageSchema } from "@/app/schemas/page.schema";
import CarCard from "@/components/inventory/car-card";
import CustomPagination from "@/components/shared/custom-pagination";
import { CARS_PER_PAGE } from "@/config/constants";
import { routes } from "@/config/routes";
import { Favourites, PageProps } from "@/config/types";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis-store";
import { getSourceId } from "@/lib/source-id";
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
  const favIds = favourites ? favourites.ids : [];

  // Get only LIVE classifieds from the favorites list
  const classifieds = await prisma.classified.findMany({
    where: { 
        id: { in: favIds },
        status: "LIVE"
    },
    include: { images: { take: 1 } },
    skip: offset,
    take: CARS_PER_PAGE,
  });

  // Check if any favorite car is no longer LIVE and cleanup if necessary
  const liveIds = classifieds.map(c => c.id);
  const totalLiveCount = await prisma.classified.count({
      where: { id: { in: favIds }, status: "LIVE" }
  });

  // If there's a mismatch, it means some cars were sold/deleted. Cleanup Redis.
  if (favIds.length > 0 && liveIds.length < favIds.length) {
      const actualLiveIds = await prisma.classified.findMany({
          where: { id: { in: favIds }, status: "LIVE" },
          select: { id: true }
      }).then(res => res.map(r => r.id));

      if (sourceId) {
        await redis.set(sourceId, { ids: actualLiveIds });
        // Optional: Also sync with DB if needed, but Redis is the primary source for the counter
      }
  }

  const totalPages = Math.ceil(totalLiveCount / CARS_PER_PAGE);

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
							favourites={liveIds}
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
