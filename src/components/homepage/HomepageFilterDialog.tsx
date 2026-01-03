"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
import { Filter, Loader2 } from "lucide-react";
import { RangeFilter } from "../inventory/RangeFilters";
import TaxonomyFilters from "../inventory/TaxonomyFilters";
import { useTranslations } from "next-intl";
import { useTaxonomy, useClassifiedCount } from "@/hooks/use-taxonomy";
import { HomepageClearFilters } from "./homepage-clear-filters";

export const HomepageFilterDialog = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();
  
  const t = useTranslations("Homepage.Hero");
  const tFilters = useTranslations("Filters");
  
  const { ranges: taxonomyRanges } = useTaxonomy();

  // Draft Mode State
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Sync Draft State with URL when Dialog Opens
  useEffect(() => {
      if (open) {
          const currentParams = Object.fromEntries(searchParams.entries());
          setFilters(currentParams);
      }
  }, [open, searchParams]);

  const queryString = useMemo(() => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
          if (value) params.set(key, String(value));
      });
      return params.toString();
  }, [filters]);

  const { count: liveCount, isLoading: isCountLoading } = useClassifiedCount(queryString, 0);

  // Apply Filters to URL
  const handleApply = () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
          if (value) params.set(key, String(value));
      });
      params.delete("page");
      
      startTransition(() => {
          router.push(`${routes.inventory}?${params.toString()}`);
          setOpen(false);
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement> | Record<string, string | null>) => {
    const updates: Record<string, string | null> = {};

    if ('target' in e) {
        const target = e.target as HTMLSelectElement;
        const name = target.name;
        const value = target.value || null;
        updates[name] = value;
        
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

    setFilters(prev => ({ ...prev, ...updates }));
  };

  // Only show on Homepage
  if (pathname !== routes.home) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Filter className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] flex flex-col gap-0 p-0 border-none sm:border-solid rounded-xl overflow-hidden bg-background">
        <DialogHeader className="p-6 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold tracking-tight">{t("filterTitle") || "Find Your Car"}</DialogTitle>
            <HomepageClearFilters filters={filters} onClear={() => setFilters({})} />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <TaxonomyFilters 
            handleChange={handleChange as any} 
            values={filters as any}
          />
          
          <div className="space-y-4 pt-2 border-t border-muted">
            <RangeFilter
                label={tFilters("year")}
                minName="minYear"
                maxName="maxYear"
                defaultMin={taxonomyRanges?.year.min ?? 1900}
                defaultMax={taxonomyRanges?.year.max ?? new Date().getFullYear()}
                handleChange={handleChange as any}
                searchParams={filters}
                applyOnBlur={true}
            />
            <RangeFilter
                label={tFilters("price")}
                minName="minPrice"
                maxName="maxPrice"
                defaultMin={taxonomyRanges?.price.min ?? 0}
                defaultMax={taxonomyRanges?.price.max ?? 1000000}
                handleChange={handleChange as any}
                increment={100000}
                thousandSeparator={true}
                currency={{ currencyCode: "USD" }}
                searchParams={filters}
                applyOnBlur={true}
            />
          </div>
        </div>

        <DialogFooter className="p-6 bg-background border-t mt-auto shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
          <Button onClick={handleApply} className="w-full h-12 text-base font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all">
            {isCountLoading ? <Loader2 className="h-5 w-5 animate-spin opacity-70" /> : t("discover") + ` (${liveCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};