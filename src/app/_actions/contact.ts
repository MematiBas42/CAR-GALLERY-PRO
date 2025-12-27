"use server";

import { contactFormSchema, ContactFormType } from "@/app/schemas/contact.schema";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendContactEmail = async (data: ContactFormType) => {
  const result = contactFormSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: "Invalid form data" };
  }

  const { name, email, phone, message } = result.data;

  try {
    // Send email to admin
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
    console.error("Email sending failed:", error);
    return { success: false, error: "Failed to send email" };
  }
};
