import { Prisma } from "@prisma/client";
import React from "react";
import CarCarousel from "./car-carousel";
import Image from "next/image";
import { formatBodyType, formatColour, formatFuelType, formatNumber, formatOdometerUnit, formatPrice, formatTransmission } from "@/lib/utils";
import parse from "html-react-parser";
import { Button } from "../ui/button";
import Link from "next/link";
import { routes } from "@/config/routes";
import { MultiStepFormEnum } from "@/config/types";
import { CheckIcon, XIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PriceDisplay } from "../shared/price-display";
import { SITE_CONFIG } from "@/config/constants";
import {
	CarFrontIcon,
	CarIcon,
	
	Fingerprint,
	FuelIcon,
	GaugeIcon,
	PowerIcon,
	UsersIcon,
    MessageCircle,
	
} from "lucide-react";

type CarWithImagesAndMake = Prisma.ClassifiedGetPayload<{
  include: { make: true; images: true };
}>;

const CarView = async (props: CarWithImagesAndMake) => {
  const t = await getTranslations("Car");
  const tEnums = await getTranslations("Enums");

  const whatsappMessage = encodeURIComponent(`Hello, I am interested in the ${props.title}.`);
  const whatsappUrl = `${SITE_CONFIG.socials.whatsapp}?text=${whatsappMessage}`;

  const carFeatures = [
    {
        id: 1,
        icon:
            props.ulezCompliance === "EXEMPT" ? (
                <CheckIcon className="w-6 h-6 mx-auto text-green-500" />
            ) : (
                <XIcon className="w-6 h-6 mx-auto text-red-500" />
            ),
        label: tEnums(`ULEZ.${props.ulezCompliance}`),
    },
    {
        id: 2,
        icon: <Fingerprint className="w-6 h-6 mx-auto text-gray-500" />,
        label: props.vrm,
    },
    {
        id: 3,
        icon: <CarIcon className="w-6 h-6 mx-auto text-gray-500" />,
        label: tEnums(`BodyType.${props.bodyType}`),
    },
    {
        id: 4,
        icon: <FuelIcon className="w-6 h-6 mx-auto text-gray-500" />,
        label: tEnums(`FuelType.${props.fuelType}`),
    },
    {
        id: 5,
        icon: <PowerIcon className="w-6 h-6 mx-auto text-gray-500" />,
        label: tEnums(`Transmission.${props.transmission}`),
    },
    {
        id: 6,
        icon: <GaugeIcon className="w-6 h-6 mx-auto text-gray-500" />,
        label: `${formatNumber(props.odoReading)} ${tEnums(`OdoUnit.${props.odoUnit}`)}`,
    },
    {
        id: 7,
        icon: <UsersIcon className="w-6 h-6 mx-auto text-gray-500" />,
        label: props.seats,
    },
    {
        id: 8,
        icon: <CarFrontIcon className="w-6 h-6 mx-auto text-gray-500" />,
        label: props.doors,
    },
  ];

  return (
    <div className="flex flex-col container mx-auto px-4 md:px-0 py-12">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2">
          {/* carousel goes here */}
          <CarCarousel images={props.images} />
        </div>
        <div className="md:w-1/2 md:pl-8 mt-4 md:mt-0">
          <div className="flex flex-col md:flex-row items-center md:items-center">
            <Image
              src={props.make.image}
              alt={props.make.name}
              className="w-20 md:mr-4 mb-2 md:mb-0"
              width={120}
              height={120}
            />
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">
                {props.title}
              </h1>
            </div>
          </div>
          
          <div className="text-xl md:text-2xl lg:text-4xl font-bold my-4 w-full border border-slate-200
            flex flex-col sm:flex-row justify-center items-center rounded-xl py-8 md:py-12 gap-2 px-4 text-center">
              <span className="text-muted-foreground sm:text-foreground">{t("ourPrice")}</span>
              <PriceDisplay amount={props.price} className="text-2xl md:text-3xl lg:text-4xl" />
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <Button 
                asChild 
                className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-bold h-12 gap-2 shadow-md uppercase"
            >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 fill-current" />
                {t("reserveViaWhatsapp")}
                </a>
            </Button>

            <Button 
                className="uppercase font-bold py-3 px-6 rounded w-full h-12"
                asChild
            >
                <Link href={routes.reserve(props.slug , MultiStepFormEnum.WELCOME)}>
                    {t("reserveNow")}
                </Link>
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
            <span className="bg-gray-200 text-gray-800 
            text-sm font-medium px-2.5 py-2.5 rounded-md">
              {props.year}
            </span>
            <span className="bg-gray-200 text-gray-800 
            text-sm font-medium px-2.5 py-2.5 rounded-md">
              {formatNumber(props.odoReading)} {' '}
              {tEnums(`OdoUnit.${props.odoUnit}`)}
            </span>
            <span className="bg-gray-200 text-gray-800 
            text-sm font-medium px-2.5 py-2.5 rounded-md">
              {tEnums(`Colour.${props.colour}`)}
            </span>
            <span className="bg-gray-200 text-gray-800 
            text-sm font-medium px-2.5 py-2.5 rounded-md">
              {tEnums(`FuelType.${props.fuelType}`)}
            </span>
          </div>
          <div className="mb-4">
            {props.description && (
            <div className="prose dark:prose-invert max-w-none">
              {parse(props.description || "")}
            </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
              {carFeatures.map(({ id, icon, label }) => (
                <div key={id} className="bg-muted rounded-lg shadow-xs p-4 text-center flex items-center flex-col">
								{icon}
								<p className="text-sm font-medium mt-2">{label}</p>
							</div>
						))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarView;