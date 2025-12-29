"use server";
import { auth } from "@/auth";
import sanitizeHtml from 'sanitize-html';
import { requireAdmin } from "@/lib/auth-guard";
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
import { sendEmailWithContent } from "@/lib/email-service";
import { CustomerStatus } from "@prisma/client";
import { getImageUrl, getS3KeyFromUrl } from "@/lib/utils";
import { redis } from "@/lib/redis-store";
import { generateTaxonomyData } from "@/lib/taxonomy-utils";

const TAXONOMY_CACHE_KEY = "global_taxonomy_data";

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

    const slug = slugify(`${title} ${data.vrm}`, { lower: true });
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
                // Ensure thumbhash gets the FULL URL even if we store the KEY
                const fullImageUrl = getImageUrl(src);
                const hash = await generateThumbHashFromSrUrl(fullImageUrl);
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
      // Invalidate Cache and Update Static JSON
      await redis.del(TAXONOMY_CACHE_KEY);
      await generateTaxonomyData();
      
      // AUTO-NOTIFICATION: New Inventory Arrival
      if (createdCar.status === "LIVE") {
          try {
            console.log("📧 Starting New Arrival Email process...");
            const template = await prisma.emailTemplate.findFirst({
              where: { name: "New Inventory Arrival" }
            });

            if (!template) {
                console.error("❌ Email Template 'New Inventory Arrival' not found in DB.");
            } else {
                const subscribers = await prisma.customer.findMany({
                where: { status: CustomerStatus.SUBSCRIBER },
                select: { email: true, firstName: true }
                });
                
                console.log(`📧 Found ${subscribers.length} subscribers.`);

                if (subscribers.length > 0) {
                    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rimglobalauto.com";
                    
                    const emailPromises = subscribers.map(sub => {
                        let { subject, content } = template;
                        const templateData = {
                            name: sub.firstName,
                            carTitle: createdCar.title,
                            description: createdCar.description?.substring(0, 150).replace(/<[^>]*>?/gm, '') + "...",
                            link: `${appUrl}/inventory/${createdCar.slug}`
                        };

                        Object.keys(templateData).forEach(key => {
                            const placeholder = `{{${key}}}`;
                            const value = templateData[key as keyof typeof templateData] || '';
                            subject = subject.replace(new RegExp(placeholder, 'g'), value);
                            content = content.replace(new RegExp(placeholder, 'g'), value);
                        });

                        return sendEmailWithContent(sub.email, subject, content);
                    });

                    const results = await Promise.all(emailPromises);
                    console.log(`✅ Sent ${results.filter(r => r !== null).length} emails successfully.`);
                } else {
                    console.log("ℹ️ No subscribers found to send emails to.");
                }
            }
          } catch (e) {
            console.error("❌ New Arrival Email CRITICAL error:", e);
          }
      }
    }
  } catch (err) {
    console.error("Create Car Action Error:", err);
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
  const session = await requireAdmin();

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
            const fullImageUrl = getImageUrl(src);
            const hash = await generateThumbHashFromSrUrl(fullImageUrl);
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
          slug: slugify(`${title} ${data.vrm}`, { lower: true }), title, year: Number(data.year),
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
    await redis.del(TAXONOMY_CACHE_KEY);
    await generateTaxonomyData();

    // AUTO-NOTIFICATION: Price Drop Alert
    if (newPrice < oldPrice && data.status === "LIVE") {
      try {
        const template = await prisma.emailTemplate.findFirst({
            where: { name: "Price Drop Alert" }
        });

        if (template) {
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
            // Prices are handled in cents (USD)
            const priceInCents = Math.round(Number(data.price) * 100);
            const currencySymbol = "$";

            const emailPromises = interestedCustomers.map(customer => {
                let { subject, content } = template;
                const templateData = {
                    name: customer.firstName,
                    carTitle: title,
                    newPrice: `${currencySymbol}${(newPrice / 100).toLocaleString()}`,
                    link: `${appUrl}/inventory/${slugify(`${title} ${data.vrm}`, { lower: true })}`
                };

                Object.keys(templateData).forEach(key => {
                    const placeholder = `{{${key}}}`;
                    const value = templateData[key as keyof typeof templateData] || '';
                    subject = subject.replace(new RegExp(placeholder, 'g'), value);
                    content = content.replace(new RegExp(placeholder, 'g'), value);
                });

                return sendEmailWithContent(customer.email, subject, content);
            });

            await Promise.all(emailPromises);
        }
      } catch (e) {
        console.error("Price Drop Email error:", e);
      }
    }

    if (existingCar) {
        const deletePromises = existingCar.images
            .filter(img => !data.images.find(newImg => newImg.src === img.src))
            .map(img => {
                const key = getS3KeyFromUrl(img.src);
                return key ? deleteFromS3(key) : Promise.resolve();
            });
        
        await Promise.all(deletePromises);
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
  const session = await requireAdmin();

  try {
    const car = await prisma.classified.findUnique({ where: { id }, include: { images: true } });
    const deletedCar = await prisma.classified.delete({ where: { id } });

    if (deletedCar && car) {
      await redis.del(TAXONOMY_CACHE_KEY);
      await generateTaxonomyData();
      const deletePromises = car.images.map(img => {
          const key = getS3KeyFromUrl(img.src);
          return key ? deleteFromS3(key) : Promise.resolve();
      });
      await Promise.all(deletePromises);

      revalidatePath(routes.admin.cars);
      return { success: true, message: t("deleteSuccess") };
    }
    return { success: false, message: t("deleteError") };
  } catch (error) {
    return { success: false, message: t("deleteError") };
  }
}

export const toggleLatestArrivalAction = async (id: number, isLatest: boolean) => {
  const session = await requireAdmin();
  try {
    await prisma.classified.update({ where: { id }, data: { isLatestArrival: isLatest } });
    revalidatePath("/admin/latest-arrivals");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Failed to update status" };
  }
};