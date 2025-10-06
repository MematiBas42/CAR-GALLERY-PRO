import CarView from "@/components/car/car-view";
import { routes } from "@/config/routes";
import { PageProps } from "@/config/types";
import { prisma } from "@/lib/prisma";
import { ClassifiedStatus } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import React from "react";

const CarPage = async (props: PageProps) => {
  const params = await props.params;
  const slug = decodeURIComponent(params?.slug as string);
  if (!slug) notFound();

  const car = await prisma.classified.findUnique({
    where: {
      slug: slug,
    },
    include: {
      make: true,
      images: true,
    },
  });

  if (!car) notFound();
  if (car.status === ClassifiedStatus.SOLD) {
    redirect(routes.notAvailable(slug));
  }
  return <CarView
   {...car}
  />;
};

export default CarPage;
