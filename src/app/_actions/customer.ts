"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { forbidden, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { routes } from "@/config/routes";
import { CreateCustomerType, EditCustomerType } from "@/app/schemas/customer.schema";
import { getTranslations } from "next-intl/server";
import { generalFormRateLimit } from "@/lib/rate-limiter";
import { headers } from "next/headers";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const createCustomerAction = async (data: CreateCustomerType) => {
  const t = await getTranslations("Admin.customers.messages");
  
  // Rate limiting
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success: limitSuccess } = await generalFormRateLimit.limit(ip);
  
  if (!limitSuccess) {
    return { success: false, message: "Too many requests. Please try again in an hour." };
  }

  try {
    const newCustomer = await prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        bookingDate: data.date,
        classified: {
          connect: {
            slug: data.slug,
          },
        },
      },
      include: {
        classified: true,
      }
    });

    // AUTO-RESPONDER: Send confirmation email to customer
    if (newCustomer.email) {
        try {
            await resend.emails.send({
                from: "RIM GLOBAL <onboarding@resend.dev>", // Update this with your verified domain
                to: newCustomer.email,
                subject: `Booking Confirmed: ${newCustomer.classified?.title}`,
                html: `
                    <h1>Hello ${newCustomer.firstName},</h1>
                    <p>Thank you for your interest in the <strong>${newCustomer.classified?.title}</strong>.</p>
                    <p>We have received your reservation request for <strong>${newCustomer.bookingDate?.toLocaleString()}</strong>.</p>
                    <p>Our team will contact you shortly at ${newCustomer.mobile} to confirm the details.</p>
                    <br/>
                    <p>Best regards,<br/>The RIM GLOBAL Team</p>
                `,
            });
        } catch (mailError) {
            console.error("Failed to send customer confirmation email:", mailError);
            // Don't fail the whole action if only the confirmation email fails
        }
    }

    return {
      success: true,
      message: t("publicSuccess", { name: newCustomer.firstName }),
    };
  } catch (error) {
    console.error("Create Customer Error:", error);
    return {
      success: false,
      message: t("publicError"),
    };
  }
};

export const updateCustomerAction = async (data: {
  id: number;
} & EditCustomerType) => {
  const t = await getTranslations("Admin.customers.messages");
  const session = await auth();
  if (!session?.user?.id) {
    return forbidden();
  }
  const userId = session.user.id;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: data.id },
      include: { classified: true },
    });

    if (!customer) {
      return { success: false, message: t("notFound") };
    }

    const changes: { field: string; oldValue: any; newValue: any }[] = [];

    // Robustly compare and track changes, handling null/undefined/empty strings
    if (data.status !== customer.status) {
      changes.push({ field: 'status', oldValue: customer.status, newValue: data.status });
    }
    if (data.firstName !== customer.firstName) {
      changes.push({ field: 'firstName', oldValue: customer.firstName, newValue: data.firstName });
    }
    if (data.lastName !== customer.lastName) {
      changes.push({ field: 'lastName', oldValue: customer.lastName, newValue: data.lastName });
    }
    if (data.email !== customer.email) {
      changes.push({ field: 'email', oldValue: customer.email, newValue: data.email });
    }
    if ((data.mobile || "") !== (customer.mobile || "")) {
      changes.push({ field: 'mobile', oldValue: customer.mobile, newValue: data.mobile });
    }
    
    const effectiveOldTitle = customer.carTitle || customer.classified?.title || "";
    if ((data.carTitle || "") !== effectiveOldTitle) {
      changes.push({ field: 'carTitle', oldValue: effectiveOldTitle, newValue: data.carTitle });
    }

    if ((data.notes || "") !== (customer.notes || "")) {
      changes.push({ field: 'notes', oldValue: customer.notes, newValue: data.notes });
    }
    const oldDate = customer.bookingDate ? new Date(customer.bookingDate).toISOString() : null;
    const newDate = data.bookingDate ? new Date(data.bookingDate).toISOString() : null;
    if (newDate !== oldDate) {
      changes.push({ field: 'bookingDate', oldValue: customer.bookingDate, newValue: data.bookingDate });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update the customer
      await tx.customer.update({
        where: { id: data.id },
        data: {
          status: data.status,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          mobile: data.mobile,
          carTitle: data.carTitle,
          notes: data.notes,
          bookingDate: data.bookingDate,
        },
      });

      // 2. Create lifecycle logs for each change
      if (changes.length > 0) {
        const userExists = await tx.user.findUnique({ where: { id: userId } });
        if (!userExists) {
          throw new Error(`User with ID ${userId} not found for logging.`);
        }

        const lifecycleData = changes.map(change => ({
          customerId: customer.id,
          newStatus: data.status,     // Keep new status for context if needed, or adjust
          change: `Field '${change.field}' changed from '${change.oldValue || "empty"}' to '${change.newValue || "empty"}'`,
          updatedById: userId,
        }));
        
        for (const logEntry of lifecycleData) {
          await tx.customerLifecycle.create({ data: logEntry });
        }
      }
    });

    revalidatePath(routes.admin.customers);
    revalidatePath(routes.admin.editCustomer(data.id));

    return {
      success: true,
      message: t("updateSuccess"),
    };
  } catch (error) {
    console.error("Update Customer Error:", error);
    return {
      success: false,
      message: t("updateError"),
    };
  }
};

export const createManualCustomerAction = async (data: EditCustomerType) => {
  const t = await getTranslations("Admin.customers.messages");
  const session = await auth();
  if (!session?.user?.id) {
    return forbidden();
  }

  try {
    await prisma.customer.create({
      data: {
        status: data.status,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        carTitle: data.carTitle,
        notes: data.notes,
        bookingDate: data.bookingDate,
      },
    });
  } catch (error) {
    console.error("Create Customer Error:", error);
    return {
      success: false,
      message: t("createError"),
    };
  }

  revalidatePath(routes.admin.customers);
  redirect(routes.admin.customers);
};

export const deleteCustomerAction = async (id: number) => {
  const t = await getTranslations("Admin.customers.messages");
  const session = await auth();
  if (!session) {
    return forbidden();
  }

  try {
    await prisma.customer.delete({ where: { id } });
    revalidatePath(routes.admin.customers);
    revalidatePath(routes.admin.subscribers); // Ensure subscribers page is also refreshed
    return {
      success: true,
      message: t("deleteSuccess"),
    };
  } catch (error) {
    return {
      success: false,
      message: t("deleteError"),
    };
  }
};
