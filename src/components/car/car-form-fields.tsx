'use client';

import { ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";
import dynamic from "next/dynamic";
import {
  BodyType, Colour, CurrencyCode, FuelType, OdoUnit, Transmission, ULEZCompliance
} from "@prisma/client";

import { formatBodyType, formatColour, formatFuelType, formatTransmission, generateYears } from "@/lib/utils";
import { FilterOptions } from "@/config/types";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import { SmartCombobox } from "../ui/smart-combobox";
import InputSelect from "../ui/input-select";
import { NumberInput } from "../ui/number-input";
import { useTranslations } from "next-intl";

const RichTextEditor = dynamic(
  () => import("./rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => {
      const t = useTranslations("Admin.cars.form");
      return (
        <div className="space-y-2 flex flex-col">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      );
    },
  }
);

const years = generateYears(1925);

interface CarFormFieldProps {
  makes: FilterOptions<string, string>;
  models: FilterOptions<string, string>;
  modelVariants: FilterOptions<string, string>;
  isLoading: boolean;
}

const CarFormField = ({ makes, models, modelVariants, isLoading }: CarFormFieldProps) => {
  const t = useTranslations("Admin.cars.form");
  const form = useFormContext();

  const handleChange = (
    e: ChangeEvent<HTMLSelectElement>,
    onChange: (...event: any[]) => void
  ) => {
    switch (e.target.name) {
      case "make":
        form.setValue("model", "");
        form.setValue("modelVariant", "");
        break;
      case "model":
        form.setValue("modelVariant", "");
        break;
    }
    return onChange(e);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
      <FormField
        control={form.control}
        name="year"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="year">{t("year")}</FormLabel>
            <FormControl>
              <Select
                {...field}
                className="text-white bg-transparent border-input"
                options={years.map((year) => ({ label: year, value: year }))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="make"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="make">{t("make")}</FormLabel>
            <FormControl>
              {isLoading ? <Skeleton className="h-10" /> : <SmartCombobox
                options={makes}
                value={field.value ? String(field.value) : ""}
                onChange={(val) => {
                  field.onChange(val);
                  form.setValue("model", "");
                  form.setValue("modelVariant", "");
                }}
                enableCreate={true}
                enableDelete={true}
                entityType="make"
                placeholder={t("makePlaceholder") || "Select make..."}
                emptyText="No make found."
              />}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="model"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="model">{t("model")}</FormLabel>
            <FormControl>
              {isLoading ? <Skeleton className="h-10" /> : <SmartCombobox
                options={models}
                value={field.value ? String(field.value) : ""}
                onChange={(val) => {
                  field.onChange(val);
                  form.setValue("modelVariant", "");
                }}
                enableCreate={!!form.watch("make")} // Only enable create if make is selected
                enableDelete={true}
                entityType="model"
                parentId={form.watch("make")}
                placeholder={t("modelPlaceholder") || "Select model..."}
                emptyText="No model found."
              />}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="modelVariant"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="modelVariant">{t("variant")}</FormLabel>
            <FormControl>
              {isLoading ? <Skeleton className="h-10" /> : <SmartCombobox
                options={modelVariants}
                value={field.value ? String(field.value) : ""}
                onChange={(val) => {
                  field.onChange(val);
                }}
                enableCreate={!!form.watch("model")}
                enableDelete={true}
                entityType="variant"
                parentId={form.watch("model")}
                placeholder={t("variantPlaceholder") || "Select variant..."}
                emptyText="No variant found."
              />}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="price"
        render={({ field: { onChange, ...rest } }) => (
          <FormItem>
            <FormLabel htmlFor="price">{t("price")} (USD)</FormLabel>
            <FormControl>
              <NumberInput
                {...rest}
                placeholder="0"
                className="text-white"
                onValueChange={(values) => { onChange(values.floatValue); }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <input type="hidden" {...form.register("currency")} value="USD" />

      <InputSelect
        options={Object.values(OdoUnit).map((value) => ({ label: value, value }))}
        label={t("odoReading")}
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
            <FormLabel htmlFor="transmission">{t("transmission")}</FormLabel>
            <FormControl>
              <Select
                {...field}
                className="text-white"
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
            <FormLabel htmlFor="fuelType">{t("fuelType")}</FormLabel>
            <FormControl>
              <Select
                {...field}
                className="text-white"
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
            <FormLabel htmlFor="bodyType">{t("bodyType")}</FormLabel>
            <FormControl>
              <Select
                {...field}
                className="text-white"
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
            <FormLabel htmlFor="colour">{t("colour")}</FormLabel>
            <FormControl>
              <Select
                {...field}
                className="text-white"
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
            <FormLabel htmlFor="ulezCompliance">{t("ulez")}</FormLabel>
            <FormControl>
              <Select
                {...field}
                className="text-white"
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
            <FormLabel htmlFor="vrm">{t("vrm")}</FormLabel>
            <FormControl>
              <Input placeholder="LA16 PYW" className="uppercase text-white bg-transparent border-input" {...field} />
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
            <FormLabel htmlFor="doors">{t("doors")}</FormLabel>
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
            <FormLabel htmlFor="seats">{t("seats")}</FormLabel>
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
              <FormLabel>{t("description")}</FormLabel>
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
