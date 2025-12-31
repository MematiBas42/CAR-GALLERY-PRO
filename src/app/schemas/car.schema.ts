import { z } from 'zod';
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
export const CarFilterSchema = z.object({
  q: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  modelVariant: z.string().optional(),
  minYear: z.string().optional(),
  maxYear: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  minReading: z.string().optional(),
  maxReading: z.string().optional(),
  currency: z.string().optional(),
  odoUnit: z.string().optional(),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  bodyType: z.string().optional(),
  colour: z.string().optional(),
  doors: z.string().optional(),
  seats: z.string().optional(),
  ulezCompliance: z.string().optional(),
});

export const updateCarSchema = z.object({
	id: z.number(),
	year: z.string(),
	make: z.string(),
	model: z.string(),
	modelVariant: z.string().optional(),
	description: z.string().optional().default(""),
	vrm: z.string().optional().default(""),
	odoReading: z.number().optional().default(0),
	doors: z.number().min(1).max(8).optional().default(5),
	seats: z.number().min(1).max(12).optional().default(5),
	ulezCompliance: z.nativeEnum(ULEZCompliance, {
		message: "Invalid ULEZ Compliance",
	}).optional().default(ULEZCompliance.EXEMPT),
	transmission: z.nativeEnum(Transmission, { message: "Invalid Transmission" }).optional().default(Transmission.AUTOMATIC),
	colour: z.nativeEnum(Colour, { message: "Invalid Colour" }).optional().default(Colour.BLACK),
	fuelType: z.nativeEnum(FuelType, { message: "Invalid Fuel Type" }).optional().default(FuelType.PETROL),
	bodyType: z.nativeEnum(BodyType, { message: "Invalid Body Type" }).optional().default(BodyType.SEDAN),
	odoUnit: z.nativeEnum(OdoUnit, { message: "Invalid Odo Unit" }).optional().default(OdoUnit.MILES),
	status: z.nativeEnum(ClassifiedStatus),
	currency: z.nativeEnum(CurrencyCode, { message: "Invalid Currency Code" }).optional().default(CurrencyCode.USD),
	price: z.number().optional().default(0),
	images: z.array(
		z.object({
			id: z.number().optional(),
			src: z.string(),
			alt: z.string(),
			uuid: z.string().uuid().optional(),
			base64: z.string().optional(),
			done: z.boolean().optional(),
		}),
	).optional().default([]),
});

export type UpdateCarType = z.infer<typeof updateCarSchema>;

export const createCarSchema = updateCarSchema.omit({ id: true });
export type CreateCarType = z.infer<typeof createCarSchema>;