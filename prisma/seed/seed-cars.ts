import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding vehicle data...");

  const dataPath = path.join(__dirname, "vehicles_data.json");
  const rawData = fs.readFileSync(dataPath, "utf-8");
  const vehicles = JSON.parse(rawData);

  for (const makeData of vehicles) {
    console.log(`Processing make: ${makeData.make}`);

    // Create or update Make
    const make = await prisma.make.upsert({
      where: { name: makeData.make },
      update: { image: makeData.image },
      create: {
        name: makeData.make,
        image: makeData.image,
      },
    });

    for (const modelData of makeData.models) {
      // Create or update Model
      const model = await prisma.model.upsert({
        where: {
          makeId_name: {
            makeId: make.id,
            name: modelData.name,
          },
        },
        update: {},
        create: {
          name: modelData.name,
          makeId: make.id,
        },
      });

      // Create variants
      if (modelData.variants && modelData.variants.length > 0) {
        for (const variantData of modelData.variants) {
           await prisma.modelVariant.upsert({
            where: {
                modelId_name: {
                    modelId: model.id,
                    name: variantData.name
                }
            },
            update: {
                yearStart: variantData.start,
                yearEnd: variantData.end
            },
            create: {
                name: variantData.name,
                modelId: model.id,
                yearStart: variantData.start,
                yearEnd: variantData.end
            }
           });
        }
      }
    }
  }

  console.log("Vehicle data seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
