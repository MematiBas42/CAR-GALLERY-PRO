import { prisma } from "./prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface TemplateData {
  name?: string;
  carTitle?: string;
  newPrice?: string;
  date?: string;
  link?: string;
  description?: string;
  [key: string]: any;
}

export async function sendTemplatedEmail(
  to: string,
  templateName: string,
  data: TemplateData
) {
  try {
    const template = await prisma.emailTemplate.findFirst({
      where: { name: templateName }
    });

    if (!template) {
      console.error(`Template not found: ${templateName}`);
      return null;
    }

    let { subject, content } = template;

    // Replace placeholders
    Object.keys(data).forEach(key => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), data[key]);
      content = content.replace(new RegExp(placeholder, 'g'), data[key]);
    });

    return await resend.emails.send({
      from: "RIM GLOBAL <onboarding@resend.dev>", // Replace with verified domain in prod
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #2563eb;">RIM GLOBAL</h2>
          <div style="line-height: 1.6; color: #333;">
            ${content}
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">
            1505 S 356th Street, Federal Way, WA 98003
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error("Templated Email Error:", error);
    return null;
  }
}
