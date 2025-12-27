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
import { sendTemplatedEmail } from "@/lib/email-service";
import { CustomerStatus } from "@prisma/client";

// Helper to extract S3 Key from URL
const getS3KeyFromUrl = (url: string) => {
    try {
        if (url.startsWith('http')) {
            const urlObj = new URL(url);
            // Removes leading slash: /upload/uuid/file.jpg -> upload/uuid/file.jpg
            return urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;
        }
        // If it's already a relative path
        return url.startsWith('/') ? url.substring(1) : url;
    } catch (e) {
        return "";
    }
}

export const createCarAction = async (data: CreateCarType) => {
  const t = await getTranslations("Admin.cars.messages");
  const session = await auth();
  if (!session) forbidden();

  let success = false;
  try {
    const makeId = Number(data.make);
    const modelId = Number(data.model);
    const modelVariantId = data.modelVariant ? Number(data.modelVariant) : null;

    const make = await prisma.make.findUnique({ where: { id: makeId } });
    const model = await prisma.model.findUnique({ where: { id: modelId } });

    let title = `${data.year} ${make?.name} ${model?.name}`;
    if (modelVariantId) {
      const modelVariant = await prisma.modelVariant.findUnique({ where: { id: modelVariantId } });
      if (modelVariant) title = `${title} ${modelVariant.name}`;
    }

    const slug = slugify(`${title} ${data.vrm}`);
    const cleanDescription = sanitizeHtml(data.description, {
      allowedTags: [ 'p', 'a', 'strong', 'b', 'em', 'i', 'u', 'strike', 'br', 'ul', 'ol', 'li' ],
      allowedAttributes: { 'a': [ 'href', 'rel', 'target' ] }
    });

    const createdCar = await prisma.classified.create({
      data: {
        slug, title, year: Number(data.year), makeId, modelId,
        ...(modelVariantId && { modelVariantId }),
        vrm: data.vrm, price: data.price * 100, currency: data.currency,
        odoReading: data.odoReading, odoUnit: data.odoUnit,
        fuelType: data.fuelType, bodyType: data.bodyType,
        transmission: data.transmission, colour: data.colour,
        ulezCompliance: data.ulezCompliance, description: cleanDescription,
        doors: data.doors, seats: data.seats, status: data.status,
        images: {
          create: await Promise.all(
            data.images.map(async ({ src }, index) => {
              let uri = "";
              try {
                const hash = await generateThumbHashFromSrUrl(src);
                uri = createPngDataUri(hash);
              } catch (e) {
                uri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
              }
              return { isMain: !index, blurhash: uri, src, alt: `${title} ${index + 1}` };
            })
          ),
        },
      },
    });
    if (createdCar) {
      success = true;

      // AUTO-NOTIFICATION: New Inventory Arrival
      if (createdCar.status === "LIVE") {
        try {
          const subscribers = await prisma.customer.findMany({
            where: { status: CustomerStatus.SUBSCRIBER },
            select: { email: true, firstName: true }
          });

          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
          
          for (const sub of subscribers) {
            await sendTemplatedEmail(sub.email, "New Inventory Arrival", {
              name: sub.firstName,
              carTitle: createdCar.title,
              description: createdCar.description?.substring(0, 150).replace(/<[^>]*>?/gm, '') + "...",
              link: `${appUrl}/inventory/${createdCar.slug}`
            });
          }
        } catch (e) {
          console.error("New Arrival Email error:", e);
        }
      }
    }
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : t("genericError") };
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
  if (!session) forbidden();

  let success = false;
  try {
    const makeId = Number(data.make);
    const modelId = Number(data.model);
    const modelVariantId = data.modelVariant ? Number(data.modelVariant) : null;

    const make = await prisma.make.findUnique({ where: { id: makeId } });
    const model = await prisma.model.findUnique({ where: { id: modelId } });
    let title = `${data.year} ${make?.name} ${model?.name}`;
    if (modelVariantId) {
      const modelVariant = await prisma.modelVariant.findUnique({ where: { id: modelVariantId } });
      if (modelVariant) title = `${title} ${modelVariant.name}`;
    }

    const existingCar = await prisma.classified.findUnique({ where: { id: data.id }, include: { images: true } });
    if (!existingCar) return { success: false, message: t("notFound") };

    const oldPrice = existingCar.price;
    const newPrice = data.price * 100;

    await prisma.$transaction(async (prisma) => {
      await prisma.image.deleteMany({ where: { classifiedId: data.id } });
      const imagesData = await Promise.all(
        data.images.map(async ({ src }, index) => {
          let uri = "";
          try {
            const hash = await generateThumbHashFromSrUrl(src);
            uri = createPngDataUri(hash);
          } catch (e) {
            uri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
          }
          return { classifiedId: data.id, isMain: !index, blurhash: uri, src, alt: `${title} ${index + 1}` };
        })
      );
      const images = await prisma.image.createManyAndReturn({ data: imagesData });
      const cleanDescription = sanitizeHtml(data.description, {
        allowedTags: [ 'p', 'a', 'strong', 'b', 'em', 'i', 'u', 'strike', 'br', 'ul', 'ol', 'li' ],
        allowedAttributes: { 'a': [ 'href', 'rel', 'target' ] }
      });
      await prisma.classified.update({
        where: { id: data.id },
        data: {
          slug: slugify(`${title} ${data.vrm}`), title, year: Number(data.year),
          makeId, modelId, ...(modelVariantId && { modelVariantId }),
          vrm: data.vrm, price: newPrice, currency: data.currency,
          odoReading: data.odoReading, odoUnit: data.odoUnit,
          fuelType: data.fuelType, bodyType: data.bodyType,
          transmission: data.transmission, colour: data.colour,
          ulezCompliance: data.ulezCompliance, description: cleanDescription,
          doors: data.doors, seats: data.seats, status: data.status,
          images: { set: images.map((image) => ({ id: image.id })) },
        },
      });
    });

    success = true;

    // AUTO-NOTIFICATION: Price Drop Alert
    if (newPrice < oldPrice && data.status === "LIVE") {
      try {
        const interestedCustomers = await prisma.customer.findMany({
          where: { 
            OR: [
              { classifiedId: data.id },
              { status: CustomerStatus.SUBSCRIBER }
            ]
          },
          select: { email: true, firstName: true }
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const currencySymbol = data.currency === "USD" ? "$" : data.currency === "GBP" ? "£" : "€";

        for (const customer of interestedCustomers) {
          await sendTemplatedEmail(customer.email, "Price Drop Alert", {
            name: customer.firstName,
            carTitle: title,
            newPrice: `${currencySymbol}${(newPrice / 100).toLocaleString()}`,
            link: `${appUrl}/inventory/${slugify(`${title} ${data.vrm}`)}`
          });
        }
      } catch (e) {
        console.error("Price Drop Email error:", e);
      }
    }

    if (existingCar) {
        for (const img of existingCar.images) {
            if (!data.images.find(newImg => newImg.src === img.src)) {
                const key = getS3KeyFromUrl(img.src);
                if (key) await deleteFromS3(key);
            }
        }
    }
  } catch (err) {
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
  if (!session) forbidden();

  try {
    const car = await prisma.classified.findUnique({ where: { id }, include: { images: true } });
    const deletedCar = await prisma.classified.delete({ where: { id } });

    if (deletedCar && car) {
      for (const img of car.images) {
          const key = getS3KeyFromUrl(img.src);
          if (key) await deleteFromS3(key);
      }
      revalidatePath(routes.admin.cars);
      return { success: true, message: t("deleteSuccess") };
    }
    return { success: false, message: t("deleteError") };
  } catch (error) {
    return { success: false, message: t("deleteError") };
  }
}

export const toggleLatestArrivalAction = async (id: number, isLatest: boolean) => {
  const session = await auth();
  if (!session) forbidden();
  try {
    await prisma.classified.update({ where: { id }, data: { isLatestArrival: isLatest } });
    revalidatePath("/admin/latest-arrivals");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to update status" };
  }
};