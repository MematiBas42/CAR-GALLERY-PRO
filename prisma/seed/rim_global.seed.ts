import { 
    PrismaClient, 
    ClassifiedStatus, 
    Transmission, 
    Colour, 
    FuelType, 
    BodyType, 
    OdoUnit, 
    CurrencyCode, 
    ULEZCompliance 
} from "@prisma/client";
import slugify from "slug";

export async function seedRimGlobalInventory(prisma: PrismaClient) {
    const inventory = [
        { year: 2021, make: "TOYOTA", model: "COROLLA", price: 16997, odo: 35000, colour: Colour.WHITE, body: BodyType.SEDAN, fuel: FuelType.PETROL, trans: Transmission.AUTOMATIC, vrm: "FW-2021-TC" },
        { year: 2013, make: "HONDA", model: "ACCORD", price: 9997, odo: 110000, colour: Colour.SILVER, body: BodyType.SEDAN, fuel: FuelType.PETROL, trans: Transmission.AUTOMATIC, vrm: "FW-2013-HA" },
        { year: 2015, make: "AUDI", model: "A8", price: 11900, odo: 95000, colour: Colour.BLACK, body: BodyType.SEDAN, fuel: FuelType.PETROL, trans: Transmission.AUTOMATIC, vrm: "FW-2015-AA8" },
        { year: 2009, make: "PORSCHE", model: "CAYENNE", price: 11500, odo: 120000, colour: Colour.GREY, body: BodyType.SUV, fuel: FuelType.PETROL, trans: Transmission.AUTOMATIC, vrm: "FW-2009-PC" },
        { year: 2020, make: "JEEP", model: "CHEROKEE", price: 7900, odo: 80000, colour: Colour.BLUE, body: BodyType.SUV, fuel: FuelType.PETROL, trans: Transmission.AUTOMATIC, vrm: "FW-2020-JC" },
        { year: 2022, make: "GMC", model: "SIERRA", price: 42999, odo: 15000, colour: Colour.BLACK, body: BodyType.WAGON, fuel: FuelType.PETROL, trans: Transmission.AUTOMATIC, vrm: "FW-2022-GS" },
        { year: 2015, make: "MAZDA", model: "CX-5", price: 11999, odo: 85000, colour: Colour.RED, body: BodyType.SUV, fuel: FuelType.PETROL, trans: Transmission.AUTOMATIC, vrm: "FW-2015-MCX" },
        { year: 2012, make: "JEEP", model: "PATRIOT", price: 3900, odo: 140000, colour: Colour.GREEN, body: BodyType.SUV, fuel: FuelType.PETROL, trans: Transmission.AUTOMATIC, vrm: "FW-2012-JP" },
        { year: 2018, make: "FORD", model: "F-150", price: 32000, odo: 60000, colour: Colour.WHITE, body: BodyType.WAGON, fuel: FuelType.PETROL, trans: Transmission.AUTOMATIC, vrm: "FW-2018-FF" },
        { year: 2019, make: "BMW", model: "3 SERIES", price: 24500, odo: 45000, colour: Colour.BLUE, body: BodyType.SEDAN, fuel: FuelType.PETROL, trans: Transmission.AUTOMATIC, vrm: "FW-2019-B3" },
        { year: 2020, make: "LEXUS", model: "RX", price: 35000, odo: 30000, colour: Colour.SILVER, body: BodyType.SUV, fuel: FuelType.HYBRID, trans: Transmission.AUTOMATIC, vrm: "FW-2020-LRX" },
        { year: 2021, make: "TESLA", model: "MODEL 3", price: 29900, odo: 25000, colour: Colour.WHITE, body: BodyType.SEDAN, fuel: FuelType.ELECTRIC, trans: Transmission.AUTOMATIC, vrm: "FW-2021-TM3" }
    ];

    console.log("Seeding RIM GLOBAL specific inventory...");

    for (const car of inventory) {
        // Ensure Make exists
        const make = await prisma.make.upsert({
            where: { name: car.make },
            update: {},
            create: {
                name: car.make,
                image: `https://vl.imgix.net/img/${car.make.replace(/\s+/g, "-").toLowerCase()}-logo.png?auto=format,compress`
            }
        });

        // Ensure Model exists
        const model = await prisma.model.upsert({
            where: { makeId_name: { makeId: make.id, name: car.model } },
            update: {},
            create: {
                name: car.model,
                makeId: make.id
            }
        });
        
        const title = `${car.year} ${car.make} ${car.model}`;
        const slug = slugify(`${title}-${car.vrm}`);

        await prisma.classified.upsert({
            where: { slug },
            update: {},
            create: {
                year: car.year,
                vrm: car.vrm,
                slug,
                title,
                description: `Experience excellence with this ${title}. Currently featured at our Federal Way showroom at 1505 S 356th Street. Rigorously inspected and maintained to ensure top-tier performance. Features a ${car.trans.toLowerCase()} transmission and is elegantly finished in ${car.colour.toLowerCase()}.`,
                price: car.price * 100,
                odoReading: car.odo,
                odoUnit: OdoUnit.MILES,
                currency: CurrencyCode.USD,
                colour: car.colour,
                transmission: car.trans,
                fuelType: car.fuel,
                bodyType: car.body,
                status: ClassifiedStatus.LIVE,
                ulezCompliance: ULEZCompliance.EXEMPT,
                makeId: make.id,
                modelId: model.id
            }
        });
    }
    console.log("RIM GLOBAL specific inventory seeded! ✅");
}