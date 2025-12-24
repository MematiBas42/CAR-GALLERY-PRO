"use client";
import { AwaitedPageProps, FilterOptions, TaxonomyFiltersProps } from "@/config/types";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Select } from "../ui/select";
import { endpoints } from "@/config/endpoints";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";


const TaxonomyFilters = (props: TaxonomyFiltersProps) => {
  const t = useTranslations("Filters");
  const { 
    searchParams, 
    handleChange, 
    makes: propsMakes, 
    models: propsModels, 
    modelVariants: propsVariants,
    isLoading: propsLoading 
  } = props;

  const [internalMakes, setInternalMakes] = useState<FilterOptions<string, string>>([]);
  const [internalModels, setInternalModels] = useState<FilterOptions<string, string>>([]);
  const [internalVariants, setInternalVariants] = useState<FilterOptions<string, string>>([]);

 useEffect(() => {
    // Only fetch if data is not provided via props
    if (propsMakes || propsModels || propsVariants) return;

		(async function fetchMakesOptions() {
			const params = new URLSearchParams();
			for (const [k, v] of Object.entries(
				searchParams as Record<string, string>,
			)) {
				if (v) params.set(k, v as string);
			}

			const url = new URL(endpoints.taxonomy, window.location.href);

			url.search = params.toString();

			const data = await api.get<{
				makes: FilterOptions<string, string>;
				models: FilterOptions<string, string>;
				modelVariants: FilterOptions<string, string>;
			}>(url.toString());

			setInternalMakes(data.makes);
			setInternalModels(data.models);
			setInternalVariants(data.modelVariants);
		})();

    
	}, [searchParams, propsMakes, propsModels, propsVariants]);

  const makes = propsMakes || internalMakes;
  const model = propsModels || internalModels;
  const modelVariant = propsVariants || internalVariants;

  
  return (
    <>
      <Select
        label={t("make")}
        name="make"
        value={(searchParams?.make as string) || ""}
        options={makes}
        onChange={handleChange}
        placeholder={!makes.length ? "-" : undefined}
      />
      <Select
        label={t("model")}
        name="model"
        value={(searchParams?.model as string) || ""}
        options={model}
        onChange={handleChange}
        disabled={!model.length}
        placeholder={!model.length ? "-" : undefined}
      />
      <Select
        label={t("modelVariant")}
        name="modelVariant"
        value={(searchParams?.modelVariant as string) || ""}
        options={modelVariant}
        onChange={handleChange}
        disabled={!modelVariant.length}
        placeholder={!modelVariant.length ? "-" : undefined}
      />
    </>
  );
};

export default TaxonomyFilters;
