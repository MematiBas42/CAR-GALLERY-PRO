"use client";

import { SidebarProps } from "../inventory/sidebar";
import { parseAsString, useQueryStates } from "nuqs";
import TaxonomyFilters from "../inventory/TaxonomyFilters";
import { RangeFilter } from "../inventory/RangeFilters";
import { useTranslations } from "next-intl";
import React from "react";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { homepageFilterSchema } from "./homepage-clear-filters";

interface HomepageTaxonomyFiltersProps extends SidebarProps {}

const HomepageTaxonomyFilters = ({
  minMaxValue,
  searchParams,
}: HomepageTaxonomyFiltersProps) => {
  const t = useTranslations("Filters");
  const { _min, _max } = minMaxValue;
  const [, setState] = useQueryStates(homepageFilterSchema, { shallow: false });

  const { ranges } = useTaxonomy();

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setState({ [name]: value || null });
    if (name === "make") {
        setState({ model: null, modelVariant: null });
    }
  };

  const adaptiveRanges = ranges || {
      year: { min: _min.year, max: _max.year },
      price: { min: _min.price, max: _max.price }
  };

  return (
    <div>
      <TaxonomyFilters handleChange={handleChange as any} />
      <RangeFilter
        label={t("year")}
        minName="minYear"
        maxName="maxYear"
        defaultMin={adaptiveRanges.year.min ?? _min.year ?? 1900}
        defaultMax={adaptiveRanges.year.max ?? _max.year ?? new Date().getFullYear()}
        handleChange={handleChange as any}
        searchParams={searchParams}
      />
      <RangeFilter
        label={t("price")}
        minName="minPrice"
        maxName="maxPrice"
        defaultMin={adaptiveRanges.price.min ?? _min.price ?? 0}
        defaultMax={adaptiveRanges.price.max ?? _max.price ?? 1000000}
        handleChange={handleChange as any}
        increment={100000}
        thousandSeparator={true}
        currency={{ currencyCode: "EUR" }}
        searchParams={searchParams}
      />
    </div>
  );
};

export default HomepageTaxonomyFilters;