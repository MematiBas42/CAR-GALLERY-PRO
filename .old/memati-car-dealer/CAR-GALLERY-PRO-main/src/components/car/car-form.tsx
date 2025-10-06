"use client";
import { updateCarSchema, UpdateCarType } from "@/app/schemas/car.schema";
import { CarWithImages } from "@/config/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClassifiedStatus, CurrencyCode, Prisma } from "@prisma/client";
import React, { useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Form } from "../ui/form";
import { updateCarAction } from "@/app/_actions/car";
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
interface CarFormProps {
  car: CarWithImages;
}

function extractKey(url: string) {
  const nextUrl = new URL(url);
  nextUrl.href = url;
  const regex = /upload\/.+/;
  const match = url.match(regex);

  return match ? match[0] : url;
}
const CarForm = ({ car }: CarFormProps) => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateCarType>({
    resolver: zodResolver(updateCarSchema),
    defaultValues: {
      id: car.id,
      odoUnit: car.odoUnit,
      currency: CurrencyCode.EUR,
      ...(car && {
        images: car.images
          ? car.images.map((image, index) => ({
              ...image,
              id: index + 1, // Assuming images are indexed starting from 1
              percentage: 100, // Default percentage for each image
              key: extractKey(image.src), // Extract key from the image URL
              done: true,
            }))
          : [],
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
      }),
    },
  });

  const carformSubmit: SubmitHandler<UpdateCarType> = async (data) => {
    startTransition(async () => {
      const { success, message } = await updateCarAction(data);
      if (!success) {
        toast.error("Error updating this car", {
          description: message,
          duration: 2500,
        });
      }
    });
  };
  return (
    <Form {...form}>
      <form action="" onSubmit={form.handleSubmit(carformSubmit)}>
        <h1 className="text-3xl font-bold mb-6 text-muted">
          Upload vehicles details
        </h1>
        <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CarFormField />
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="images"
              render={({ field: { name, onChange } }) => (
                <FormItem>
                  <FormLabel className="text-muted" htmlFor="images">
                    Images (up to 8)
                  </FormLabel>
                  <FormControl>
                     <MultiImageUploader name={name} onChange={onChange} /> 
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
                  <FormLabel className="text-muted" htmlFor="status">
                    Status
                  </FormLabel>
                  <FormControl>
                    <Select
                      options={Object.values(ClassifiedStatus).map((value) => ({
                        label: formatCarStatus(value),
                        value,
                      }))}
                      noDefault={false}
                      selectClassName="bg-primary-800 border-transparent text-muted/75"
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
              className="w-full flex gap-x-2 bg-yellow-400"
            >
              {isPending && <Loader2 className="animate-spin h-4 w-4" />}
              Submit
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CarForm;
