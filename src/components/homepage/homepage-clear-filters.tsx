"use client";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { X } from "lucide-react";
import Link from "next/link";
import { useQueryStates, parseAsString } from "nuqs";
import { useTranslations } from "next-intl";

export const homepageFilterSchema = {
  make: parseAsString,
  model: parseAsString,
  modelVariant: parseAsString,
  minYear: parseAsString,
  maxYear: parseAsString,
  minPrice: parseAsString,
  maxPrice: parseAsString,
};

export const HomepageClearFilters = () => {
  const t = useTranslations("Homepage.Hero");
  const [query, setQuery] = useQueryStates(homepageFilterSchema, { shallow: false });

  const filterCount = Object.values(query).filter(Boolean).length;

  if (filterCount === 0) return null;

  const handleClear = () => {
    // Dynamically clear all keys defined in the schema
    const clearedQuery = Object.keys(homepageFilterSchema).reduce((acc, key) => {
      acc[key as keyof typeof homepageFilterSchema] = null;
      return acc;
    }, {} as any);
    
    setQuery(clearedQuery);
  };

  return (
    <Button
      type="button"
      onClick={handleClear}
      variant="outline"
      className="w-full hover:bg-accent mt-2 animate-in fade-in slide-in-from-top-1"
    >
      <X className="w-4 h-4 mr-2" />
      {t("clearFilters")} ({filterCount})
    </Button>
  );
};
