'use client';
import {
  createCarSchema,
  CreateCarType,
  updateCarSchema,
  UpdateCarType,
} from "@/app/schemas/car.schema";
import { CarWithImages, FilterOptions } from "@/config/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BodyType,
  ClassifiedStatus,
  Colour,
  CurrencyCode,
  FuelType,
  OdoUnit,
  Transmission,
  ULEZCompliance,
} from "@prisma/client";
import React, { ChangeEvent, useEffect, useState, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { createCarAction, updateCarAction } from "@/app/_actions/car";
import { toast } from "sonner";
import CarFormField from "./car-form-fields";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Select } from "../ui/select";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { formatCarStatus } from "@/lib/utils";
import MultiImageUploader from "./mutil-image-uploader";
import { v4 as uuidv4 } from "uuid";
import { endpoints } from "@/config/endpoints";
import { api } from "@/lib/api-client";
import { useTranslations } from "next-intl";

interface CarFormProps {
  car?: CarWithImages;
}

const CarForm = ({ car }: CarFormProps) => {
  const t = useTranslations("Admin.cars");
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!car;

  const [makes, setMakes] = useState<FilterOptions<string, string>>([]);
  const [models, setModels] = useState<FilterOptions<string, string>>([]);
  const [modelVariants, setModelVariants] = useState<FilterOptions<string, string>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const defaultValues = isEditMode && car ? {
        id: car.id,
        odoUnit: car.odoUnit,
        currency: car.currency,
        images: car.images?.map(img => ({ ...img, uuid: uuidv4(), done: true, percentage: 100 })) || [],
        make: car.makeId.toString(),
        model: car.modelId.toString(),
        modelVariant: car.modelVariantId?.toString() || "",
        year: car.year.toString(),
        vrm: car.vrm ?? "",
        description: car.description ?? "",
        fuelType: car.fuelType,
        bodyType: car.bodyType,
        transmission: car.transmission,
        colour: car.colour,
        ulezCompliance: car.ulezCompliance,
        status: car.status,
        odoReading: car.odoReading ?? 0,
        seats: car.seats ?? 0,
        doors: car.doors ?? 0,
        price: car.price ? (car.price / 100) : 0,
  } : {
          images: [], year: "", make: "", model: "", modelVariant: "",
          description: "", vrm: "", odoReading: undefined, price: undefined, doors: undefined, seats: undefined,
          fuelType: FuelType.PETROL, bodyType: BodyType.SEDAN, transmission: Transmission.AUTOMATIC,
          colour: Colour.BLACK, ulezCompliance: ULEZCompliance.EXEMPT, odoUnit: OdoUnit.MILES,
          status: ClassifiedStatus.DRAFT, currency: CurrencyCode.GBP,
  };

  const form = useForm<CreateCarType | UpdateCarType>({
    resolver: zodResolver(isEditMode ? updateCarSchema : createCarSchema),
    defaultValues,
  });

  const make = form.watch("make");
  const model = form.watch("model");

  useEffect(() => {
    const fetchTaxonomy = async () => {
      setIsLoading(true);
      const url = new URL(endpoints.taxonomy, window.location.origin);
      url.searchParams.append("all", "true"); // Fetch all taxonomies for admin
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
        setModelVariants(data.modelVariants);
      } catch (error) {
        console.error("Failed to fetch taxonomy", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaxonomy();
  }, [make, model]);

  const carformSubmit: SubmitHandler<CreateCarType | UpdateCarType> = async (data) => {
    startTransition(async () => {
      const action = isEditMode ? updateCarAction : createCarAction;
      const result = await action(data as any); // Casting to any to avoid type conflicts
      if (result?.success) {
        toast.success(isEditMode ? t("successUpdated") : t("successCreated"));
      } else {
        toast.error(`${t("error")}: ${result?.message}`);
      }
    });
  };

  return (
    <Form {...form}>
      <form action="" onSubmit={form.handleSubmit(carformSubmit as any)}>
        <h1 className="text-3xl font-bold mb-6">
          {isEditMode ? t("editTitle") : t("createTitle")}
        </h1>
        <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CarFormField 
            makes={makes}
            models={models}
            modelVariants={modelVariants}
            isLoading={isLoading}
          />
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="images"
              render={({ field: { name, onChange, value } }) => (
                <FormItem>
                  <FormLabel htmlFor="images">{t("imagesLabel")}</FormLabel>
                  <FormControl>
                    <MultiImageUploader name={name} onChange={onChange} value={value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field: { ref, ...rest } }) => (
                <FormItem>
                  <FormLabel htmlFor="status">{t("statusLabel")}</FormLabel>
                  <FormControl>
                    <Select
                      options={Object.values(ClassifiedStatus).map((value) => ({
                        label: formatCarStatus(value),
                        value,
                      }))}
                      noDefault={false}
                      className="text-white bg-transparent border-input"
                      {...rest}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={isPending}
              type="submit"
              className="w-full flex gap-x-2"
            >
              {isPending && <Loader2 className="animate-spin h-4 w-4" />}
              {isEditMode ? t("updateButton") : t("createButton")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CarForm;