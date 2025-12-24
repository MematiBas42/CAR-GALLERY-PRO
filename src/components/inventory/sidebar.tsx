"use client";
import { routes } from "@/config/routes";
import {
  cn,
} from "@/lib/utils";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryStates } from "nuqs";
import React, { useEffect, useState } from "react";
import SearchInput from "../shared/search-input";
import TaxonomyFilters from "./TaxonomyFilters";
import { RangeFilter } from "./RangeFilters";
import {
  Prisma,
} from "@prisma/client";
import { Select } from "../ui/select";
import { useTranslations } from "next-intl";
import { FilterOptions } from "@/config/types";
import { api } from "@/lib/api-client";
import { endpoints } from "@/config/endpoints";

export interface SidebarProps {
  minMaxValue: Prisma.GetClassifiedAggregateType<{
    _min: {
      year: true;
      price: true;
      odoReading: true;
    };
    _max: {
      year: true;
      price: true;
      odoReading: true;
    };
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
    {
      shallow: false,
    }
  );

  // States for dynamic options
  const [makes, setMakes] = useState<FilterOptions<string, string>>([]);
  const [models, setModels] = useState<FilterOptions<string, string>>([]);
  const [modelVariants, setModelVariants] = useState<FilterOptions<string, string>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [fuelTypeOptions, setFuelTypeOptions] = useState<FilterOptions<string, string>>([]);
  const [transmissionOptions, setTransmissionOptions] = useState<FilterOptions<string, string>>([]);
  const [bodyTypeOptions, setBodyTypeOptions] = useState<FilterOptions<string, string>>([]);
  const [colourOptions, setColourOptions] = useState<FilterOptions<string, string>>([]);
  const [ulezOptions, setUlezOptions] = useState<FilterOptions<string, string>>([]);
  const [odoUnitOptions, setOdoUnitOptions] = useState<FilterOptions<string, string>>([]);
  const [currencyOptions, setCurrencyOptions] = useState<FilterOptions<string, string>>([]);
  const [doorOptions, setDoorOptions] = useState<FilterOptions<string, string>>([]);
  const [seatOptions, setSeatOptions] = useState<FilterOptions<string, string>>([]);

  // State for adaptive ranges
  const [adaptiveRanges, setAdaptiveRanges] = useState<{
    year: { min: number | null, max: number | null },
    price: { min: number | null, max: number | null },
    odoReading: { min: number | null, max: number | null }
  }>({
    year: { min: _min.year, max: _max.year },
    price: { min: _min.price, max: _max.price },
    odoReading: { min: _min.odoReading, max: _max.odoReading }
  });


  useEffect(() => {
    const filterCount = Object.entries(
      searchParams as Record<string, string>
    ).filter(([key, value]) => key !== "page" && value).length;
    setFilterCount(filterCount);

    // Fetch dynamic options and ranges
    const fetchOptions = async () => {
        setIsLoading(true);
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(searchParams as Record<string, string>)) {
            if (v) params.set(k, v as string);
        }
        const url = new URL(endpoints.taxonomy, window.location.href);
        url.search = params.toString();

        try {
            const data = await api.get<{
                makes: FilterOptions<string, string>;
                models: FilterOptions<string, string>;
                modelVariants: FilterOptions<string, string>;
                ranges: {
                    year: { min: number, max: number },
                    price: { min: number, max: number },
                    odoReading: { min: number, max: number }
                },
                attributes: {
                    fuelType: string[];
                    transmission: string[];
                    bodyType: string[];
                    colour: string[];
                    ulezCompliance: string[];
                    odoUnit: string[];
                    currency: string[];
                    doors: number[];
                    seats: number[];
                }
            }>(url.toString());

            setMakes(data.makes);
            setModels(data.models);
            setModelVariants(data.modelVariants);
            setAdaptiveRanges(data.ranges);

            setFuelTypeOptions(data.attributes.fuelType.map(val => ({ label: tEnums(`FuelType.${val}`), value: val })));
            setTransmissionOptions(data.attributes.transmission.map(val => ({ label: tEnums(`Transmission.${val}`), value: val })));
            setBodyTypeOptions(data.attributes.bodyType.map(val => ({ label: tEnums(`BodyType.${val}`), value: val })));
            setColourOptions(data.attributes.colour.map(val => ({ label: tEnums(`Colour.${val}`), value: val })));
            setUlezOptions(data.attributes.ulezCompliance.map(val => ({ label: tEnums(`ULEZ.${val}`) || val, value: val }))); 
            setOdoUnitOptions(data.attributes.odoUnit.map(val => ({ label: tEnums(`OdoUnit.${val}`), value: val })));
            setCurrencyOptions(data.attributes.currency.map(val => ({ label: val, value: val }))); 
            setDoorOptions(data.attributes.doors.map(val => ({ label: val.toString(), value: val.toString() })));
            setSeatOptions(data.attributes.seats.map(val => ({ label: val.toString(), value: val.toString() })));

        } catch (error) {
            console.error("Failed to fetch taxonomy attributes", error);
        } finally {
            setIsLoading(false);
        }
    };

    fetchOptions();

  }, [searchParams, tEnums]); 

  const clearFilters = () => {
    const url = new URL(routes.inventory, process.env.NEXT_PUBLIC_APP_URL);
    window.location.replace(url.toString());
    setFilterCount(0);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setQueryStates({
      [name]: value || null,
    });

    if (name === "make") {
      setQueryStates({
        model: null,
        modelVariant: null,
      });
    }

    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(name, value);
    } else {
      newSearchParams.delete(name);
    }
    router.push(`${routes.inventory}?${newSearchParams.toString()}`);
  };
  return (
    <div className="py-4 w-[21.25rem] bg-card border-r border-muted hidden lg:block">
      <div>
        <div className="text-lg font-semibold flex justify-between px-4">
          <span>{t("sidebar.title")}</span>
          <button
            type="button"
            onClick={clearFilters}
            aria-disabled={filterCount === 0}
            className={cn(
              `text-sm text-muted-foreground`,
              !filterCount
                ? "disabled opacity-50 pointer-events-none cursor-default"
                : "hover:underline cursor-pointer"
            )}
          >
            {t("sidebar.clearAll")}
            {filterCount ? `(${filterCount})` : null}
          </button>
        </div>
        <div className="mt-2" />
      </div>
      <div className="p-4">
        <SearchInput
          placeholder={t("sidebar.searchPlaceholder")}
          className="w-full px-3 py-2 border rounded-md
                focus:outline-hidden focus:ring-2 focus:ring-sky-500"
        />
      </div>
      <div className="p-4 space-y-2">
        <TaxonomyFilters
          searchParams={searchParams}
          handleChange={handleChange}
          makes={makes}
          models={models}
          modelVariants={modelVariants}
          isLoading={isLoading}
        />
        <RangeFilter
          label={tFilters("year")}
          minName="minYear"
          maxName="maxYear"
          defaultMin={adaptiveRanges.year.min || _min.year || 1925}
          defaultMax={adaptiveRanges.year.max || _max.year || new Date().getFullYear()}
          handleChange={handleChange}
          searchParams={searchParams}
          placeholder={!adaptiveRanges.year.min ? "-" : undefined}
        />
        <RangeFilter
          label={tFilters("price")}
          minName="minPrice"
          maxName="maxPrice"
          defaultMin={adaptiveRanges.price.min || _min.price || 0}
          defaultMax={adaptiveRanges.price.max || _max.price || Number.MAX_SAFE_INTEGER}
          handleChange={handleChange}
          increment={1000000}
          thousandSeparator={true}
          currency={{ currencyCode: "EUR" }}
          searchParams={searchParams}
          placeholder={!adaptiveRanges.price.min ? "-" : undefined}
        />
        <RangeFilter
          label={tLabels("odometerReading")}
          minName="minReading"
          increment={5000}
          thousandSeparator={true}
          maxName="maxReading"
          defaultMin={adaptiveRanges.odoReading.min || _min.odoReading || 0}
          defaultMax={adaptiveRanges.odoReading.max || _max.odoReading || Number.MAX_SAFE_INTEGER}
          handleChange={handleChange}
          searchParams={searchParams}
          placeholder={!adaptiveRanges.odoReading.min ? "-" : undefined}
        />

        <Select
          label={tLabels("currency")}
          name="currency"
          value={queryStates.currency || ""}
          onChange={handleChange}
          options={currencyOptions}
          disabled={!currencyOptions.length}
          placeholder={!currencyOptions.length ? "-" : undefined}
        />
        <Select
          label={tLabels("odometerUnit")}
          name="odoUnit"
          value={queryStates.odoUnit || ""}
          onChange={handleChange}
          options={odoUnitOptions}
          disabled={!odoUnitOptions.length}
          placeholder={!odoUnitOptions.length ? "-" : undefined}
        />
        <Select
          label={tLabels("transmission")}
          name="transmission"
          value={queryStates.transmission || ""}
          onChange={handleChange}
          options={transmissionOptions}
          disabled={!transmissionOptions.length}
          placeholder={!transmissionOptions.length ? "-" : undefined}
        />
        <Select
          label={tLabels("fuelType")}
          name="fuelType"
          value={queryStates.fuelType || ""}
          onChange={handleChange}
          options={fuelTypeOptions}
          disabled={!fuelTypeOptions.length}
          placeholder={!fuelTypeOptions.length ? "-" : undefined}
        />
        <Select
          label={tLabels("bodyType")}
          name="bodyType"
          value={queryStates.bodyType || ""}
          onChange={handleChange}
          options={bodyTypeOptions}
          disabled={!bodyTypeOptions.length}
          placeholder={!bodyTypeOptions.length ? "-" : undefined}
        />
        <Select
          label={tLabels("colour")}
          name="colour"
          value={queryStates.colour || ""}
          onChange={handleChange}
          options={colourOptions}
          disabled={!colourOptions.length}
          placeholder={!colourOptions.length ? "-" : undefined}
        />
        <Select
          label={tLabels("ulezCompliance")}
          name="ulezCompliance"
          value={queryStates.ulezCompliance || ""}
          onChange={handleChange}
          options={ulezOptions}
          disabled={!ulezOptions.length}
          placeholder={!ulezOptions.length ? "-" : undefined}
        />

        <Select
          label={tLabels("doors")}
          name="doors"
          value={queryStates.doors || ""}
          onChange={handleChange}
          options={doorOptions}
          disabled={!doorOptions.length}
          placeholder={!doorOptions.length ? "-" : undefined}
        />
        <Select
          label={tLabels("seats")}
          name="seats"
          value={queryStates.seats || ""}
          onChange={handleChange}
          options={seatOptions}
          disabled={!seatOptions.length}
          placeholder={!seatOptions.length ? "-" : undefined}
        />
      </div>
    </div>
  );
};

export default Sidebar;