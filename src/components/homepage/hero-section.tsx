import HomepageTaxonomyFilters from "@/components/homepage/homepage-filter";
import { Button } from "@/components/ui/button";
import { imageSources } from "@/config/constants";
import { AwaitedPageProps, PageProps } from "@/config/types";
import { imgixLoader } from "@/lib/imgix-loader";
import Image from "next/image";
import Link from "next/link";
import { ClassifiedStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SearchButton } from "@/components/homepage/search-button";
import { buildClassifiedFilterQuery } from "@/lib/utils";
import { routes } from "@/config/routes";
import { getTranslations } from "next-intl/server";

const HeroSection = async (props: AwaitedPageProps) => {
  const t = await getTranslations("Homepage.Hero");
  const { searchParams } = props;
  const totalFiltersApplied = Object.keys(searchParams || {}).length;
  const isFilterApplied = totalFiltersApplied > 0;

  const carsCount = await prisma.classified.count({
    where: buildClassifiedFilterQuery(searchParams),
  });
  const minMaxResult = await prisma.classified.aggregate({
    where: { status: ClassifiedStatus.LIVE },
    _min: {
      year: true,
      price: true,
      odoReading: true,
    },
    _max: {
      price: true,
      year: true,
      odoReading: true,
    },
  });
  return (
    <section
      className="relative flex items-start lg:items-center justify-center min-h-[calc(100dvh-4rem)] pt-20 pb-12 lg:py-0 bg-cover bg-center"
      style={{
        backgroundImage: `url('/assets/hero-bg.jpg')`,
      }}
    >
      <div className="absolute inset-0 bg-gray-900 opacity-75" />
      <div className="container lg:grid space-y-12 grid-cols-2 items-center relative z-10">
        <div className="px-10 lg:px-0">
          <h1
            className="text-2xl text-center lg:text-left md:text-4xl lg:text-8xl uppercase
             font-bold text-white"
          >
            {t("title")}
          </h1>
          <h2 className="mt-4 uppercase text-center lg:text-left text-base md:text-3xl lg:text-4xl text-white">
            {t("subtitle")}
          </h2>
        </div>
        <div
          className="max-w-md w-full mx-auto p-6 bg-secondary 
          sm:rounded-xl shadow-lg"
        >
          <div className="space-y-4">
            <div className="space-y-2 flex flex-col w-full gap-x-4">
              <HomepageTaxonomyFilters
                searchParams={searchParams}
                minMaxValue={minMaxResult}
              />
            </div>
            <SearchButton count={carsCount} label={t("discover")} />
            {isFilterApplied && (
							<Button
								asChild
								variant="outline"
								className="w-full hover:bg-accent"
							>
								<Link href={routes.home}>
									{t("clearFilters")} ({totalFiltersApplied})
								</Link>
							</Button>
						)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
