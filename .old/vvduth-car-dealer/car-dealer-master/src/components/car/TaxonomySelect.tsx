"use client";
import { endpoints } from "@/config/endpoints";
import { FilterOptions } from "@/config/types";
import { api } from "@/lib/api-client";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Select } from "../ui/select";
const TaxonomySelect = () => {
  const form = useFormContext();
  const defaultmake = form.getValues("make");
  const defaultmodel = form.getValues("model");

  const [make, setMake] = useState<string | null>(defaultmake);
  const [makes, setMakes] =
    useState<FilterOptions<string, string>>([]);

  const [model, setModel] = useState<string | null>(defaultmodel);
  const [models, setModels] =
    useState<FilterOptions<string, string>>([]);

  const [modelvariant, setModelvariant] = useState<
    FilterOptions<string, string>
  >([]);

  useEffect(() => {
    (async function fetMakeoptions() {
      const url = new URL(endpoints.taxonomy, window.location.href);
      if (make) url.searchParams.append("make", make);
      if (model) url.searchParams.append("model", model);

      try {
        const data = await api.get<{
        makes: FilterOptions<string, string>;
        models: FilterOptions<string, string>;
        modelVariants: FilterOptions<string, string>;
      }>(url.toString() as string);

      console.log({ data });

      setMakes(data.makes);
      setModels(data.models);
      setModelvariant(data.modelVariants);
      } catch (error) {
        console.error("Error fetching taxonomy options:", error);
      }
    })();
  }, [make, model]);

  const handleChange = (
    e: ChangeEvent<HTMLSelectElement>,
    onChange: (...event: any[]) => void
  ) => {
    switch (e.target.name) {
      case "make":
        setMake(e.target.value);
        break;
      case "model":
        setModel(e.target.value);
        break;
    }
    return onChange(e);
  };

  return (
    <>
        <FormField
				control={form.control}
				name="make"
				render={({ field: { onChange, ref, ...rest } }) => (
					<FormItem>
						<FormLabel htmlFor="make">Make</FormLabel>
						<FormControl>
							<Select
								selectClassName="text-gray-500 bg-gray-800 border-transparent"
								options={makes}
								onChange={(e) => handleChange(e, onChange)}
								{...rest}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="model"
				render={({ field: { onChange, ref, ...rest } }) => (
					<FormItem>
						<FormLabel htmlFor="model">Model</FormLabel>
						<FormControl>
							<Select
								selectClassName="text-gray-500 bg-gray-800 border-transparent"
								options={models}
								onChange={(e) => handleChange(e, onChange)}
								{...rest}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="modelVariant"
				render={({ field: { onChange, ref, ...rest } }) => (
					<FormItem>
						<FormLabel htmlFor="modelVariant">Model Variant</FormLabel>
						<FormControl>
							<Select
								selectClassName="text-gray-500 bg-gray-800 border-transparent"
								options={modelvariant}
								onChange={(e) => handleChange(e, onChange)}
								{...rest}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
    </>
   
  );
};

export default TaxonomySelect;
