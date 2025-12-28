"use server";

import { requireSuperAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { bcryptPasswordHash } from "@/lib/brypt";
import { revalidatePath } from "next/cache";
import { CreateUserSchema } from "@/app/schemas/auth.schema";
import { PrevState } from "@/config/types";

export const createUserAction = async (prevState: PrevState, formData: FormData) => {
  await requireSuperAdmin();

  const data = Object.fromEntries(formData.entries());
  const parsed = CreateUserSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, message: "Invalid input" };
  }

  try {
    const hashedPassword = await bcryptPasswordHash(parsed.data.password);
    await prisma.user.create({
      data: {
        email: parsed.data.email,
        hashedPassword,
        role: parsed.data.role,
      },
    });
    revalidatePath("/admin/users");
    return { success: true, message: "User created successfully" };
  } catch (e) {
    return { success: false, message: "Failed to create user. Email might be taken." };
  }
};

export const deleteUserAction = async (id: string) => {
  const session = await requireSuperAdmin();
  if (session.user.id === id) {
      return { success: false, message: "You cannot delete yourself." };
  }

  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { success: true, message: "User deleted" };
  } catch (e) {
    return { success: false, message: "Failed to delete user" };
  }
};

export const updateUserPasswordAction = async (id: string, newPassword: string) => {
    await requireSuperAdmin();
    try {
        const hashedPassword = await bcryptPasswordHash(newPassword);
        await prisma.user.update({
            where: { id },
            data: { hashedPassword }
        });
        revalidatePath("/admin/users");
        return { success: true, message: "Password updated" };
    } catch (e) {
        return { success: false, message: "Failed to update password" };
    }
}
