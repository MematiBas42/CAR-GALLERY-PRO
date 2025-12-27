"use server";
import { prisma } from '@/lib/prisma';
import { CustomerStatus } from '@prisma/client';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { SubscribeSchema } from '../schemas/sub.schema';
import { PrevState } from '@/config/types';
import { getTranslations } from 'next-intl/server';
import { newsletterRateLimit } from "@/lib/rate-limiter";
import { headers } from "next/headers";

export const subscribeAction = async(_: PrevState, formData: FormData) => {
    const t = await getTranslations("Admin.customers.messages");
    
    // Rate limiting
    const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
    const { success: limitSuccess } = await newsletterRateLimit.limit(ip);
    
    if (!limitSuccess) {
      return { success: false, message: "Too many attempts. Please try again tomorrow." };
    }

    try {
        const {data, success, error} = SubscribeSchema.safeParse({
        email: formData.get('email') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName')  as string,
        })

        if (!success) {
            return { success: false, message: error.message };
        }

        const subscriber = await prisma.customer.findFirst({
            where:{
                email: data.email
            }
        })
        if (subscriber) {
            return { success: false, message: t("alreadySubscribed") };
        }

        await prisma.customer.create({
            data: {
                ...data, status: CustomerStatus.SUBSCRIBER
            }
        })

        return {
            success: true,
            message: t("createSuccess"),
        }
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            return {
                success: false,
                message: error.message,
            }
        }
        if (error instanceof PrismaClientValidationError) {
            return {
                success: false,
                message:error.message,
            }
        }
        return {
            success: false,
            message: t("genericError"),
        }
    }
}
