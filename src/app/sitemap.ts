import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rimglobal.com";

  // Static pages
  const routes = [
    "",
    "/inventory",
    "/financing",
    "/our-philosophy",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
    "/disclaimer",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic car pages
  const cars = await prisma.classified.findMany({
    where: { status: "LIVE" },
    select: { slug: true, updatedAt: true },
  });

  const carRoutes = cars.map((car) => ({
    url: `${baseUrl}/inventory/${car.slug}`,
    lastModified: car.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...routes, ...carRoutes];
}
