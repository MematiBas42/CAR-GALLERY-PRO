import { imageSources } from "@/config/constants";
import { faker } from "@faker-js/faker";
import { Prisma, PrismaClient } from "@prisma/client";
import { createPngDataUri } from "unlazy/thumbhash"; 
export async function seedImage(prisma: PrismaClient) {
    const cars = await prisma.classified.findMany({})

    const carids = cars.map(car => car.id);
    for (const carId of carids) {
        const image : Prisma.ImageCreateInput = {
            src: imageSources.classifiedPlaceholder,
            alt: faker.lorem.words(3),
            classified: {
                connect: { id: carId }
            },
            blurhash:createPngDataUri('DNcFG4g9lXWTewfX/Wndj8Y=')
        }
    await prisma.image.create({
        data: image
    })
    }
}