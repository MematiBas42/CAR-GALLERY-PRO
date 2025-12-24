import { prisma } from "@/lib/prisma";
import { buildClassifiedFilterQuery } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const searchParams = Object.fromEntries(new URL(request.url).searchParams);
  
  // Clean up search params for the query builder (remove empty strings)
  const cleanedParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) cleanedParams[key] = value;
  }

  try {
    const where = buildClassifiedFilterQuery(cleanedParams);

    // 1. Get Makes (Adaptive)
    const makesData = await prisma.classified.findMany({
        where: { ...where, makeId: undefined, modelId: undefined, modelVariantId: undefined },
        select: { 
            make: { select: { id: true, name: true } } 
        },
        distinct: ['makeId'],
        orderBy: { make: { name: 'asc' } }
    });
    
    const makes = makesData.map(item => ({
        label: item.make.name,
        value: item.make.id.toString()
    }));


    // 2. Get Models (Adaptive)
    let models: { label: string, value: string }[] = [];
    if (cleanedParams.make) {
        const modelsData = await prisma.classified.findMany({
            where: { ...where, modelId: undefined, modelVariantId: undefined },
            select: { 
                model: { select: { id: true, name: true } }
            },
            distinct: ['modelId'],
            orderBy: { model: { name: 'asc' } }
        });
        models = modelsData.map(item => ({
            label: item.model.name,
            value: item.model.id.toString()
        }));
    }

    // 3. Get Variants (Adaptive)
    let modelVariants: { label: string, value: string }[] = [];
    if (cleanedParams.model) {
         const variantsData = await prisma.classified.findMany({
            where: { ...where, modelVariantId: undefined },
            select: {
                modelVariant: { select: { id: true, name: true } }
            },
            distinct: ['modelVariantId'],
            orderBy: { modelVariant: { name: 'asc' } }
        });
        modelVariants = variantsData
            .filter(item => item.modelVariant)
            .map(item => ({
                label: item.modelVariant!.name,
                value: item.modelVariant!.id.toString()
            }));
    }

    // 4. Get Categorical Attributes (Adaptive)
    const getAttributeOptions = async (field: string) => {
        const paramsWithoutField = { ...cleanedParams };
        delete paramsWithoutField[field]; 
        
        const whereModified = buildClassifiedFilterQuery(paramsWithoutField);
        
        const data = await prisma.classified.findMany({
            where: whereModified,
            select: { [field]: true },
            distinct: [field as any]
        });
        
        return data.map(item => (item as any)[field]).filter(Boolean).sort();
    };

    // 5. Get Numeric Ranges (Adaptive)
    const getRanges = async () => {
        const rangeData: Record<string, { min: number | null, max: number | null }> = {};
        
        const fields = [
            { paramNames: ['minYear', 'maxYear'], dbField: 'year' },
            { paramNames: ['minPrice', 'maxPrice'], dbField: 'price' },
            { paramNames: ['minReading', 'maxReading'], dbField: 'odoReading' }
        ];

        for (const field of fields) {
            const paramsWithoutField = { ...cleanedParams };
            for (const p of field.paramNames) delete paramsWithoutField[p];
            
            const whereModified = buildClassifiedFilterQuery(paramsWithoutField);
            const aggregate = await prisma.classified.aggregate({
                where: whereModified,
                _min: { [field.dbField]: true },
                _max: { [field.dbField]: true }
            });
            
            rangeData[field.dbField] = {
                min: (aggregate._min as any)[field.dbField],
                max: (aggregate._max as any)[field.dbField]
            };
        }
        
        return rangeData;
    };

    const categoricalPromises = [
        getAttributeOptions('fuelType'),
        getAttributeOptions('transmission'),
        getAttributeOptions('bodyType'),
        getAttributeOptions('colour'),
        getAttributeOptions('ulezCompliance'),
        getAttributeOptions('odoUnit'),
        getAttributeOptions('currency'),
        getAttributeOptions('doors'),
        getAttributeOptions('seats')
    ];

    const [
        fuelTypes, transmissions, bodyTypes, colours, 
        ulezCompliances, odoUnits, currencies, doors, seats
    ] = await Promise.all(categoricalPromises);
    
    const ranges = await getRanges();


    return NextResponse.json({
        makes,
        models,
        modelVariants,
        ranges,
        attributes: {
            fuelType: fuelTypes,
            transmission: transmissions,
            bodyType: bodyTypes,
            colour: colours,
            ulezCompliance: ulezCompliances,
            odoUnit: odoUnits,
            currency: currencies,
            doors: doors,
            seats: seats
        }
    },{
        status: 200
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }
};