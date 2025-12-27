"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { forbidden, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { routes } from "@/config/routes";
import { CreateCustomerType, EditCustomerType } from "@/app/schemas/customer.schema";
import { getTranslations, getLocale, getFormatter } from "next-intl/server";
import { generalFormRateLimit } from "@/lib/rate-limiter";
import { headers, cookies } from "next/headers";
import { Resend } from "resend";
import { redis } from "@/lib/redis-store";
import { Favourites } from "@/config/types";

const resend = new Resend(process.env.RESEND_API_KEY);

export const createCustomerAction = async (data: CreateCustomerType) => {
  const t = await getTranslations("Admin.customers.messages");
  const locale = await getLocale();
  const format = await getFormatter();
  
  // Rate limiting
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success: limitSuccess } = await generalFormRateLimit.limit(ip);
  
  if (!limitSuccess) {
    return { success: false, message: "Too many requests. Please try again in an hour." };
  }

  // Fetch favorites from Redis using cookie
  const cookieStore = await cookies();
  const sourceId = cookieStore.get("sourceId")?.value;
  let favoriteIds: number[] = [];
  
  if (sourceId) {
      const redisData = await redis.get<Favourites>(sourceId);
      if (redisData && redisData.ids && redisData.ids.length > 0) {
          // SAFE GUARD: Verify these IDs actually exist in Postgres before connecting
          // This prevents crash if a favorited car was deleted from DB but remains in Redis
          const validCars = await prisma.classified.findMany({
              where: { 
                  id: { in: redisData.ids },
                  status: "LIVE" // Optional: Only link LIVE cars
              },
              select: { id: true }
          });
          favoriteIds = validCars.map(c => c.id);
      }
  }

  try {
    const newCustomer = await prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        bookingDate: data.date,
        sourceId: sourceId, // Save the browser identity
        classified: { connect: { slug: data.slug } },
        favorites: {
            connect: favoriteIds.map(id => ({ id }))
        }
      },
      include: { classified: true }
    });

    // AUTO-RESPONDER: Using centralized Template System
    if (newCustomer.email) {
        const localizedDate = newCustomer.bookingDate 
            ? format.dateTime(new Date(newCustomer.bookingDate), { dateStyle: 'full', timeStyle: 'short' })
            : "N/A";

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        
        // Use base template name. 
        // TIP: If you want to use localized templates later, you can use:
        // const templateName = `Reservation Confirmation - ${locale.toUpperCase()}`;
        const templateName = "Reservation Confirmation";
        
        await sendTemplatedEmail(newCustomer.email, templateName, {
            name: newCustomer.firstName,
            carTitle: newCustomer.classified?.title || customer.carTitle || "Vehicle",
            date: localizedDate,
            link: `${appUrl}/inventory/${newCustomer.classified?.slug}`
        });
    }

    return {
      success: true,
      message: t("publicSuccess", { name: newCustomer.firstName }),
    };
  } catch (error) {
    return { success: false, message: t("publicError") };
  }
};

// ... Rest of functions (updateCustomerAction, deleteCustomerAction etc) ...
// Updated deleteCustomerAction to refresh subscribers page
export const updateCustomerAction = async (data: { id: number } & EditCustomerType) => {
  const t = await getTranslations("Admin.customers.messages");
  const session = await auth();
  if (!session?.user?.id) return forbidden();
  const userId = session.user.id;

  try {
    const customer = await prisma.customer.findUnique({ where: { id: data.id } });
    if (!customer) return { success: false, message: t("notFound") };

    await prisma.customer.update({ where: { id: data.id }, data: { ...data } });
    revalidatePath(routes.admin.customers);
    return { success: true, message: t("updateSuccess") };
  } catch (error) {
    return { success: false, message: t("updateError") };
  }
};

export const createManualCustomerAction = async (data: EditCustomerType) => {
  const session = await auth();
  if (!session?.user?.id) return forbidden();
  try {
    await prisma.customer.create({ data: { ...data } });
    revalidatePath(routes.admin.customers);
    redirect(routes.admin.customers);
  } catch (error) {
    return { success: false, message: "Failed" };
  }
};

export const deleteCustomerAction = async (id: number) => {
  const session = await auth();
  if (!session) return forbidden();
  try {
    await prisma.customer.delete({ where: { id } });
    revalidatePath(routes.admin.customers);
    revalidatePath(routes.admin.subscribers);
    return { success: true, message: "Success" };
  } catch (error) {
    return { success: false, message: "Failed" };
  }
};
