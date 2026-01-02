"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendEmailWithContent } from "@/lib/email-service";
import { Role } from "@prisma/client";
import { genericRateLimit } from "@/lib/rate-limiter";
import { z } from "zod";

interface VehicleDetails {
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  error?: string;
}

// Input Validation Schema
const tradeInSchema = z.object({
  vin: z.string().min(11).max(17).regex(/^[A-HJ-NPR-Z0-9]+$/, "Invalid VIN format"),
  plate: z.string().optional().or(z.literal("")),
  year: z.union([z.string(), z.number()]).transform(val => val ? Number(val) : null).optional(),
  make: z.string().optional().or(z.literal("")),
  model: z.string().optional().or(z.literal("")),
  trim: z.string().optional().or(z.literal("")),
  mileage: z.union([z.string(), z.number()]).transform(val => val ? Number(val) : null).optional(),
  firstName: z.string().min(2, "Name too short"),
  lastName: z.string().min(2, "Last name too short"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number too short"),
});

export async function decodeVin(vin: string): Promise<VehicleDetails> {
  if (!vin || vin.length < 11) {
    return { error: "Invalid VIN length" };
  }

  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
    );
    
    if (!response.ok) {
        throw new Error("NHTSA API failed");
    }

    const data = await response.json();
    const results = data.Results;

    if (!results) {
        return { error: "No results found" };
    }

    // Helper to extract value by Variable name
    const getValue = (variableName: string) => {
      const item = results.find((r: any) => r.Variable === variableName);
      return item ? item.Value : null;
    };

    const year = getValue("Model Year");
    const make = getValue("Make");
    const model = getValue("Model");
    const trim = getValue("Trim");

    if (!year && !make && !model) {
        return { error: "Could not decode vehicle details" };
    }

    return {
      year: year ? parseInt(year) : undefined,
      make: make || undefined,
      model: model || undefined,
      trim: trim || undefined,
    };

  } catch (error) {
    console.error("VIN Decode Error:", error);
    return { error: "Failed to connect to vehicle database" };
  }
}

export async function submitTradeInRequest(rawData: any) {
    try {
        // 1. Security: Rate Limiting
        const limitCheck = await genericRateLimit("trade-in");
        if (limitCheck) {
            return { success: false, error: limitCheck.message };
        }

        // 2. Security: Input Validation
        const validation = tradeInSchema.safeParse(rawData);
        if (!validation.success) {
            return { success: false, error: "Invalid data: " + validation.error.issues[0].message };
        }
        const data = validation.data;

        if (!prisma.tradeInRequest) {
            console.error("Prisma TradeInRequest model is undefined. Available models:", Object.keys(prisma).filter(k => !k.startsWith('_')));
            console.error("ACTION REQUIRED: Please restart your development server to load the new database schema.");
            return { success: false, error: "System update required. Please contact support or try again later." };
        }

        // 3. Create Request
        const request = await prisma.tradeInRequest.create({
            data: {
                vin: data.vin,
                plate: data.plate || null,
                year: data.year || null,
                make: data.make || null,
                model: data.model || null,
                trim: data.trim || null,
                mileage: data.mileage || null,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                // token is generated automatically
            }
        });

        // 4. Fetch Admins
        const admins = await prisma.user.findMany({
            where: { role: Role.ADMIN },
            select: { email: true }
        });

        // 5. Send Email to Admins (Sanitized Content)
        const adminEmailContent = `
            <h3>New Trade-In Request Received</h3>
            <p><strong>Vehicle:</strong> ${data.year || 'N/A'} ${data.make || 'N/A'} ${data.model || 'N/A'}</p>
            <p><strong>VIN:</strong> ${data.vin}</p>
            <p><strong>Customer:</strong> ${data.firstName} ${data.lastName}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p>Login to admin dashboard to review and set a price.</p>
        `;

        // Send to all admins in parallel
        Promise.all(admins.map(admin => 
            sendEmailWithContent(admin.email, "New Trade-In Request Alert", adminEmailContent)
        )).catch(err => console.error("Failed to send admin emails:", err));

        // 6. Send Confirmation to Customer
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const trackingToken = request.token || request.id.toString(); 
        const trackingLink = `${baseUrl}/trade-in/track/${trackingToken}`;

        const customerEmailContent = `
            <h3>We Received Your Request, ${data.firstName}!</h3>
            <p>Thank you for submitting your vehicle (${data.year || ''} ${data.make || ''} ${data.model || ''}) for valuation.</p>
            <p>Our team is currently reviewing your details. You can track the status of your offer and view our price proposal using the link below:</p>
            <p style="margin: 20px 0;">
                <a href="${trackingLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Track My Offer
                </a>
            </p>
            <p>If the button doesn't work, copy and paste this link: <a href="${trackingLink}">${trackingLink}</a></p>
            <p>Best Regards,<br>RIM GLOBAL Team</p>
        `;

        sendEmailWithContent(data.email, "Trade-In Request Received - RIM GLOBAL", customerEmailContent)
            .catch(err => console.error("Failed to send customer email:", err));
        
        return { success: true, token: trackingToken };
    } catch (error) {
        console.error("Trade-In Submit Error:", error);
        return { success: false, error: "Database error" };
    }
}

export async function updateTradeInOffer(id: number, data: { price: number; expiresAt?: Date; notes?: string }) {
    try {
        const existingRequest = await prisma.tradeInRequest.findUnique({ where: { id } });
        if (!existingRequest) return { success: false, error: "Request not found" };

        const updatedRequest = await prisma.tradeInRequest.update({
            where: { id },
            data: {
                offeredPrice: data.price,
                offerExpiresAt: data.expiresAt,
                adminNotes: data.notes,
                status: "OFFERED", 
            }
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const trackingToken = updatedRequest.token || updatedRequest.id.toString();
        const trackingLink = `${baseUrl}/trade-in/track/${trackingToken}`;

        const emailContent = `
            <h3>Great News! Your Offer is Ready 💰</h3>
            <p>We have reviewed your vehicle <strong>${updatedRequest.year} ${updatedRequest.make} ${updatedRequest.model}</strong> and prepared a competitive offer.</p>
            <p><strong>Your Offer:</strong> <span style="font-size: 18px; color: #16a34a; font-weight: bold;">$${data.price.toLocaleString()}</span></p>
            ${data.expiresAt ? `<p>This offer is valid until: <strong>${data.expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>` : ''}
            <p>Click below to view details and accept the offer:</p>
            <p style="margin: 20px 0;">
                <a href="${trackingLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    View My Offer
                </a>
            </p>
            <p>Best Regards,<br>RIM GLOBAL Team</p>
        `;

        sendEmailWithContent(updatedRequest.email, "Your Trade-In Offer is Ready! - RIM GLOBAL", emailContent)
            .catch(err => console.error("Failed to send offer email:", err));

        revalidatePath("/admin/trade-in");
        return { success: true };
    } catch (error) {
        console.error("Update Offer Error:", error);
        return { success: false, error: "Database error" };
    }
}

export async function deleteTradeInRequest(id: number) {
    try {
        await prisma.tradeInRequest.delete({ where: { id } });
        revalidatePath("/admin/trade-in");
        return { success: true };
    } catch (error) {
        console.error("Delete Error:", error);
        return { success: false, error: "Database error" };
    }
}