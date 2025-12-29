import { prisma } from '@/lib/prisma'
import { ClassifiedStatus } from '@prisma/client'
import React from 'react'
import { getTranslations } from "next-intl/server";
import ImgixImage from "../ui/imgix-image";
import Link from "next/link";
import { routes } from "@/config/routes";

const ComingSoon = async () => {
    const t = await getTranslations("Homepage.ComingSoon");
    
    const cars = await prisma.classified.findMany({
        where: {
            status: ClassifiedStatus.COMING_SOON,
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 4,
        include: {
            images: {
                take: 1
            }
        }
    });

    if (cars.length === 0) return null;

  return (
    <section className="py-16 bg-background">
			<div className="container mx-auto px-4 max-w-[80vw]">
				<h2 className="uppercase text-xl md:text-2xl font-bold tracking-[0.3em] text-primary/80 text-center mb-12">
					{t("title")}
				</h2>
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {cars.map((car) => (
                        <Link 
                            key={car.id} 
                            href={routes.singleClassified(car.slug)}
                            className="group block"
                        >
                            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted border border-border/50 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:-translate-y-2">
                                <ImgixImage
                                    src={car.images[0]?.src || "/placeholder.jpg"}
                                    alt={car.title || "Coming Soon"}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    quality={75}
                                    smartCover={true}
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <p className="text-[10px] md:text-xs font-black text-white truncate uppercase tracking-widest text-center bg-primary/20 backdrop-blur-md py-2 px-3 rounded-full border border-white/10">
                                        {car.title}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
				</div>
			</div>
		</section>
  )
}

export default ComingSoon
