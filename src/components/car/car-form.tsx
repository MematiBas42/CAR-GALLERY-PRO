"use client";
import {
  createCarSchema,
  CreateCarType,
  updateCarSchema,
  UpdateCarType,
} from "@/app/schemas/car.schema";
import { CarWithImages } from "@/config/types";
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
import React, { useTransition } from "react";
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

interface CarFormProps {
  car?: CarWithImages;
}

const CarForm = ({ car }: CarFormProps) => {
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!car;

  const form = useForm<CreateCarType | UpdateCarType>({
    resolver: zodResolver(isEditMode ? updateCarSchema : createCarSchema),
    defaultValues: isEditMode
      ? {
          id: car.id,
          odoUnit: car.odoUnit,
          currency: car.currency,
          images: car.images?.map(img => ({ ...img, uuid: uuidv4(), done: true, percentage: 100 })) || [],
          make: car.makeId.toString(),
          model: car.modelId.toString(),
          modelVariant: car.modelVariantId?.toString(),
          year: car.year.toString(),
          vrm: car.vrm ?? "",
          description: car.description ?? "",
          fuelType: car.fuelType,
          bodyType: car.bodyType,
          transmission: car.transmission,
          colour: car.colour,
          ulezCompliance: car.ulezCompliance,
          status: car.status,
          odoReading: car.odoReading,
          seats: car.seats,
          doors: car.doors,
          price: car.price / 100,
        }
      : {
          images: [],
          year: "",
          make: "",
          model: "",
          modelVariant: "",
          description: "",
          vrm: "",
          odoReading: undefined,
          price: undefined,
          doors: undefined,
          seats: undefined,
          fuelType: FuelType.PETROL,
          bodyType: BodyType.SEDAN,
          transmission: Transmission.AUTOMATIC,
          colour: Colour.BLACK,
          ulezCompliance: ULEZCompliance.EXEMPT,
          odoUnit: OdoUnit.MILES,
          status: ClassifiedStatus.FOR_SALE,
          currency: CurrencyCode.EUR,
        },
  });

  const carformSubmit: SubmitHandler<CreateCarType | UpdateCarType> = async (
    data
  ) => {
    startTransition(async () => {
      const action = isEditMode ? updateCarAction : createCarAction;
      // @ts-ignore
      const result = await action(data);
      if (result?.success) {
        toast.success(isEditMode ? "Car updated" : "Car created");
      } else {
        toast.error(`Error: ${result?.message}`);
      }
    });
  };

  return (
    <Form {...form}>
      <form action="" onSubmit={form.handleSubmit(carformSubmit)}>
        <h1 className="text-3xl font-bold mb-6">
          {isEditMode ? "Edit Vehicle Details" : "Create New Vehicle"}
        </h1>
        <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CarFormField />
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="images"
              render={({ field: { name, onChange, value } }) => (
                <FormItem>
                  <FormLabel htmlFor="images">Images (up to 8)</FormLabel>
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
                  <FormLabel htmlFor="status">Status</FormLabel>
                  <FormControl>
                    <Select
                      options={Object.values(ClassifiedStatus).map((value) => ({
                        label: formatCarStatus(value),
                        value,
                      }))}
                      noDefault={false}
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
              {isEditMode ? "Update Car" : "Create Car"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CarForm;
