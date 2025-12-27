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
    console.error("markMessageAsRead error:", error);
    return { success: false, error: "Database error: Could not update status." };
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
    console.error("deleteMessage error:", error);
    return { success: false, error: "Database error: Could not delete message." };
  }
};