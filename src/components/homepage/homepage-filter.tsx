"use client";

import { SidebarProps } from "../inventory/sidebar";
import { parseAsString, useQueryStates } from "nuqs";
import TaxonomyFilters from "../inventory/TaxonomyFilters";
import { RangeFilter } from "../inventory/RangeFilters";
import { useTranslations } from "next-intl";
import React from "react";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { homepageFilterSchema, HomepageClearFilters } from "./homepage-clear-filters";
import { setIsLoading } from "@/hooks/use-loading";
import { Badge } from "../ui/badge";

interface HomepageTaxonomyFiltersProps extends SidebarProps {}

const HomepageTaxonomyFilters = ({
  minMaxValue,
  searchParams,
}: HomepageTaxonomyFiltersProps) => {
  const [isPending, startTransition] = React.useTransition();
  const t = useTranslations("Filters");
  
  // Safe extraction of min/max values with sensible defaults
  const _minYear = minMaxValue?._min?.year ?? 1900;
  const _minPrice = minMaxValue?._min?.price ?? 0;
  const _maxYear = minMaxValue?._max?.year ?? new Date().getFullYear();
  const _maxPrice = minMaxValue?._max?.price ?? 1000000;

  const [query, setState] = useQueryStates(homepageFilterSchema, { 
      shallow: true,
      startTransition 
  });

  const { ranges } = useTaxonomy();

  React.useEffect(() => {
    setIsLoading(isPending, "homepage-filter-update");
    return () => setIsLoading(false, "homepage-filter-update");
  }, [isPending]);

  const handleChange = async (
    e: React.ChangeEvent<HTMLSelectElement> | Record<string, string | null>
  ) => {
    const updates: Record<string, string | null> = {};

    if ('target' in e) {
        const target = e.target as HTMLSelectElement;
        const name = target.name;
        const value = target.value || null;
        updates[name] = value;
        
        // Hierarchical clearing logic
        if (name === "make" && !value) {
            updates.model = null;
            updates.modelVariant = null;
        } else if (name === "make") {
            updates.model = null;
            updates.modelVariant = null;
        }
        
        if (name === "model" && !value) {
            updates.modelVariant = null;
        } else if (name === "model") {
            updates.modelVariant = null;
        }
    } else {
        Object.assign(updates, e);
    }

    startTransition(() => {
        setState(updates);
    });
  };

  const adaptiveRanges = ranges || {
      year: { min: _minYear, max: _maxYear },
      price: { min: _minPrice, max: _maxPrice }
  };

  return (
    <div className="flex flex-col gap-2">
      <TaxonomyFilters 
        handleChange={handleChange as any} 
        afterMakeLabel={<HomepageClearFilters />}
      />
      <RangeFilter
        label={t("year")}
        minName="minYear"
        maxName="maxYear"
        defaultMin={adaptiveRanges.year.min ?? _minYear}
        defaultMax={adaptiveRanges.year.max ?? _maxYear}
        handleChange={handleChange as any}
        searchParams={query as any}
      />
      <RangeFilter
        label={t("price")}
        minName="minPrice"
        maxName="maxPrice"
        defaultMin={adaptiveRanges.price.min ?? _minPrice}
        defaultMax={adaptiveRanges.price.max ?? _maxPrice}
        handleChange={handleChange as any}
        increment={100000}
        thousandSeparator={true}
        currency={{ currencyCode: "USD" }}
        searchParams={query as any}
      />
    </div>
  );
};

export default HomepageTaxonomyFilters;
