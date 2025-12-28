"use client";
import React, { useEffect, useState } from "react";
import { SidebarProps } from "./sidebar";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryStates } from "nuqs";
import { routes } from "@/config/routes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { RangeFilter } from "./RangeFilters";
import TaxonomyFilters from "./TaxonomyFilters";
import { Select } from "../ui/select";
import { useTranslations } from "next-intl";
import { useTaxonomy } from "@/hooks/use-taxonomy";

interface DialogFiltersProps extends SidebarProps {
  count: number;
}

const DialogFilters = ({
  minMaxValue,
  searchParams,
  count,
}: DialogFiltersProps) => {
  const t = useTranslations("Inventory");
  const tLabels = useTranslations("Inventory.labels");
  const tEnums = useTranslations("Enums");
  const tFilters = useTranslations("Filters");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [filtersCount, setFiltersCount] = useState(0);
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
    { shallow: false }
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
    setFiltersCount(count);
  }, [searchParams]); 

  const clearAllFilter = () => {
    const url = new URL(routes.inventory, process.env.NEXT_PUBLIC_APP_URL);
    router.replace(url.toString());
    setOpen(false);
  };

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setQueryStates({ [name]: value || null });

    if (name === "make") {
      setQueryStates({ model: null, modelVariant: null });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="lg:hidden flex gap-2">
          <Filter className="w-4 h-4" />
          {t("sidebar.title")}
          {filtersCount > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
              {filtersCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[425px] h-[100dvh] sm:h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-none sm:border-solid rounded-none sm:rounded-xl"
        onOpenAutoFocus={(e) => e.preventDefault()} // Prevent focus fight with nested selects
      >
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-xl font-bold">{t("sidebar.title")}</DialogTitle>
            {filtersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilter}
                className="text-destructive text-xs h-auto p-0 hover:bg-transparent font-medium"
              >
                <X className="w-3 h-3 mr-1" />
                {t("sidebar.clearAll")}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
        <DialogFooter className="p-6 bg-background border-t mt-auto">
          <Button onClick={() => setOpen(false)} className="w-full h-12 text-base font-semibold uppercase tracking-wide">
            {t("sidebar.showResults", { count })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogFilters;