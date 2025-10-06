"use client";
import { routes } from "@/config/routes";
import { Classified, Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { CarWithImages, Favourites, MultiStepFormEnum } from "@/config/types";
import HtmlParser from "../shared/htmlParser";
import { Cog, Fuel, GaugeCircle, Paintbrush2 } from "lucide-react";
import {
  formatColour,
  formatFuelType,
  formatNumber,
  formatOdometerUnit,
  formatPrice,
  formatTransmission,
} from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";
import FavButton from "./fav-button";
import { usePathname } from "next/navigation";
interface CarCardProps {
  car: CarWithImages;
  favourites: number[];
}

const getKeyCarInfo = (car: CarWithImages) => {
  return [
    {
      id: "odoReading",
      icon: <GaugeCircle className="w-4 h-4" />,
      value: `${formatNumber(car.odoReading)} ${formatOdometerUnit(car.odoUnit)}`,
    },
    {
      id: "transmission",
      icon: <Cog className="w-4 h-4" />,
      value: car?.transmission ? formatTransmission(car?.transmission) : null,
    },
    {
      id: "fuelType",
      icon: <Fuel className="w-4 h-4" />,
      value: car?.fuelType ? formatFuelType(car.fuelType) : null,
    },
    {
      id: "colour",
      icon: <Paintbrush2 className="w-4 h-4" />,
      value: car?.colour ? formatColour(car.colour) : null,
    },
  ];
};

const CarCard = ({ car, favourites }: CarCardProps) => {
  const [isFav, setIsFav] = useState(favourites.includes(car.id));
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();
  useEffect(() => {
    if (!isFav && pathname === routes.favourites) {
      setIsVisible(false);
    }
  }, [isFav, pathname]);
  return (
    <AnimatePresence>
      {isVisible && (
         <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          key={car.id}
          id={car.slug || "slug"}
         className="bg-white relative rounded-md shadow-md overflow-hidden flex flex-col">
        <div className="aspect-3/2 relative">
          <Link href={routes.singleClassified(car.slug || "slug")}>
            <Image
              placeholder="blur"
              blurDataURL={car.images[0]?.blurhash || ""}
              src={car.images[0]?.src || "/placeholder.png"}
              alt={car.images[0]?.alt || "Car Image"}
              fill={true}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              quality={25}
            />
          </Link>
          <FavButton 
          setIsFav={setIsFav}
          isFav={isFav}
          id={car.id}
          />
          <div className="absolute top-2.5 right-3.5 bg-primary text-slate-50 font-bold px-2 py-1 rounded">
            <div className="text-xs lg:text-base xl:text-lg font-semibold">
              {formatPrice({
                price: car.price,
                currency:  "EUR",
              })}
            </div>
          </div>
        </div>
        <div className="p-4 flex flex-col space-y-3">
          <Link
            href={routes.singleClassified(car.slug || "slug")}
            className="text-sm md:text-base lg:text-lg font-semibold line-clamp-1 
        transition-colors hover:text-primary"
          >
            {car.title}
          </Link>
          {car.description && (
            <div className="text-xs md:text-sm xl:text-base text-gray-500 line-clamp-2">
              <HtmlParser html={car.description} />
              &nbsp;
            </div>
          )}
          <ul
            className="text-xs md:text-sm text-gray-600 xl:flex grid grid-cols-1
      grid-rows-4 md:grid-cols-2 md:grid-rows-4 items-center justify-between w-full"
          >
            {getKeyCarInfo(car).map((info) => (
              <li
                key={info.id}
                className="font-semibold flex xl:flex-col items-center gap-x-1.5"
              >
                {info.icon} {info.value ? info.value : "N/A"}
              </li>
            ))}
          </ul>
          <div
            className="mt-4 flex flex-col lg:flex-row space-y-2
      lg:space-y-0 lg:gap-x-2 w-full"
          >
            <Button
              className="flex-1 transition-colors hover:border-white
        hover:bg-primary hover:text-white py-2 lg:py-2.5 h-full
        text-xs md:text-sm xl:text-base"
              asChild
              variant={"outline"}
            >
              <Link
                href={routes.reserve(
                  car.slug || "slug",
                  MultiStepFormEnum.WELCOME
                )}
              >
                Reserve
              </Link>
            </Button>
            <Button
              className="flex-1 py-2 lg:py-2.5 h-full text-xs 
         md:text-sm xl:text-base"
              asChild
              size={"sm"}
            >
              <Link href={routes.singleClassified(car.slug)}>View details</Link>
            </Button>
          </div>
        </div>
      </motion.div>
      )}
     
    </AnimatePresence>
  );
};

export default CarCard;
