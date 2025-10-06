import { bcryptPasswordHash } from "@/lib/brypt";
import type { PrismaClient } from "@prisma/client";

export async function seedAdmin(prisma: PrismaClient) {
	const password = await bcryptPasswordHash("password");

    const admin = await prisma.user.create({
        data: {
            email: "ducthai060501@gmail.com",
            hashedPassword: password,
        }
    })

	console.log("Admin created: ", admin);

	return admin;
}