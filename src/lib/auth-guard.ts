import { auth } from "@/auth";
import { forbidden } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  
  if (!session || !session.user || session.user.role !== "ADMIN") {
    console.error(`Unauthorized access attempt by: ${session?.user?.email || "anonymous"}`);
    forbidden();
  }
  
  return session;
}

import { SUPER_ADMIN_EMAIL } from "@/config/constants";

export async function requireSuperAdmin() {
  const session = await auth();
  
  if (!session || !session.user || session.user.email !== SUPER_ADMIN_EMAIL) {
    console.error(`Unauthorized SUPER ADMIN access attempt by: ${session?.user?.email || "anonymous"}`);
    forbidden();
  }
  
  return session;
}
