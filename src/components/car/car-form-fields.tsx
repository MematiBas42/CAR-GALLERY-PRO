"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import dynamic from "next/dynamic";
import {
  BodyType, Colour, CurrencyCode, FuelType, OdoUnit, Transmission, ULEZCompliance
} from "@prisma/client";

import { api } from "@/lib/api-client";
import { formatBodyType, formatColour, formatFuelType, formatTransmission, generateYears } from "@/lib/utils";
import { endpoints } from "@/config/endpoints";
import { FilterOptions } from "@/config/types";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import InputSelect from "../ui/input-select";
import { NumberInput } from "../ui/number-input";

const RichTextEditor = dynamic(
  () => import("./rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2 flex flex-col">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    ),
  }
);

const years = generateYears(1925);

const CarFormField = () => {
  const form = useFormContext();

  // Logic from TaxonomySelect starts here
  const defaultmake = form.getValues("make");
  const defaultmodel = form.getValues("model");

  const [make, setMake] = useState<string | null>(defaultmake);
  const [makes, setMakes] = useState<FilterOptions<string, string>>([]);
  const [model, setModel] = useState<string | null>(defaultmodel);
  const [models, setModels] = useState<FilterOptions<string, string>>([]);
  const [modelvariant, setModelvariant] = useState<FilterOptions<string, string>>([]);

  useEffect(() => {
    (async function fetchTaxonomyOptions() {
      const url = new URL(endpoints.taxonomy, window.location.origin);
      if (make) url.searchParams.append("make", make);
      if (model) url.searchParams.append("model", model);

      try {
        const data = await api.get<{
          makes: FilterOptions<string, string>;
          models: FilterOptions<string, string>;
          modelVariants: FilterOptions<string, string>;
        }>(url.toString());

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
        form.setValue("model", ""); // Reset model on make change
        form.setValue("modelVariant", ""); // Reset variant on make change
        break;
      case "model":
        setModel(e.target.value);
        form.setValue("modelVariant", ""); // Reset variant on model change
        break;
    }
    return onChange(e);
  };
  // Logic from TaxonomySelect ends here

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
      <FormField
        control={form.control}
        name="year"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="year">Year</FormLabel>
            <FormControl>
              <Select
                {...field}
                options={years.map((year) => ({ label: year, value: year }))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Inlined Taxonomy Fields Start */}
      <FormField
        control={form.control}
        name="make"
        render={({ field: { onChange, ...rest } }) => (
          <FormItem>
            <FormLabel htmlFor="make">Make</FormLabel>
            <FormControl>
              <Select
                {...rest}
                options={makes}
                onChange={(e) => handleChange(e, onChange)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="model"
        render={({ field: { onChange, ...rest } }) => (
          <FormItem>
            <FormLabel htmlFor="model">Model</FormLabel>
            <FormControl>
              <Select
                {...rest}
                options={models}
                onChange={(e) => handleChange(e, onChange)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="modelVariant"
        render={({ field: { onChange, ...rest } }) => (
          <FormItem>
            <FormLabel htmlFor="modelVariant">Model Variant</FormLabel>
            <FormControl>
              <Select
                {...rest}
                options={modelvariant}
                onChange={(e) => handleChange(e, onChange)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Inlined Taxonomy Fields End */}

      <InputSelect
        options={Object.values(CurrencyCode).map((currency) => ({ label: currency, value: currency }))}
        label="Price"
        inputName="price"
        selectName="currency"
        inputMode="numeric"
        placeholder="0"
      />
      <InputSelect
        options={Object.values(OdoUnit).map((value) => ({ label: value, value }))}
        label="Odometer Reading"
        inputName="odoReading"
        selectName="odoUnit"
        inputMode="numeric"
        placeholder="0"
      />
      <FormField
        control={form.control}
        name="transmission"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="transmission">Transmission</FormLabel>
            <FormControl>
              <Select
                {...field}
                options={Object.values(Transmission).map((value) => ({ label: formatTransmission(value), value }))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="fuelType"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="fuelType">Fuel Type</FormLabel>
            <FormControl>
              <Select
                {...field}
                options={Object.values(FuelType).map((value) => ({ label: formatFuelType(value), value }))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="bodyType"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="bodyType">Body Type</FormLabel>
            <FormControl>
              <Select
                {...field}
                options={Object.values(BodyType).map((value) => ({ label: formatBodyType(value), value }))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="colour"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="colour">Colour</FormLabel>
            <FormControl>
              <Select
                {...field}
                options={Object.values(Colour).map((value) => ({ label: formatColour(value), value }))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="ulezCompliance"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="ulezCompliance">ULEZ Compliance</FormLabel>
            <FormControl>
              <Select
                {...field}
                options={Object.values(ULEZCompliance).map((value) => ({ label: value, value }))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="vrm"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="vrm">Vehicle Registration Mark</FormLabel>
            <FormControl>
              <Input placeholder="LA16 PYW" className="uppercase text-white" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="doors"
        render={({ field: { onChange, ...rest } }) => (
          <FormItem>
            <FormLabel htmlFor="doors">Doors</FormLabel>
            <FormControl>
              <NumberInput
                {...rest}
                max={6}
                min={1}
                placeholder="0"
                className="text-white"
                onValueChange={(values) => { onChange(values.floatValue); }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="seats"
        render={({ field: { onChange, ...rest } }) => (
          <FormItem>
            <FormLabel htmlFor="seats">Seats</FormLabel>
            <FormControl>
              <NumberInput
                {...rest}
                max={8}
                min={1}
                placeholder="0"
                className="text-white"
                onValueChange={(values) => { onChange(values.floatValue); }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="col-span-2">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor name={field.name} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default CarFormField;