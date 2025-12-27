import { prisma } from "@/lib/prisma";
import { buildClassifiedFilterQuery } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const searchParams = Object.fromEntries(new URL(request.url).searchParams);
  const showAll = searchParams.all === 'true'; // Check for "all" parameter
  
  const cleanedParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== 'all') cleanedParams[key] = value;
  }

  try {
    const where = buildClassifiedFilterQuery(cleanedParams);

    // 1. Get Makes
    let makes: { label: string, value: string }[] = [];
    
    if (showAll) {
        // If showing all (e.g. for Admin), fetch directly from Make table
        const allMakes = await prisma.make.findMany({
            orderBy: { name: 'asc' }
        });
        makes = allMakes.map(make => ({
            label: make.name,
            value: make.id.toString()
        }));
    } else {
        // Otherwise (Inventory), only fetch makes that have classifieds
        const makesData = await prisma.classified.findMany({
            where: { ...where, makeId: undefined, modelId: undefined, modelVariantId: undefined },
            select: { 
                make: { select: { id: true, name: true } } 
            },
            distinct: ['makeId'],
            orderBy: { make: { name: 'asc' } }
        });
        
        makes = makesData.map(item => ({
            label: item.make.name,
            value: item.make.id.toString()
        }));
    }


    // 2. Get Models
    let models: { label: string, value: string }[] = [];
    
    if (showAll) {
        // Fetch all models for the selected make (if any), or all models if no make selected (careful with large lists)
        if (cleanedParams.make) {
             const allModels = await prisma.model.findMany({
                where: { makeId: Number(cleanedParams.make) },
                orderBy: { name: 'asc' }
            });
            models = allModels.map(model => ({
                label: model.name,
                value: model.id.toString()
            }));
        } else {
             // Optional: Return empty or all models. For combobox perf, maybe empty until make is selected.
             // But existing logic implies models are filtered by make.
             // If showAll and no make, maybe return nothing or handle differently.
             // Let's stick to returning models only if make is selected to match UI behavior.
             models = [];
        }
    } else {
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
    }

    // 3. Get Variants
    let modelVariants: { label: string, value: string }[] = [];
    
    if (showAll) {
        if (cleanedParams.model) {
            const allVariants = await prisma.modelVariant.findMany({
                where: { modelId: Number(cleanedParams.model) },
                orderBy: { name: 'asc' }
            });
            modelVariants = allVariants.map(variant => ({
                label: variant.name,
                value: variant.id.toString()
            }));
        }
    } else {
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
    }

    // Ranges and Attributes (Only needed for inventory usually, but keep for compatibility)
    // For admin showAll, ranges/attributes might be irrelevant or computed from all classifieds
    // To keep it simple, we'll execute the same logic for ranges/attributes or return empty if showAll
    // Returning existing logic for attributes is fine, as it reflects available cars.
    
    // ... (Existing attribute logic) ...
    // Keeping existing logic for attributes/ranges as they are derived from Classifieds table anyway.
    
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
