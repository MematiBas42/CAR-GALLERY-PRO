"use client";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryStates } from "nuqs";
import React, { useEffect, useState } from "react";
import SearchInput from "../shared/search-input";
import TaxonomyFilters from "./TaxonomyFilters";
import { RangeFilter } from "./RangeFilters";
import { Prisma } from "@prisma/client";
import { Select } from "../ui/select";
import { useTranslations } from "next-intl";
import { useTaxonomy } from "@/hooks/use-taxonomy";

export interface SidebarProps {
  minMaxValue: Prisma.GetClassifiedAggregateType<{
    _min: { year: true; price: true; odoReading: true };
    _max: { year: true; price: true; odoReading: true };
  }>;
  searchParams: any;
}

const Sidebar = ({ minMaxValue, searchParams }: SidebarProps) => {
  const t = useTranslations("Inventory");
  const tLabels = useTranslations("Inventory.labels");
  const tEnums = useTranslations("Enums");
  const tFilters = useTranslations("Filters");
  const router = useRouter();
  const [filterCount, setFilterCount] = useState(0);
  const { _min, _max } = minMaxValue;
  
  const { ranges: taxonomyRanges, attributes, isLoading } = useTaxonomy();

  const [queryStates, setQueryStates] = useQueryStates(
    {
      make: parseAsString.withDefault(""),
      model: parseAsString.withDefault(""),
      modelVariant: parseAsString.withDefault(""),
      minYear: parseAsString.withDefault(""),
      maxYear: parseAsString.withDefault(""),
      minPrice: parseAsString.withDefault(""),
      maxPrice: parseAsString.withDefault(""),
      minReading: parseAsString.withDefault(""),
      maxReading: parseAsString.withDefault(""),
      currency: parseAsString.withDefault(""),
      odoUnit: parseAsString.withDefault(""),
      transmission: parseAsString.withDefault(""),
      fuelType: parseAsString.withDefault(""),
      bodyType: parseAsString.withDefault(""),
      colour: parseAsString.withDefault(""),
      doors: parseAsString.withDefault(""),
      seats: parseAsString.withDefault(""),
      ulezCompliance: parseAsString.withDefault(""),
    },
    { shallow: true }
  );

  const adaptiveRanges = taxonomyRanges || {
    year: { min: _min.year, max: _max.year },
    price: { min: _min.price, max: _max.price },
    odoReading: { min: _min.odoReading, max: _max.odoReading }
  };

  const fuelTypeOptions = (attributes?.fuelType || []).map((val: any) => ({ label: tEnums(`FuelType.${val}`), value: val }));
  const transmissionOptions = (attributes?.transmission || []).map((val: any) => ({ label: tEnums(`Transmission.${val}`), value: val }));
  const bodyTypeOptions = (attributes?.bodyType || []).map((val: any) => ({ label: tEnums(`BodyType.${val}`), value: val }));
  const colourOptions = (attributes?.colour || []).map((val: any) => ({ label: tEnums(`Colour.${val}`), value: val }));
  const ulezOptions = (attributes?.ulezCompliance || []).map((val: any) => ({ label: tEnums(`ULEZ.${val}`) || val, value: val })); 
  const odoUnitOptions = (attributes?.odoUnit || []).map((val: any) => ({ label: tEnums(`OdoUnit.${val}`), value: val }));
  const currencyOptions = (attributes?.currency || []).map((val: any) => ({ label: val, value: val })); 
  const doorOptions = (attributes?.doors || []).map((val: any) => ({ label: val.toString(), value: val.toString() }));
  const seatOptions = (attributes?.seats || []).map((val: any) => ({ label: val.toString(), value: val.toString() }));

  useEffect(() => {
    const params = typeof searchParams?.then === 'function' ? {} : searchParams;
    const count = Object.entries(params as Record<string, string>)
      .filter(([key, value]) => key !== "page" && value).length;
    setFilterCount(count);
  }, [searchParams]); 

  const clearFilters = () => {
    const url = new URL(routes.inventory, process.env.NEXT_PUBLIC_APP_URL);
    window.location.replace(url.toString());
  };

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setQueryStates({ [name]: value || null });

    if (name === "make") {
      setQueryStates({ model: null, modelVariant: null });
    }

    React.startTransition(() => {
        router.refresh();
    });
  };

  return (
    <div className="py-4 w-[21.25rem] bg-card border-r border-muted hidden lg:block">
      <div className="text-lg font-semibold flex justify-between px-4">
        <span>{t("sidebar.title")}</span>
        {filterCount > 0 && (
            <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-destructive hover:underline cursor-pointer"
            >
            {t("sidebar.clearAll")} ({filterCount})
            </button>
        )}
      </div>
      <div className="p-4">
        <SearchInput placeholder={t("sidebar.searchPlaceholder")} className="w-full" />
      </div>
      <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
        <TaxonomyFilters handleChange={handleChange as any} />
        
        <RangeFilter
          label={tFilters("year")}
          minName="minYear"
          maxName="maxYear"
          defaultMin={adaptiveRanges.year.min ?? _min.year ?? 1900}
          defaultMax={adaptiveRanges.year.max ?? _max.year ?? new Date().getFullYear()}
          handleChange={handleChange as any}
          searchParams={searchParams}
        />
        <RangeFilter
          label={tFilters("price")}
          minName="minPrice"
          maxName="maxPrice"
          defaultMin={adaptiveRanges.price.min ?? _min.price ?? 0}
          defaultMax={adaptiveRanges.price.max ?? _max.price ?? 1000000}
          handleChange={handleChange as any}
          thousandSeparator={true}
          currency={{ currencyCode: "EUR" }}
          searchParams={searchParams}
        />
        <RangeFilter
          label={tLabels("odometerReading")}
          minName="minReading"
          maxName="maxReading"
          defaultMin={adaptiveRanges.odoReading.min ?? _min.odoReading ?? 0}
          defaultMax={adaptiveRanges.odoReading.max ?? _max.odoReading ?? 1000000}
          handleChange={handleChange as any}
          thousandSeparator={true}
          searchParams={searchParams}
        />

        <Select label={tLabels("currency")} name="currency" value={queryStates.currency} onChange={handleChange as any} options={currencyOptions} disabled={isLoading} placeholder={tFilters("select")} />
        <Select label={tLabels("odometerUnit")} name="odoUnit" value={queryStates.odoUnit} onChange={handleChange as any} options={odoUnitOptions} disabled={isLoading} placeholder={tFilters("select")} />
        <Select label={tLabels("transmission")} name="transmission" value={queryStates.transmission} onChange={handleChange as any} options={transmissionOptions} disabled={isLoading} placeholder={tFilters("select")} />
        <Select label={tLabels("fuelType")} name="fuelType" value={queryStates.fuelType} onChange={handleChange as any} options={fuelTypeOptions} disabled={isLoading} placeholder={tFilters("select")} />
        <Select label={tLabels("bodyType")} name="bodyType" value={queryStates.bodyType} onChange={handleChange as any} options={bodyTypeOptions} disabled={isLoading} placeholder={tFilters("select")} />
        <Select label={tLabels("colour")} name="colour" value={queryStates.colour} onChange={handleChange as any} options={colourOptions} disabled={isLoading} placeholder={tFilters("select")} />
        <Select label={tLabels("ulezCompliance")} name="ulezCompliance" value={queryStates.ulezCompliance} onChange={handleChange as any} options={ulezOptions} disabled={isLoading} placeholder={tFilters("select")} />
        <Select label={tLabels("doors")} name="doors" value={queryStates.doors} onChange={handleChange as any} options={doorOptions} disabled={isLoading} placeholder={tFilters("select")} />
        <Select label={tLabels("seats")} name="seats" value={queryStates.seats} onChange={handleChange as any} options={seatOptions} disabled={isLoading} placeholder={tFilters("select")} />
      </div>
    </div>
  );
};

export default Sidebar;