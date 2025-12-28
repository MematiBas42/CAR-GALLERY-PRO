import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis-store";
import fs from "fs/promises";
import path from "path";
import { TaxonomyData, MakeNode, ModelNode, TaxonomyOption } from "@/hooks/use-taxonomy";

const TAXONOMY_REDIS_KEY = "global_taxonomy_data";

export async function generateTaxonomyData(): Promise<TaxonomyData | null> {
  try {
    const classifieds = await prisma.classified.findMany({
      where: { status: 'LIVE' },
      select: {
        make: { select: { id: true, name: true } },
        model: { select: { id: true, name: true } },
        modelVariant: { select: { id: true, name: true } },
        year: true, price: true, odoReading: true,
        fuelType: true, transmission: true, bodyType: true,
        colour: true, ulezCompliance: true, odoUnit: true,
        currency: true, doors: true, seats: true
      }
    });

    if (classifieds.length === 0) {
        return {
            taxonomyTree: [],
            ranges: {
                year: { min: 1900, max: new Date().getFullYear() },
                price: { min: 0, max: 0 },
                odoReading: { min: 0, max: 0 }
            },
            attributes: {
                fuelType: [], transmission: [], bodyType: [], colour: [],
                ulezCompliance: [], odoUnit: [], currency: [], doors: [], seats: []
            },
            totalCount: 0,
            updatedAt: new Date().toISOString()
        };
    };

    const makeMap = new Map<number, { v: string, l: string, m: Map<number, { v: string, l: string, vr: Map<number, TaxonomyOption> }> }>();

    classifieds.forEach(c => {
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
        vr: Array.from(model.vr.values())
      })).sort((a, b) => a.l.localeCompare(b.l))
    })).sort((a, b) => a.l.localeCompare(b.l));

    const safeMin = (arr: number[]) => arr.length ? Math.min(...arr) : 0;
    const safeMax = (arr: number[]) => arr.length ? Math.max(...arr) : 0;

    const ranges = {
      year: { min: safeMin(classifieds.map(c => c.year)), max: safeMax(classifieds.map(c => c.year)) },
      price: { min: safeMin(classifieds.map(c => c.price)), max: safeMax(classifieds.map(c => c.price)) },
      odoReading: { min: safeMin(classifieds.map(c => c.odoReading)), max: safeMax(classifieds.map(c => c.odoReading)) }
    };

    const unique = (arr: any[]) => Array.from(new Set(arr.filter(Boolean))).sort() as any[];
    const attributes = {
      fuelType: unique(classifieds.map(c => c.fuelType)) as string[],
      transmission: unique(classifieds.map(c => c.transmission)) as string[],
      bodyType: unique(classifieds.map(c => c.bodyType)) as string[],
      colour: unique(classifieds.map(c => c.colour)) as string[],
      ulezCompliance: unique(classifieds.map(c => c.ulezCompliance)) as string[],
      odoUnit: unique(classifieds.map(c => c.odoUnit)) as string[],
      currency: unique(classifieds.map(c => c.currency)) as string[],
      doors: unique(classifieds.map(c => c.doors)) as number[],
      seats: unique(classifieds.map(c => c.seats)) as number[]
    };

    const finalData: TaxonomyData = { taxonomyTree, ranges, attributes, totalCount: classifieds.length, updatedAt: new Date().toISOString() };

    await redis.set(TAXONOMY_REDIS_KEY, finalData, { ex: 86400 });

    try {
      const outputPath = path.join(process.cwd(), "public", "taxonomy-tree.json");
      await fs.writeFile(outputPath, JSON.stringify(finalData));
    } catch (e) {}

    return finalData;
  } catch (error) {
    console.error("Critical Failure in generateTaxonomyData:", error);
    return null;
  }
}