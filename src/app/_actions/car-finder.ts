"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { genericRateLimit } from "@/lib/rate-limiter";
import { z } from "zod";

const carFinderSchema = z.object({
  make: z.string().min(2, "Make is required"),
  model: z.string().optional(),
  yearMin: z.union([z.string(), z.number()]).transform(val => val ? Number(val) : null).optional(),
  yearMax: z.union([z.string(), z.number()]).transform(val => val ? Number(val) : null).optional(),
  budget: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is required"),
  message: z.string().optional(),
  color: z.string().optional(),
  transmission: z.string().optional(),
});

export async function submitCarFinderRequest(rawData: any) {
    try {
        // 1. Security: Rate Limiting
        const limitCheck = await genericRateLimit("car-finder");
        if (limitCheck) {
            return { success: false, error: limitCheck.message };
        }

        // 2. Security: Validation
        const validation = carFinderSchema.safeParse(rawData);
        if (!validation.success) {
            return { success: false, error: "Invalid data: " + validation.error.issues[0].message };
        }
        const data = validation.data;

        if (!prisma.carFinderRequest) {
             console.error("Prisma CarFinderRequest model is undefined. Restart server.");
             return { success: false, error: "System update required. Please try again later." };
        }

        await prisma.carFinderRequest.create({
            data: {
                make: data.make,
                model: data.model || "",
                yearMin: data.yearMin || undefined,
                yearMax: data.yearMax || undefined,
                budget: data.budget || undefined,
                transmission: data.transmission,
                color: data.color,
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                email: data.email,
                phone: data.phone,
                message: data.message
            }
        });
        
        return { success: true };
    } catch (error) {
        console.error("Car Finder Submit Error:", error);
        return { success: false, error: "Database error" };
    }
}
