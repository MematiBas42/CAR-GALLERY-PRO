"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { forbidden } from "next/navigation";
import { z } from "zod";

// --- CREATE ACTIONS ---

const createMakeSchema = z.object({
  name: z.string().min(1),
  image: z.string().url(),
});

export const createMakeAction = async (data: z.infer<typeof createMakeSchema>) => {
  const session = await auth();
  if (!session) forbidden();

  try {
    const existingMake = await prisma.make.findUnique({ where: { name: data.name } });
    if (existingMake) return { success: false, message: "Make already exists", make: existingMake };

    const newMake = await prisma.make.create({ data });
    revalidatePath("/admin/cars");
    return { success: true, message: "Make created successfully", make: newMake };
  } catch (error) {
    console.error("Error creating make:", error);
    return { success: false, message: "Failed to create make" };
  }
};

const createModelSchema = z.object({
  name: z.string().min(1),
  makeId: z.number(),
});

export const createModelAction = async (data: z.infer<typeof createModelSchema>) => {
  const session = await auth();
  if (!session) forbidden();

  try {
    const existingModel = await prisma.model.findUnique({
      where: { makeId_name: { makeId: data.makeId, name: data.name } },
    });
    if (existingModel) return { success: false, message: "Model already exists", model: existingModel };

    const newModel = await prisma.model.create({ data });
    revalidatePath("/admin/cars");
    return { success: true, message: "Model created successfully", model: newModel };
  } catch (error) {
    console.error("Error creating model:", error);
    return { success: false, message: "Failed to create model" };
  }
};

const createVariantSchema = z.object({
  name: z.string().min(1),
  modelId: z.number(),
});

export const createVariantAction = async (data: z.infer<typeof createVariantSchema>) => {
  const session = await auth();
  if (!session) forbidden();

  try {
    const existingVariant = await prisma.modelVariant.findUnique({
      where: { modelId_name: { modelId: data.modelId, name: data.name } },
    });
    if (existingVariant) return { success: false, message: "Variant already exists", variant: existingVariant };

    // Default years (can be edited later if needed)
    const newVariant = await prisma.modelVariant.create({
      data: { ...data, yearStart: 2000, yearEnd: 2025 },
    });
    revalidatePath("/admin/cars");
    return { success: true, message: "Variant created successfully", variant: newVariant };
  } catch (error) {
    console.error("Error creating variant:", error);
    return { success: false, message: "Failed to create variant" };
  }
};

// --- DELETE ACTIONS ---

import { deleteFromS3 } from "@/lib/s3";
import { getS3KeyFromUrl } from "@/lib/utils";

export const deleteMakeAction = async (id: number) => {
  const session = await auth();
  if (!session) forbidden();

  try {
    const make = await prisma.make.findUnique({ where: { id } });
    
    await prisma.make.delete({ where: { id } });

    // Clean up logo from S3 if it exists and is an S3 URL
    if (make?.image && make.image.includes('amazonaws.com')) {
        const key = getS3KeyFromUrl(make.image);
        if (key) await deleteFromS3(key);
    }

    revalidatePath("/admin/cars");
    return { success: true, message: "Make deleted successfully" };
  } catch (error) {
    console.error("Error deleting make:", error);
    return { success: false, message: "Failed to delete make (might be in use)" };
  }
};

export const deleteModelAction = async (id: number) => {
  const session = await auth();
  if (!session) forbidden();

  try {
    await prisma.model.delete({ where: { id } });
    revalidatePath("/admin/cars");
    return { success: true, message: "Model deleted successfully" };
  } catch (error) {
    console.error("Error deleting model:", error);
    return { success: false, message: "Failed to delete model" };
  }
};

export const deleteVariantAction = async (id: number) => {
  const session = await auth();
  if (!session) forbidden();

  try {
    await prisma.modelVariant.delete({ where: { id } });
    revalidatePath("/admin/cars");
    return { success: true, message: "Variant deleted successfully" };
  } catch (error) {
    console.error("Error deleting variant:", error);
    return { success: false, message: "Failed to delete variant" };
  }
};
