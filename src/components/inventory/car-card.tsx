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

  // Dynamic Labels Logic
  const labels = [];
  if (car.status === "RESERVED") {
      labels.push({ text: "Sale Pending", color: "bg-amber-500 text-white" });
  } else {
      if (car.isLatestArrival) {
          labels.push({ text: "Just Arrived", color: "bg-blue-600 text-white" });
      }
      if (car.previousPrice && car.previousPrice > car.price) {
          const discount = car.previousPrice - car.price;
          // Format discount nicely (e.g. $500 off)
          const discountText = `Price Drop`; 
          labels.push({ text: discountText, color: "bg-red-600 text-white" });
      }
  }

  return (
    <div
      key={car.id}
      id={car.slug || "slug"}
      className="bg-card relative h-full rounded-3xl shadow-md md:shadow-lg overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-xl md:hover:shadow-2xl"
    >
      <div className="aspect-car-card sm:aspect-car-card-sm relative rounded-t-3xl overflow-hidden group/image">
            <Link href={routes.singleClassified(car.slug || "slug")} className="block w-full h-full relative">
              {/* Optimized Ambilight Effect (Mobile & Desktop) */}
              <div className="absolute inset-0 z-0 transform scale-110 blur-lg opacity-60">
                 <ImgixImage
                    src={car.images[0]?.src || "/placeholder.png"}
                    alt=""
                    fill={true}
                    sizes="10vw" 
                    quality={5} /* Ultra low quality for performance */
                    className="object-cover"
                    aria-hidden="true"
                 />
              </div>

              {/* Main Image */}
              <ImgixImage
                placeholder="empty"
                src={car.images[0]?.src || "/placeholder.png"}
                alt={car.images[0]?.alt || "Car Image"}
                fill={true}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                quality={60}
                smartCover={true}
                priority={priority}
                className="relative z-10 transition-transform duration-500 group-hover/image:scale-105"
              />
            </Link>
            
            {/* Dynamic Labels Overlay */}
            <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 pointer-events-none">
                {labels.map((label, idx) => (
                    <span key={idx} className={cn(
                        "px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold shadow-md uppercase tracking-wider",
                        label.color
                    )}>
                        {label.text}
                    </span>
                ))}
            </div>

            <FavButton setIsFav={setIsFav} isFav={isFav} id={car.id} />
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-primary/95 text-primary-foreground font-bold px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-lg shadow-xl z-20">
              <PriceDisplay amount={car.price} showLocal={false} className="text-xs sm:text-sm lg:text-base" />
            </div>
          </div>
          
          <div className="p-1.5 sm:p-2 flex flex-col flex-grow"> 
            <div className="flex items-center justify-center text-center px-1 mb-1 min-h-[2.5rem]">
              <Link
                href={routes.singleClassified(car.slug || "slug")}
                className="text-xs sm:text-sm md:text-base font-bold line-clamp-2 transition-colors hover:text-primary leading-tight"
              >
                {car.title}
              </Link>
            </div>

            <div className="space-y-2 mt-auto">
              <div className="pt-1 border-t border-white/5">
                <div className="text-[10px] xs:text-[11px] sm:text-sm md:text-base text-muted-foreground grid grid-cols-2 gap-x-1.5 gap-y-0.5 sm:gap-x-4 sm:gap-y-1 w-full">
                  {keyCarInfo.map((info) => (
                    <div key={info.id} className="font-semibold flex items-center gap-x-1 sm:gap-x-2 min-w-0">
                      <span className="shrink-0 scale-[0.85] xs:scale-[0.95] sm:scale-100 md:scale-110">{info.icon}</span>
                      <span className="leading-none truncate sm:whitespace-normal">{info.value ? info.value : t("notAvailable")}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                className="w-full h-7 sm:h-9 text-[10px] sm:text-sm font-bold bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 border-none transition-colors" 
                asChild
              >
                  <Link href={routes.singleClassified(car.slug)}>{t("viewDetails")}</Link>
              </Button>
            </div>
          </div>

          <Button
            className={cn(
              "w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-bold h-10 sm:h-12 rounded-none border-none",
              "text-[12px] sm:text-sm uppercase tracking-wider"
            )}
            asChild
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4 fill-current shrink-0" />
              <span>{t("reserveViaWhatsapp")}</span>
            </a>
          </Button>
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