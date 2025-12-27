"use server";

import { contactFormSchema, ContactFormType } from "@/app/schemas/contact.schema";
import { Resend } from "resend";
import { contactRateLimit } from "@/lib/rate-limiter";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendContactEmail = async (data: ContactFormType) => {
  // Rate limiting
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success: limitSuccess } = await contactRateLimit.limit(ip);
  
  if (!limitSuccess) {
    return { success: false, error: "Too many requests. Please try again later." };
  }

  const result = contactFormSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: "Invalid form data" };
  }

  const { name, email, phone, message } = result.data;

  try {
    // 1. Save to Database
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone,
        message,
      }
    });

    // 2. Send email to admin
    await resend.emails.send({
      from: "Car Dealer <onboarding@resend.dev>", // Update this with your verified domain
      to: "delivered@resend.dev", // Update this with the admin email
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Message Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Contact Form error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
};