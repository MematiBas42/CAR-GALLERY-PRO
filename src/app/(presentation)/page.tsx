import { PageProps } from "@/config/types";
import HeroSection from "@/components/homepage/hero-section";
import { FeaturesSection } from "@/components/homepage/features-section";
import LastestArrival from "@/components/homepage/lastest-arrival";
import ComingSoon from "@/components/homepage/coming-soon";
import OurBrandSection from "@/components/homepage/our-brands-section";
import TestimonialsSection from "@/components/homepage/testimonials-section";
import LocationSection from "@/components/homepage/location-section";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("HomePage");
  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  };
}

export default async function HomePage(props: PageProps) {
  const searchParams = await props.searchParams;
  return (
    <>
      <HeroSection searchParams={searchParams} />
      <Suspense fallback={<div className="h-96 animate-pulse bg-muted" />}>
        <LastestArrival />
      </Suspense>
      <Suspense fallback={<div className="h-64 animate-pulse bg-background" />}>
        <ComingSoon />
      </Suspense>
      <FeaturesSection />
      <TestimonialsSection />
      <OurBrandSection  />
      <LocationSection />
    </>
  );
}