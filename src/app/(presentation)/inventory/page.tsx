import CarCard from "@/components/inventory/car-card";
import CarsList from "@/components/inventory/cars-list";
import DialogFilters from "@/components/inventory/DialogFilters";
import { InventorySkeleton } from "@/components/inventory/inventory-skeleton";
import Sidebar from "@/components/inventory/sidebar";
import CustomPagination from "@/components/shared/custom-pagination";
import { CARS_PER_PAGE } from "@/config/constants";
import { routes } from "@/config/routes";
import { AwaitedPageProps, Favourites, PageProps } from "@/config/types";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis-store";
import { getSourceId } from "@/lib/source-id";
import { buildClassifiedFilterQuery } from "@/lib/utils";
import { ClassifiedStatus, Prisma } from "@prisma/client";
import React, { Suspense } from "react";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SEO");
  return {
    title: t("inventory.title"),
    description: t("inventory.description"),
  };
}

const getInventory = async (searchParams: AwaitedPageProps["searchParams"]) => {
  const validPage = z
    .string()
    .transform((value) => Math.max(Number(value), 1))
    .optional()
    .parse(searchParams?.page);

  const page = validPage ? validPage : 1;
  const offset = (page - 1) * CARS_PER_PAGE;
  
  return prisma.classified.findMany({
    where: buildClassifiedFilterQuery(searchParams),
    select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        odoReading: true,
        odoUnit: true,
        transmission: true,
        fuelType: true,
        colour: true,
        bodyType: true,
        status: true,
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
};

const InventoryPage = async (props: PageProps) => {
  const t = await getTranslations("Inventory");
  const searchParams = await props.searchParams;
  const cars = await getInventory(searchParams);
 
  const count = await prisma.classified.count({
    where: buildClassifiedFilterQuery(searchParams),
  });

  const minMaxresult = await prisma.classified.aggregate({
    where: {
      status: ClassifiedStatus.LIVE,
    },
    _min: {
      year: true,
      price: true,
      odoReading: true,
    }, 
    _max: {
      price: true,
      year: true,
      odoReading: true,
    },
  })
  const sourceId = await getSourceId();
  const favs = await redis.get<Favourites>(sourceId ?? "");

  const totalPages = Math.ceil(count / CARS_PER_PAGE);
  return (
    <div className="flex">
      {/* <Sidebar/> */}
      <Sidebar minMaxValue={minMaxresult} searchParams={searchParams} />
      <div className="flex-1 p-4 bg-background">
        {/* add xl flex-row if u want */}
        <div className="flex space-y-2 flex-col items-stretch justify-center pb-4 -mt-1">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-sm md:text-base lg:text-xl font-semibold min-w-fit">
              {t("carsAvailable", { count })}
            </h2>
            {/* <DialogFilters/> */}
            <DialogFilters 
              searchParams={searchParams}
              minMaxValue={minMaxresult}
              count={count}
            />
          </div>
          <CustomPagination
            baseURL={routes.inventory}
            totalPages={totalPages}
            styles={{
              paginationRoot: "justify-end hidden lg:flex",
              paginationPrevious: "",
              paginationNext: "",
              paginationLink: "border active:border",
              paginationLinkActive: "bg-primary text-primary-foreground",
            }}
          />
          <Suspense
            fallback={<InventorySkeleton />}
          >
            <CarsList
              cars={cars}
              favourites={favs ? favs.ids : []}
            />
          </Suspense>
        </div>

        <div className="mt-8 flex justify-center lg:justify-end pb-8">
          <CustomPagination 
            baseURL={routes.inventory}
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
    </div>
  );
};

export default InventoryPage;
