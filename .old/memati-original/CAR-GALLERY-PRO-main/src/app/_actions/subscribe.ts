"use server";
import { prisma } from '@/lib/prisma';
import { CustomerStatus } from '@prisma/client';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { z } from 'zod';
import { SubscribeSchema } from '../schemas/sub.schema';
import { PrevState } from '@/config/types';

export const subscribeAction = async(_: PrevState, formData: FormData) => {
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
            return { success: false, message: "You are already subscribed" };
        }

        await prisma.customer.create({
            data: {
                ...data, status: CustomerStatus.SUBSCRIBER
            }
        })

        return {
            success: true,
            message: "You have successfully subscribed to our newsletter",
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
            message: "An unexpected error occurred. Please try again later.",
        }
    }
}