import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis-store";
import fs from "fs/promises";
import path from "path";
import { TaxonomyData, MakeNode, ModelNode, TaxonomyOption } from "@/hooks/use-taxonomy";

const TAXONOMY_REDIS_KEY = "global_taxonomy_data";
const TAXONOMY_LOCK_KEY = "taxonomy_generation_lock";

export async function generateTaxonomyData(): Promise<TaxonomyData | null> {
  const isLocked = await redis.get(TAXONOMY_LOCK_KEY);
  if (isLocked) return null;

  try {
    await redis.set(TAXONOMY_LOCK_KEY, "true", { ex: 60 });

    // 1. Get unique combinations of Make/Model/Variant for LIVE classifieds
    const combinations = await prisma.classified.findMany({
      where: { status: 'LIVE' },
      select: {
        make: { select: { id: true, name: true } },
        model: { select: { id: true, name: true } },
        modelVariant: { select: { id: true, name: true } },
      },
      distinct: ['makeId', 'modelId', 'modelVariantId']
    });

    if (combinations.length === 0) {
        return {
            taxonomyTree: [],
            ranges: { year: { min: 1900, max: new Date().getFullYear() }, price: { min: 0, max: 0 }, odoReading: { min: 0, max: 0 } },
            attributes: { fuelType: [], transmission: [], bodyType: [], colour: [], ulezCompliance: [], odoUnit: [], currency: [], doors: [], seats: [] },
            totalCount: 0, updatedAt: new Date().toISOString()
        };
    };

    // 2. Build taxonomy tree from unique combinations
    const makeMap = new Map<number, { v: string, l: string, m: Map<number, { v: string, l: string, vr: Map<number, TaxonomyOption> }> }>();

    combinations.forEach(c => {
      if (!c.make) return;
      if (!makeMap.has(c.make.id)) {
        makeMap.set(c.make.id, { v: String(c.make.id), l: c.make.name, m: new Map() });
      }
      const makeEntry = makeMap.get(c.make.id)!;
      if (c.model) {
        if (!makeEntry.m.has(c.model.id)) {
          makeEntry.m.set(c.model.id, { v: String(c.model.id), l: c.model.name, vr: new Map() });
        }
        const modelEntry = makeEntry.m.get(c.model.id)!;
        if (c.modelVariant) {
          modelEntry.vr.set(c.modelVariant.id, { v: String(c.modelVariant.id), l: c.modelVariant.name });
        }
      }
    });

    const taxonomyTree: MakeNode[] = Array.from(makeMap.values()).map(make => ({
      v: make.v,
      l: make.l,
      m: Array.from(make.m.values()).map(model => ({
        v: model.v,
        l: model.l,
        vr: Array.from(model.vr.values()) as TaxonomyOption[]
      })).sort((a, b) => a.l.localeCompare(b.l))
    })).sort((a, b) => a.l.localeCompare(b.l));

    // 3. Get ranges and attributes via optimized queries
    const [aggregates, counts] = await Promise.all([
      prisma.classified.aggregate({
        where: { status: 'LIVE' },
        _min: { year: true, price: true, odoReading: true },
        _max: { year: true, price: true, odoReading: true },
        _count: true
      }),
      prisma.classified.findMany({
          where: { status: 'LIVE' },
          select: {
              fuelType: true, transmission: true, bodyType: true,
              colour: true, ulezCompliance: true, odoUnit: true,
              currency: true, doors: true, seats: true
          },
          distinct: ['fuelType', 'transmission', 'bodyType', 'colour', 'ulezCompliance', 'odoUnit', 'currency', 'doors', 'seats']
      })
    ]);

    const finalData: TaxonomyData = {
      taxonomyTree,
      ranges: {
        year: { min: aggregates._min.year ?? 1900, max: aggregates._max.year ?? new Date().getFullYear() },
        price: { min: aggregates._min.price ?? 0, max: aggregates._max.price ?? 0 },
        odoReading: { min: aggregates._min.odoReading ?? 0, max: aggregates._max.odoReading ?? 0 }
      },
      attributes: {
        fuelType: Array.from(new Set(counts.map(c => c.fuelType).filter(Boolean))).sort() as string[],
        transmission: Array.from(new Set(counts.map(c => c.transmission).filter(Boolean))).sort() as string[],
        bodyType: Array.from(new Set(counts.map(c => c.bodyType).filter(Boolean))).sort() as string[],
        colour: Array.from(new Set(counts.map(c => c.colour).filter(Boolean))).sort() as string[],
        ulezCompliance: Array.from(new Set(counts.map(c => c.ulezCompliance).filter(Boolean))).sort() as string[],
        odoUnit: Array.from(new Set(counts.map(c => c.odoUnit).filter(Boolean))).sort() as string[],
        currency: Array.from(new Set(counts.map(c => c.currency).filter(Boolean))).sort() as string[],
        doors: Array.from(new Set(counts.map(c => c.doors).filter(Boolean))).sort() as number[],
        seats: Array.from(new Set(counts.map(c => c.seats).filter(Boolean))).sort() as number[]
      },
      totalCount: aggregates._count,
      updatedAt: new Date().toISOString()
    };

    await redis.set(TAXONOMY_REDIS_KEY, finalData, { ex: 86400 });
    try {
      const outputPath = path.join(process.cwd(), "public", "taxonomy-tree.json");
      await fs.writeFile(outputPath, JSON.stringify(finalData));
    } catch (e) {}

    return finalData;
  } catch (error) {
    console.error("Critical Failure in generateTaxonomyData:", error);
    return null;
  } finally {
    await redis.del(TAXONOMY_LOCK_KEY);
  }
}