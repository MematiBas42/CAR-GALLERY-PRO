"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { forbidden, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { routes } from "@/config/routes";
import { CreateCustomerType, EditCustomerType } from "@/app/schemas/customer.schema";
import { getTranslations, getLocale, getFormatter } from "next-intl/server";
import { generalFormRateLimit } from "@/lib/rate-limiter";
import { headers } from "next/headers";
import { Resend } from "resend";

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

  try {
    const newCustomer = await prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        bookingDate: data.date,
        classified: { connect: { slug: data.slug } },
      },
      include: { classified: true }
    });

    // AUTO-RESPONDER: Fully Localized Email
    if (newCustomer.email) {
        const localizedDate = newCustomer.bookingDate 
            ? format.dateTime(new Date(newCustomer.bookingDate), { dateStyle: 'full', timeStyle: 'short' })
            : "N/A";

        let subject = "Booking Confirmation - RIM GLOBAL";
        let body = `<h1>Hello ${newCustomer.firstName},</h1><p>We received your booking for <strong>${newCustomer.classified?.title}</strong> on ${localizedDate}. Our team will contact you shortly.</p>`;

        if (locale === 'tr') {
            subject = "Rezervasyon Onayı - RIM GLOBAL";
            body = `<h1>Merhaba ${newCustomer.firstName},</h1><p><strong>${newCustomer.classified?.title}</strong> aracımız için ${localizedDate} tarihindeki rezervasyon talebinizi aldık. En kısa sürede sizinle iletişime geçeceğiz.</p>`;
        } else if (locale === 'ko') {
            subject = "예약 확인 - RIM GLOBAL";
            body = `<h1>안녕하세요 ${newCustomer.firstName}님,</h1><p><strong>${newCustomer.classified?.title}</strong> 차량에 대한 ${localizedDate} 예약이 접수되었습니다. 곧 연락드리겠습니다.</p>`;
        } else if (locale === 'es') {
            subject = "Confirmación de Reserva - RIM GLOBAL";
            body = `<h1>Hola ${newCustomer.firstName},</h1><p>Hemos recibido su reserva para el <strong>${newCustomer.classified?.title}</strong> el ${localizedDate}. Nos pondremos en contacto con usted pronto.</p>`;
        } else if (locale === 'ru') {
            subject = "Подтверждение бронирования - RIM GLOBAL";
            body = `<h1>Здравствуйте, ${newCustomer.firstName},</h1><p>Мы получили ваш запрос на бронирование <strong>${newCustomer.classified?.title}</strong> на ${localizedDate}. Мы скоро с вами свяжемся.</p>`;
        } else if (locale === 'vi') {
            subject = "Xác nhận đặt chỗ - RIM GLOBAL";
            body = `<h1>Xin chào ${newCustomer.firstName},</h1><p>Chúng tôi đã nhận được yêu cầu đặt chỗ cho xe <strong>${newCustomer.classified?.title}</strong> vào lúc ${localizedDate}. Chúng tôi sẽ sớm liên hệ với bạn.</p>`;
        }

        try {
            await resend.emails.send({
                from: "RIM GLOBAL <onboarding@resend.dev>",
                to: newCustomer.email,
                subject: subject,
                html: body + `<br/><p>Best regards,<br/>The RIM GLOBAL Team</p>`,
            });
        } catch (mailError) {
            console.error("Mail sending failed:", mailError);
        }
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
