"use client";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { X } from "lucide-react";
import Link from "next/link";
import { useQueryStates, parseAsString } from "nuqs";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export const homepageFilterSchema = {
  make: parseAsString,
  model: parseAsString,
  modelVariant: parseAsString,
  minYear: parseAsString,
  maxYear: parseAsString,
  minPrice: parseAsString,
  maxPrice: parseAsString,
};

interface HomepageClearFiltersProps {
    filters: Record<string, any>;
    onClear: () => void;
}

export const HomepageClearFilters = ({ filters, onClear }: HomepageClearFiltersProps) => {
  const t = useTranslations("Homepage.Hero");

  const filterCount = Object.values(filters).filter(Boolean).length;

  if (filterCount === 0) return null;

  return (
    <Button
      type="button"
      onClick={onClear}
      variant="ghost"
      className="h-auto p-0 text-red-600 hover:text-red-700 hover:bg-transparent font-bold text-xs uppercase tracking-wider animate-in fade-in zoom-in-95"
    >
      <X className="w-3 h-3 mr-1" />
      {t("clearFilters")}
    </Button>
  );
};
