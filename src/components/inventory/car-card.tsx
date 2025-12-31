'use client';
import { routes } from "@/config/routes";
import { CarCardData, CarWithImages } from "@/config/types";
import { AnimatePresence } from "framer-motion";
import { Cog, Fuel, GaugeCircle, MessageCircle, Paintbrush2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import parse from "html-react-parser";
import React, { useEffect, useState, memo, useMemo } from "react";
import { Button } from "../ui/button";
import FavButton from "./fav-button";
import { useTranslations, useLocale } from "next-intl";
import ImgixImage from "../ui/imgix-image";
import { PriceDisplay } from "../shared/price-display";
import { SITE_CONFIG } from "@/config/constants";
import { cn, formatNumber } from "@/lib/utils";

interface CarCardProps {
  car: CarCardData;
  isFavourite: boolean;
  priority?: boolean;
}

const CarCard = memo(({ car, isFavourite, priority }: CarCardProps) => {
  const t = useTranslations("Car");
  const tEnums = useTranslations("Enums");
  const locale = useLocale();
  const [isFav, setIsFav] = useState(isFavourite);
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  // Sync internal state with prop
  useEffect(() => {
    setIsFav(isFavourite);
  }, [isFavourite]);

  const whatsappMessage = encodeURIComponent(`Hello, I am interested in the ${car.title}.`);
  const whatsappUrl = `${SITE_CONFIG.socials.whatsapp}?text=${whatsappMessage}`;

  const keyCarInfo = useMemo(() => [
    {
      id: "odoReading",
      icon: <GaugeCircle className="w-4 h-4" />,
      value: `${formatNumber(car.odoReading)} ${tEnums(`OdoUnit.${car.odoUnit}`)}`,
    },
    {
      id: "transmission",
      icon: <Cog className="w-4 h-4" />,
      value: car?.transmission ? tEnums(`Transmission.${car?.transmission}`) : null,
    },
    {
      id: "fuelType",
      icon: <Fuel className="w-4 h-4" />,
      value: car?.fuelType ? tEnums(`FuelType.${car.fuelType}`) : null,
    },
    {
      id: "colour",
      icon: <Paintbrush2 className="w-4 h-4" />,
      value: car?.colour ? tEnums(`Colour.${car.colour}`) : null,
    },
  ], [car, tEnums]);

  useEffect(() => {
    if (!isFav && pathname === routes.favourites) {
      setIsVisible(false);
    }
  }, [isFav, pathname]);

  return (
    <div
      key={car.id}
      id={car.slug || "slug"}
      className="bg-card relative h-full rounded-xl shadow-lg overflow-hidden flex flex-col border transition-shadow duration-300 hover:shadow-2xl"
    >
      <div className="aspect-car-card sm:aspect-car-card-sm relative rounded-t-xl overflow-hidden">
            <Link href={routes.singleClassified(car.slug || "slug")}>
              <ImgixImage
                placeholder="blur"
                blurDataURL={car.images[0]?.blurhash || ""}
                src={car.images[0]?.src || "/placeholder.png"}
                alt={car.images[0]?.alt || "Car Image"}
                fill={true}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                quality={60}
                smartCover={true}
                priority={priority}
              />
            </Link>
            <FavButton setIsFav={setIsFav} isFav={isFav} id={car.id} />
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-primary/95 text-primary-foreground font-bold px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-lg shadow-xl z-20">
              <PriceDisplay amount={car.price} showLocal={false} className="text-xs sm:text-sm lg:text-base" />
            </div>
          </div>
          
          <div className="p-3 sm:p-4 flex flex-col flex-grow"> 
            <div className="flex-grow flex items-center justify-center text-center px-1">
              <Link
                href={routes.singleClassified(car.slug || "slug")}
                className="text-base sm:text-lg md:text-xl font-bold line-clamp-2 transition-colors hover:text-primary leading-tight"
              >
                {car.title}
              </Link>
            </div>

            <div className="mt-auto pt-2 sm:pt-4 space-y-3 sm:space-y-6">
              <div className="pt-2 sm:pt-4 border-t border-white/5">
                <div className="text-[10px] sm:text-xs md:text-base text-muted-foreground grid grid-cols-2 gap-x-1.5 gap-y-1 sm:gap-x-4 sm:gap-y-2 w-full">
                  {keyCarInfo.map((info) => (
                    <div key={info.id} className="font-semibold flex items-center gap-x-1 sm:gap-x-2 min-w-0">
                      <span className="shrink-0 scale-[0.85] sm:scale-100 md:scale-110">{info.icon}</span>
                      <span className="leading-tight truncate sm:whitespace-normal">{info.value ? info.value : t("notAvailable")}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 sm:gap-2 w-full">
                <Button
                  className={cn(
                    "w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-bold h-auto min-h-8 sm:h-10 py-1.5 sm:py-0 gap-1 sm:gap-2 px-1 sm:px-2",
                    "text-[11px] sm:text-sm"
                  )}
                  asChild
                >
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row items-center justify-center text-center">
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" />
                    <span className="leading-tight whitespace-normal">{t("reserveViaWhatsapp")}</span>
                  </a>
                </Button>
                <Button className="w-full h-8 sm:h-10 text-[10px] sm:text-sm font-bold" asChild>
                  <Link href={routes.singleClassified(car.slug)}>{t("viewDetails")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
  );
}, (prevProps, nextProps) => {
    return (
        prevProps.isFavourite === nextProps.isFavourite &&
        prevProps.priority === nextProps.priority &&
        prevProps.car.id === nextProps.car.id &&
        prevProps.car.price === nextProps.car.price &&
        prevProps.car.status === nextProps.car.status &&
        prevProps.car.title === nextProps.car.title &&
        prevProps.car.images?.[0]?.src === nextProps.car.images?.[0]?.src
    );
});

CarCard.displayName = "CarCard";

export default CarCard;