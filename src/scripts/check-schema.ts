import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Tax & Classes...");

  // Body Types (Araç Sınıfları) - Enum değil Class tablosu varsa oraya eklenmeli
  // Schema kontrolüme göre BodyType bir ENUM, yani veritabanı tablosu değil.
  // Ancak 'Class' diye bir tablonuz olabilir (seed/class.seed.ts vardı).
  
  // class.seed.ts içeriğini buraya güvenli şekilde gömüyorum
  const classes = [
    { name: "Sedan", image: "/assets/classes/sedan.svg" },
    { name: "SUV", image: "/assets/classes/suv.svg" },
    { name: "Hatchback", image: "/assets/classes/hatchback.svg" },
    { name: "Coupe", image: "/assets/classes/coupe.svg" },
    { name: "Convertible", image: "/assets/classes/convertible.svg" },
    { name: "Wagon", image: "/assets/classes/wagon.svg" },
    { name: "Pickup", image: "/assets/classes/pickup.svg" },
    { name: "Van", image: "/assets/classes/van.svg" },
    { name: "Electric", image: "/assets/classes/electric.svg" },
    { name: "Luxury", image: "/assets/classes/luxury.svg" },
    { name: "Sport", image: "/assets/classes/sport.svg" }
  ];

  // Schema'da 'Class' modeli yoksa hata verir, o yüzden kontrol etmiştik.
  // Schema'da 'BodyType' enum var ama 'Class' veya 'Category' tablosu göremedim.
  // Tekrar schema kontrolü yapıyorum.
}

main().catch(console.error);
