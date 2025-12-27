"use server";
import { auth } from "@/auth";
import sanitizeHtml from 'sanitize-html';
import { routes } from "@/config/routes";
import { prisma } from "@/lib/prisma";
import { generateThumbHashFromSrUrl } from "@/lib/thumbhash-server";
import { revalidatePath } from "next/cache";
import { forbidden, redirect } from "next/navigation";
import slugify from "slugify";
import { createPngDataUri } from "unlazy/thumbhash";
import { CreateCarType, UpdateCarType } from "../schemas/car.schema";
import { getTranslations } from "next-intl/server";
import { deleteFromS3 } from "@/lib/s3";

// Helper to extract S3 Key from URL
const getS3KeyFromUrl = (url: string) => {
    // Expected format: https://bucket.s3.region.amazonaws.com/upload/uuid/name.jpg
    // We need: upload/uuid/name.jpg
    try {
        const urlObj = new URL(url);
        // Pathname usually starts with / so we remove it
        return urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
    } catch (e) {
        return "";
    }
}

export const createCarAction = async (data: CreateCarType) => {
  const t = await getTranslations("Admin.cars.messages");
  const session = await auth();
  if (!session) {
    forbidden();
  }

  let success = false;
  try {
    const makeId = Number(data.make);
    const modelId = Number(data.model);
    const modelVariantId = data.modelVariant ? Number(data.modelVariant) : null;

    const make = await prisma.make.findUnique({
      where: { id: makeId as number },
    });

    const model = await prisma.model.findUnique({
      where: { id: modelId as number },
    });

    let title = `${data.year} ${make?.name} ${model?.name}`;

    if (modelVariantId) {
      const modelVariant = await prisma.modelVariant.findUnique({
        where: { id: modelVariantId },
      });

      if (modelVariant) title = `${title} ${modelVariant.name}`;
    }

    const slug = slugify(`${title} ${data.vrm}`);
    
    const cleanDescription = sanitizeHtml(data.description, {
      allowedTags: [ 'p', 'a', 'strong', 'b', 'em', 'i', 'u', 'strike', 'br', 'ul', 'ol', 'li' ],
      allowedAttributes: { 'a': [ 'href', 'rel', 'target' ] }
    });

    const createdCar = await prisma.classified.create({
      data: {
        slug,
        title,
        year: Number(data.year),
        makeId,
        modelId,
        ...(modelVariantId && { modelVariantId }),
        vrm: data.vrm,
        price: data.price * 100,
        currency: data.currency,
        odoReading: data.odoReading,
        odoUnit: data.odoUnit,
        fuelType: data.fuelType,
        bodyType: data.bodyType,
        transmission: data.transmission,
        colour: data.colour,
        ulezCompliance: data.ulezCompliance,
        description: cleanDescription,
        doors: data.doors,
        seats: data.seats,
        status: data.status,
        images: {
          create: await Promise.all(
            data.images.map(async ({ src }, index) => {
              let uri = "";
              try {
                const hash = await generateThumbHashFromSrUrl(src);
                uri = createPngDataUri(hash);
              } catch (e) {
                console.error("Failed to generate thumbhash for image:", src, e);
                uri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
              }
              return {
                isMain: !index,
                blurhash: uri,
                src,
                alt: `${title} ${index + 1}`,
              };
            })
          ),
        },
      },
    });

    if (createdCar) success = true;

  } catch (err) {
    if (err instanceof Error) {
      return { success: false, message: err.message };
    }
    return { success: false, message: t("genericError") };
  }
  if (success) {
    revalidatePath(routes.admin.cars);
    redirect(routes.admin.cars);
  } else {
    return { success: false, message: t("createError") };
  }
};

export const updateCarAction = async (data: UpdateCarType) => {
  const t = await getTranslations("Admin.cars.messages");
  const session = await auth();
  if (!session) {
    forbidden();
  }

  let success = false;
  try {
    const makeId = Number(data.make);
    const modelId = Number(data.model);
    const modelVariantId = data.modelVariant ? Number(data.modelVariant) : null;

    const make = await prisma.make.findUnique({
      where: { id: makeId as number },
    });

    const model = await prisma.model.findUnique({
      where: { id: modelId as number },
    });

    let title = `${data.year} ${make?.name} ${model?.name}`;

    if (modelVariantId) {
      const modelVariant = await prisma.modelVariant.findUnique({
        where: { id: modelVariantId },
      });

      if (modelVariant) title = `${title} ${modelVariant.name}`;
    }

    const slug = slugify(`${title} ${data.vrm}`);
    
    // Get existing images to delete them from S3 later
    const existingCar = await prisma.classified.findUnique({
        where: { id: data.id },
        include: { images: true }
    });

    const [updatedCar, images] = await prisma.$transaction(
      async (prisma) => {
        // delete existing images from DB
        await prisma.image.deleteMany({
          where: {
            classifiedId: data.id,
          },
        });
        // update the classified
        const imagesData = await Promise.all(
          data.images.map(async ({ src }, index) => {
            let uri = "";
            try {
                const hash = await generateThumbHashFromSrUrl(src);
                uri = createPngDataUri(hash);
            } catch (e) {
                uri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
            }
            return {
              classifiedId: data.id,
              isMain: !index,
              blurhash: uri,
              src,
              alt: `${title} ${index + 1}`,
            };
          })
        );

        const images = await prisma.image.createManyAndReturn({
          data: imagesData,
        });

        const cleanDescription = sanitizeHtml(data.description, {
          allowedTags: [ 'p', 'a', 'strong', 'b', 'em', 'i', 'u', 'strike', 'br', 'ul', 'ol', 'li' ],
          allowedAttributes: { 'a': [ 'href', 'rel', 'target' ] }
        });

        const updatedCar = await prisma.classified.update({
          where: { id: data.id },
          data: {
            slug,
            title,
            year: Number(data.year),
            makeId,
            modelId,
            ...(modelVariantId && { modelVariantId }),
            vrm: data.vrm,
            price: data.price * 100,
            currency: data.currency,
            odoReading: data.odoReading,
            odoUnit: data.odoUnit,
            fuelType: data.fuelType,
            bodyType: data.bodyType,
            transmission: data.transmission,
            colour: data.colour,
            ulezCompliance: data.ulezCompliance,
            description: cleanDescription,
            doors: data.doors,
            seats: data.seats,
            status: data.status,
            images: { set: images.map((image) => ({ id: image.id })) },
          },
        });

        return [updatedCar, images];
      },
      { timeout: 10000 }
    );

    if (updatedCar && images) {
        success = true;
        // Clean up OLD images from S3 after successful DB update
        if (existingCar) {
            for (const img of existingCar.images) {
                // If the image is not in the new list, delete it from S3
                if (!data.images.find(newImg => newImg.src === img.src)) {
                    const key = getS3KeyFromUrl(img.src);
                    if (key) await deleteFromS3(key);
                }
            }
        }
    }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, message: err.message };
    }
    return { success: false, message: t("genericError") };
  }
  if (success) {
    revalidatePath(routes.admin.cars);
    redirect(routes.admin.cars);
  } else {
    return { success: false, message: t("updateError") };
  }
};


export const deleteCarAction = async (id: number) => {
  const t = await getTranslations("Admin.cars.messages");
  const session = await auth();
  if (!session) {
    forbidden();
  }

  try {
    // Get images first before deleting the car record
    const car = await prisma.classified.findUnique({
        where: { id },
        include: { images: true }
    });

    const deletedCar = await prisma.classified.delete({
      where: { id },
    });

    if (deletedCar) {
      // Clean up S3 images
      if (car) {
          for (const img of car.images) {
              const key = getS3KeyFromUrl(img.src);
              if (key) await deleteFromS3(key);
          }
      }
      revalidatePath(routes.admin.cars);
      return { success: true, message: t("deleteSuccess") };
    } else {
      return { success: false, message: t("deleteError") };
    }
  } catch (error) {
    console.error("Error deleting car:", error);
    return { success: false, message: t("deleteError") };
  }
}
