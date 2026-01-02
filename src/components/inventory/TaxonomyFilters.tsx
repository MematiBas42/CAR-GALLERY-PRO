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

  const makes = useMemo(() => taxonomy.map(m => ({ label: m.l, value: m.v })), [taxonomy]);
  
  const models = useMemo(() => {
      return getModelsForMake(taxonomy, queryStates.make).map(m => ({ label: m.l, value: m.v }));
  }, [taxonomy, queryStates.make]);

  const modelVariants = useMemo(() => {
      return getVariantsForModel(taxonomy, queryStates.make, queryStates.model).map(v => ({ label: v.l, value: v.v }));
  }, [taxonomy, queryStates.make, queryStates.model]);

  return (
    <div className="flex flex-col gap-2 sm:gap-4">
      <Combobox
        label={t("make")}
        name="make"
        value={queryStates.make}
        options={makes}
        onChange={handleChange as any}
        placeholder={isLoading && !makes.length ? t("loading") : t("select")}
        searchPlaceholder={t("search")}
        disabled={isLoading && !makes.length}
      />
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <Combobox
            label={t("model")}
            name="model"
            value={queryStates.model}
            options={models}
            onChange={handleChange as any}
            disabled={!queryStates.make || (isLoading && !models.length)}
            placeholder={!queryStates.make ? t("select") : (isLoading && !models.length ? t("loading") : t("select"))}
            searchPlaceholder={t("search")}
        />
        <Combobox
            label={t("modelVariant")}
            name="modelVariant"
            value={queryStates.modelVariant}
            options={modelVariants}
            onChange={handleChange as any}
            disabled={!queryStates.model || (isLoading && !modelVariants.length)}
            placeholder={!queryStates.model ? t("select") : (isLoading && !modelVariants.length ? t("loading") : t("select"))}
            searchPlaceholder={t("search")}
        />
      </div>
    </div>
  );
};

export default TaxonomyFilters;