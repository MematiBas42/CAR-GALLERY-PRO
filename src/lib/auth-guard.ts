import { auth } from "@/auth";
import { forbidden } from "next/navigation";

const ADMIN_EMAILS = ["admin@example.com", "info@rimglobalauto.com", "rakundusunen@gmail.com"];

export async function requireAdmin() {
  const session = await auth();
  
  if (!session?.user?.email) {
    forbidden();
  }

  // Şu an veritabanında rol yok, o yüzden email listesiyle kontrol ediyoruz.
  // İleride veritabanına 'role' sütunu eklenirse burayı güncelleriz.
  if (!ADMIN_EMAILS.includes(session.user.email)) {
    console.error(`Unauthorized access attempt by: ${session.user.email}`);
    forbidden();
  }
  
  return session;
}
