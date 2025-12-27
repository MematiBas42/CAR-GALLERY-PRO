import CarView from "@/components/car/car-view";
import { routes } from "@/config/routes";
import { PageProps } from "@/config/types";
import { prisma } from "@/lib/prisma";
import { ClassifiedStatus } from "@prisma/client";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import React from "react";

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const slug = decodeURIComponent(params?.slug as string);
  
  const car = await prisma.classified.findUnique({
    where: { slug },
    include: { make: true, model: true, images: true }
  });

  if (!car) return { title: "Car Not Found" };

  const title = `${car.year} ${car.make.name} ${car.model.name} - RIM GLOBAL`;
  const description = car.description?.substring(0, 160) || `Check out this ${car.title} at RIM GLOBAL.`;
  const image = car.images[0]?.src || "/assets/logo.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    }
  };
}

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
