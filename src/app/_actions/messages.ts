"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { forbidden } from "next/navigation";

export const markMessageAsReadAction = async (id: number) => {
  const session = await auth();
  if (!session) forbidden();

  try {
    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update message" };
  }
};

export const deleteMessageAction = async (id: number) => {
  const session = await auth();
  if (!session) forbidden();

  try {
    await prisma.contactMessage.delete({
      where: { id },
    });
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete message" };
  }
};
