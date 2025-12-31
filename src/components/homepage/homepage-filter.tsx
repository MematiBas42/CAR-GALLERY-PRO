"use client";

import { SidebarProps } from "../inventory/sidebar";
import { parseAsString, useQueryStates } from "nuqs";
import TaxonomyFilters from "../inventory/TaxonomyFilters";
import { RangeFilter } from "../inventory/RangeFilters";
import { useTranslations } from "next-intl";
import React from "react";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { homepageFilterSchema } from "./homepage-clear-filters";
import { setIsLoading } from "@/hooks/use-loading";

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

  const [, setState] = useQueryStates(homepageFilterSchema, { 
      shallow: false,
      startTransition 
  });

  const { ranges } = useTaxonomy();

  React.useEffect(() => {
    setIsLoading(isPending, "homepage-filter-update");
    return () => setIsLoading(false, "homepage-filter-update");
  }, [isPending]);

  const handleChange = async (
    e: any
  ) => {
    if (e.target && typeof e.target === 'object' && 'name' in e.target) {
        const { name, value } = e.target;
        setState({ [name]: value || null });
        if (name === "make") {
            setState({ model: null, modelVariant: null });
        }
        if (name === "model") {
            setState({ modelVariant: null });
        }
    } else {
        setState(e);
    }
  };

  const adaptiveRanges = ranges || {
      year: { min: _minYear, max: _maxYear },
      price: { min: _minPrice, max: _maxPrice }
  };

  return (
    <div className="flex flex-col gap-4">
      <TaxonomyFilters handleChange={handleChange as any} />
      <RangeFilter
        label={t("year")}
        minName="minYear"
        maxName="maxYear"
        defaultMin={adaptiveRanges.year.min ?? _minYear}
        defaultMax={adaptiveRanges.year.max ?? _maxYear}
        handleChange={handleChange as any}
        searchParams={searchParams}
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
        searchParams={searchParams}
      />
    </div>
  );
};

export default HomepageTaxonomyFilters;