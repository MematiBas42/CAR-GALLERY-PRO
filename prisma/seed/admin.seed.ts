import { bcryptPasswordHash } from "@/lib/brypt";
import type { PrismaClient } from "@prisma/client";

export async function seedAdmin(prisma: PrismaClient) {
    const password = await bcryptPasswordHash("admin123"); // Şifreyi "admin123" olarak değiştirdik

    const admin = await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {
            role: "ADMIN"
        },
        create: {
            email: "admin@example.com",
            hashedPassword: password,
            role: "ADMIN"
        }
    })

    console.log("Admin created: ", admin);

    return admin;
}
