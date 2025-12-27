"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { CustomerStatus } from "@prisma/client";
import { forbidden } from "next/navigation";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendBulkEmailAction = async (formData: { subject: string; content: string }) => {
  const session = await auth();
  if (!session) forbidden();

  try {
    const subscribers = await prisma.customer.findMany({
      where: { status: CustomerStatus.SUBSCRIBER },
      select: { email: true, firstName: true }
    });

    if (subscribers.length === 0) {
      return { success: false, message: "No subscribers found." };
    }

    // Resend batch sending (limit is 100 per batch in free tier, but for boutique it's fine)
    // For larger lists, we would iterate or use a loop.
    const emailPromises = subscribers.map(sub => 
      resend.emails.send({
        from: "RIM GLOBAL <onboarding@resend.dev>",
        to: sub.email,
        subject: formData.subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
            <h2 style="color: #2563eb;">RIM GLOBAL</h2>
            <p>Hello ${sub.firstName},</p>
            <div style="line-height: 1.6; color: #333;">
              ${formData.content.replace(/\n/g, '<br/>')}
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999;">
              You are receiving this email because you subscribed to the RIM GLOBAL newsletter.
              <br/>
              1505 S 356th Street, Federal Way, WA 98003
            </p>
          </div>
        `
      })
    );

    await Promise.all(emailPromises);

    return { success: true, message: `Email sent to ${subscribers.length} subscribers.` };
  } catch (error) {
    console.error("Bulk Email Error:", error);
    return { success: false, message: "Failed to send emails." };
  }
};

export const updateEmailTemplateAction = async (id: string, data: { subject: string; content: string }) => {
  const session = await auth();
  if (!session) forbidden();

  try {
    await prisma.emailTemplate.update({
      where: { id },
      data: {
        subject: data.subject,
        content: data.content,
      },
    });
    return { success: true, message: "Template updated successfully" };
  } catch (error) {
    console.error("Update Template Error:", error);
    return { success: false, message: "Failed to update template" };
  }
};

export const getEmailTemplatesAction = async () => {
  const session = await auth();
  if (!session) forbidden();

  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, data: templates };
  } catch (error) {
    return { success: false, message: "Failed to fetch templates" };
  }
};
