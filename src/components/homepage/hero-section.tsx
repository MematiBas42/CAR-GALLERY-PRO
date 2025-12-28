import HomepageTaxonomyFilters from "@/components/homepage/homepage-filter";
import { Button } from "@/components/ui/button";
import { AwaitedPageProps } from "@/config/types";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SearchButton } from "@/components/homepage/search-button";
import { buildClassifiedFilterQuery } from "@/lib/utils";
import { routes } from "@/config/routes";
import { getTranslations } from "next-intl/server";

const HeroSection = async (props: AwaitedPageProps) => {
  const t = await getTranslations("Homepage.Hero");
  const { searchParams } = props;
  
  const filterParams = Object.entries(searchParams || {})
    .filter(([key, value]) => key !== "page" && value);
  const totalFiltersApplied = filterParams.length;
  const isFilterApplied = totalFiltersApplied > 0;

  const carsCount = await prisma.classified.count({
    where: buildClassifiedFilterQuery(searchParams),
  });

  const emptyMinMax = {
    _min: { year: 1900, price: 0, odoReading: 0 },
    _max: { year: new Date().getFullYear(), price: 1000000, odoReading: 1000000 }
  } as any;

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
                minMaxValue={emptyMinMax}
              />
            </div>
            <SearchButton initialCount={carsCount} label={t("discover")} />
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