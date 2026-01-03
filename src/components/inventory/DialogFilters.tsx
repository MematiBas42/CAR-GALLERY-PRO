"use client";
import React, { useEffect, useState, useMemo } from "react";
import { SidebarProps } from "./sidebar";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Filter, X, Loader2 } from "lucide-react";
import { RangeFilter } from "./RangeFilters";
import TaxonomyFilters from "./TaxonomyFilters";
import { Select } from "../ui/select";
import { useTranslations } from "next-intl";
import { useTaxonomy, useClassifiedCount } from "@/hooks/use-taxonomy";
import { setIsLoading } from "@/hooks/use-loading";

interface DialogFiltersProps extends SidebarProps {
  count: number;
}

const DialogFilters = ({
  minMaxValue,
  searchParams: serverSearchParamsProp,
  count: initialCount,
}: DialogFiltersProps) => {
  const serverSearchParams = serverSearchParamsProp || {};
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();
  
  const t = useTranslations("Inventory");
  const tLabels = useTranslations("Inventory.labels");
  const tEnums = useTranslations("Enums");
  const tFilters = useTranslations("Filters");
  
  const { ranges: taxonomyRanges, attributes, isLoading: isTaxonomyLoading } = useTaxonomy();

  // Draft Mode State
  const [draftFilters, setDraftFilters] = useState<Record<string, any>>({});

  // Sync Draft State with URL when Dialog Opens
  useEffect(() => {
      if (open) {
          const currentParams = Object.fromEntries(searchParams.entries());
          setDraftFilters(currentParams);
      }
  }, [open, searchParams]);

  const queryString = useMemo(() => {
      const params = new URLSearchParams();
      Object.entries(draftFilters).forEach(([key, value]) => {
          if (value) params.set(key, String(value));
      });
      return params.toString();
  }, [draftFilters]);

  const { count: liveCount, isLoading: isCountLoading } = useClassifiedCount(queryString, initialCount);

  // Apply Filters to URL (The only time navigation happens)
  const handleApply = () => {
      const params = new URLSearchParams();
      Object.entries(draftFilters).forEach(([key, value]) => {
          if (value) params.set(key, String(value));
      });
      params.delete("page"); // Reset page on filter change
      
      startTransition(() => {
          router.push(`${routes.inventory}?${params.toString()}`);
          setOpen(false);
      });
  };

  const filterCount = useMemo(() => {
      return Object.values(draftFilters).filter(Boolean).length;
  }, [draftFilters]);

  const clearAllFilter = () => {
    setDraftFilters({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement> | Record<string, string | null>) => {
    const updates: Record<string, string | null> = {};

    if ('target' in e) {
        const target = e.target as HTMLSelectElement;
        const name = target.name;
        const value = target.value || null;
        updates[name] = value;
        
        // Hierarchical clearing logic
        if (name === "make") {
            updates.model = null;
            updates.modelVariant = null;
        }
        
        if (name === "model") {
            updates.modelVariant = null;
        }
    } else {
        Object.assign(updates, e);
    }

    setDraftFilters(prev => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        <Button variant="outline" className="lg:hidden flex gap-2">
          <Filter className="w-4 h-4" />
          {t("sidebar.title")}
          {filterCount > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
              {filterCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[425px] h-[100dvh] sm:h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-none sm:border-solid rounded-none sm:rounded-2xl z-[9999] shadow-2xl backdrop-blur-xl bg-background/95"
      >
        <DialogHeader className="p-6 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold tracking-tight">{t("sidebar.title")}</DialogTitle>
            {filterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilter}
                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 text-xs font-semibold uppercase tracking-wider transition-all"
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                {t("sidebar.clearAll")}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          <div className="space-y-4">
            <TaxonomyFilters handleChange={handleChange as any} values={draftFilters as any} />
          </div>

          <div className="space-y-6 pt-2 border-t border-muted">
            <RangeFilter
              label={tFilters("year")}
              minName="minYear"
              maxName="maxYear"
              defaultMin={taxonomyRanges?.year.min ?? minMaxValue._min.year ?? 1900}
              defaultMax={taxonomyRanges?.year.max ?? minMaxValue._max.year ?? new Date().getFullYear()}
              handleChange={handleChange as any}
              searchParams={draftFilters}
              applyOnBlur={true}
            />
            <RangeFilter
              label={tFilters("price")}
              minName="minPrice"
              maxName="maxPrice"
              defaultMin={taxonomyRanges?.price.min ?? minMaxValue._min.price ?? 0}
              defaultMax={taxonomyRanges?.price.max ?? minMaxValue._max.price ?? 1000000}
              handleChange={handleChange as any}
              thousandSeparator={true}
              currency={{ currencyCode: "USD" }}
              searchParams={draftFilters}
              applyOnBlur={true}
            />
            <RangeFilter
              label={tLabels("odometerReading")}
              minName="minReading"
              maxName="maxReading"
              defaultMin={taxonomyRanges?.odoReading.min ?? minMaxValue._min.odoReading ?? 0}
              defaultMax={taxonomyRanges?.odoReading.max ?? minMaxValue._max.odoReading ?? 1000000}
              handleChange={handleChange as any}
              thousandSeparator={true}
              searchParams={draftFilters}
              applyOnBlur={true}
            />
          </div>

          <div className="space-y-4 pt-6 border-t border-muted">
            <Select label={tLabels("transmission")} name="transmission" value={draftFilters.transmission || ""} onChange={handleChange as any} options={(attributes?.transmission || []).map(v => ({label: tEnums(`Transmission.${v}`), value: v}))} disabled={isTaxonomyLoading} placeholder={tFilters("select")} />
            <Select label={tLabels("fuelType")} name="fuelType" value={draftFilters.fuelType || ""} onChange={handleChange as any} options={(attributes?.fuelType || []).map(v => ({label: tEnums(`FuelType.${v}`), value: v}))} disabled={isTaxonomyLoading} placeholder={tFilters("select")} />
            <Select label={tLabels("bodyType")} name="bodyType" value={draftFilters.bodyType || ""} onChange={handleChange as any} options={(attributes?.bodyType || []).map(v => ({label: tEnums(`BodyType.${v}`), value: v}))} disabled={isTaxonomyLoading} placeholder={tFilters("select")} />
            <Select label={tLabels("colour")} name="colour" value={draftFilters.colour || ""} onChange={handleChange as any} options={(attributes?.colour || []).map(v => ({label: tEnums(`Colour.${v}`), value: v}))} disabled={isTaxonomyLoading} placeholder={tFilters("select")} />
            <Select label={tLabels("ulezCompliance")} name="ulezCompliance" value={draftFilters.ulezCompliance || ""} onChange={handleChange as any} options={(attributes?.ulezCompliance || []).map(v => ({label: tEnums(`ULEZ.${v}`), value: v}))} disabled={isTaxonomyLoading} placeholder={tFilters("select")} />
            <Select label={tLabels("doors")} name="doors" value={draftFilters.doors || ""} onChange={handleChange as any} options={(attributes?.doors || []).map(v => ({label: String(v), value: String(v)}))} disabled={isTaxonomyLoading} placeholder={tFilters("select")} />
            <Select label={tLabels("seats")} name="seats" value={draftFilters.seats || ""} onChange={handleChange as any} options={(attributes?.seats || []).map(v => ({label: String(v), value: String(v)}))} disabled={isTaxonomyLoading} placeholder={tFilters("select")} />
          </div>
        </div>
        <DialogFooter className="p-6 bg-background border-t mt-auto shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
          <Button onClick={handleApply} className="w-full h-14 text-base font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all">
            {isCountLoading ? <Loader2 className="h-5 w-5 animate-spin opacity-70" /> : t("sidebar.showResults", { count: liveCount })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogFilters;
