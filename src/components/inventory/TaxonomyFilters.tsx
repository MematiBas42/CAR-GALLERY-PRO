"use client";
import React, { useMemo } from "react";
import { Combobox } from "../ui/combobox";
import { useTranslations } from "next-intl";
import { parseAsString, useQueryStates } from "nuqs";
import { useTaxonomy, getModelsForMake, getVariantsForModel } from "@/hooks/use-taxonomy";

interface TaxonomyFiltersProps {
    handleChange: (e: { target: { name: string; value: string } }) => void;
}

const TaxonomyFilters = ({ handleChange }: TaxonomyFiltersProps) => {
  const t = useTranslations("Filters");
  const { taxonomy, isLoading } = useTaxonomy();
  
  const [queryStates] = useQueryStates({
    make: parseAsString.withDefault(""),
    model: parseAsString.withDefault(""),
    modelVariant: parseAsString.withDefault(""),
  });

  const makes = taxonomy.map(m => ({ label: m.l, value: m.v }));
  
  const models = useMemo(() => {
      return getModelsForMake(taxonomy, queryStates.make).map(m => ({ label: m.l, value: m.v }));
  }, [taxonomy, queryStates.make]);

  const modelVariants = useMemo(() => {
      return getVariantsForModel(taxonomy, queryStates.make, queryStates.model).map(v => ({ label: v.l, value: v.v }));
  }, [taxonomy, queryStates.make, queryStates.model]);

  if (isLoading) {
    return (
        <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="grid gap-1">
                    <div className="h-4 w-16 bg-white/10 animate-pulse rounded" />
                    <div className="h-9 w-full bg-white/5 animate-pulse rounded-md border border-white/10" />
                </div>
            ))}
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Combobox
        label={t("make")}
        name="make"
        value={queryStates.make}
        options={makes}
        onChange={handleChange as any}
        placeholder={isLoading ? t("loading") : t("select")}
        searchPlaceholder={t("search")}
        disabled={isLoading}
      />
      <Combobox
        label={t("model")}
        name="model"
        value={queryStates.model}
        options={models}
        onChange={handleChange as any}
        disabled={!queryStates.make || !models.length}
        placeholder={!queryStates.make ? t("select") : (isLoading ? t("loading") : t("select"))}
        searchPlaceholder={t("search")}
      />
      <Combobox
        label={t("modelVariant")}
        name="modelVariant"
        value={queryStates.modelVariant}
        options={modelVariants}
        onChange={handleChange as any}
        disabled={!queryStates.model || !modelVariants.length}
        placeholder={!queryStates.model ? t("select") : (isLoading ? t("loading") : t("select"))}
        searchPlaceholder={t("search")}
      />
    </div>
  );
};

export default TaxonomyFilters;