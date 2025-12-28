import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis-store";
import fs from "fs/promises";
import path from "path";

const TAXONOMY_REDIS_KEY = "global_taxonomy_data";

export async function generateTaxonomyData() {
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

  if (classifieds.length === 0) return null;

  const makeMap = new Map();
  classifieds.forEach(c => {
    if (!c.make) return;
    if (!makeMap.has(c.make.id)) {
      makeMap.set(c.make.id, { v: String(c.make.id), l: c.make.name, m: new Map() });
    }
    const makeEntry = makeMap.get(c.make.id);
    if (c.model) {
      if (!makeEntry.m.has(c.model.id)) {
        makeEntry.m.set(c.model.id, { v: String(c.model.id), l: c.model.name, vr: new Map() });
      }
      const modelEntry = makeEntry.m.get(c.model.id);
      if (c.modelVariant) {
        modelEntry.vr.set(c.modelVariant.id, { v: String(c.modelVariant.id), l: c.modelVariant.name });
      }
    }
  });

  const taxonomyTree = Array.from(makeMap.values()).map(make => ({
    ...make,
    m: Array.from(make.m.values()).map((model: any) => ({
      ...model,
      vr: Array.from(model.vr.values())
    })).sort((a: any, b: any) => a.l.localeCompare(b.l))
  })).sort((a: any, b: any) => a.l.localeCompare(b.l));

  const ranges = {
    year: { min: Math.min(...classifieds.map(c => c.year)), max: Math.max(...classifieds.map(c => c.year)) },
    price: { min: Math.min(...classifieds.map(c => c.price)), max: Math.max(...classifieds.map(c => c.price)) },
    odoReading: { min: Math.min(...classifieds.map(c => c.odoReading)), max: Math.max(...classifieds.map(c => c.odoReading)) }
  };

  const unique = (arr: any[]) => Array.from(new Set(arr.filter(Boolean))).sort();
  const attributes = {
    fuelType: unique(classifieds.map(c => c.fuelType)),
    transmission: unique(classifieds.map(c => c.transmission)),
    bodyType: unique(classifieds.map(c => c.bodyType)),
    colour: unique(classifieds.map(c => c.colour)),
    ulezCompliance: unique(classifieds.map(c => c.ulezCompliance)),
    odoUnit: unique(classifieds.map(c => c.odoUnit)),
    currency: unique(classifieds.map(c => c.currency)),
    doors: unique(classifieds.map(c => c.doors)),
    seats: unique(classifieds.map(c => c.seats))
  };

  const finalData = { taxonomyTree, ranges, attributes, totalCount: classifieds.length, updatedAt: new Date().toISOString() };

  // 1. Always update Redis (Primary Source for Production)
  try {
    await redis.set(TAXONOMY_REDIS_KEY, finalData, { ex: 86400 }); // 24h cache
  } catch (e) {
    console.error("Redis Sync Failed:", e);
  }

  // 2. Try to update static file (For Build optimization, fail gracefully on Serverless)
  try {
    const outputPath = path.join(process.cwd(), "public", "taxonomy-tree.json");
    await fs.writeFile(outputPath, JSON.stringify(finalData));
  } catch (error) {
    // Expected in many serverless environments
    console.warn("Static file write skipped (likely Serverless environment)");
  }

  return finalData;
}