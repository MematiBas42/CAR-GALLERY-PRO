"use client";
import React from "react";
import { CarWithImages } from "@/config/types";
import { TableCell, TableRow } from "../ui/table";
import Image from "next/image";
import { formatCarStatus, formatColour, formatPrice, getImageUrl } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { CarBadgeMap } from "@/config/constants";
import { format } from "date-fns";
import ActionButtons from "./ActionButtons";
import { useTranslations } from "next-intl";

const CarsTableRow = ({ car }: { car: CarWithImages }) => {
  const t = useTranslations("Enums");
  return (
    <TableRow className="text-gray-500 border-white/45">
      <TableCell className="font-medium hidden md:table-cell">{car.id}</TableCell>
      <TableCell className="p-0">
		<Image
		  src={getImageUrl(car.images?.[0]?.src)}
		  alt={car.images?.[0]?.alt || "Car Image"}
		  width={120}
		  height={100}
		  className="aspect-3/2 object-cover rounded w-16 h-12 md:w-[120px] md:h-auto"
        />
      </TableCell>
      <TableCell className="max-w-[100px] md:max-w-none truncate">{car.title}</TableCell>
      <TableCell className="">
        {formatPrice({
          price: car.price,
          currency: car.currency || "USD",
        })}
      </TableCell>
      <TableCell className="hidden md:table-cell">{car.vrm}</TableCell>
      <TableCell className="hidden md:table-cell">
        {t(`Colour.${car.colour}`)}
      </TableCell>
      <TableCell className="">
        <Badge variant={CarBadgeMap[car.status]}>
          {t(`ClassifiedStatus.${car.status}`)}
        </Badge>
      </TableCell>
        <TableCell className="hidden md:table-cell">
            {format(car.createdAt, "dd/MM/yyyy")}
        </TableCell>
        <TableCell className="hidden md:table-cell">
            {car.views}
        </TableCell>
        <TableCell className="flex gap-x-1 md:gap-x-2">
            <ActionButtons
                car={car}
                />
        </TableCell>
    </TableRow>
  );
};

export default CarsTableRow;