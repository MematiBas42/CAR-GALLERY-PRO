import { NextResponse, NextRequest } from "next/server";
import { redis } from "@/lib/redis-store";
import { generateTaxonomyData } from "@/lib/taxonomy-utils";
import fs from "fs/promises";
import path from "path";
import { buildClassifiedFilterQuery } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

const CACHE_KEY = "global_taxonomy_data";

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const hasFilters = Array.from(searchParams.keys()).length > 0;

  try {
    // 1. Base Taxonomy Data (Redis First)
    let baseData: any = await redis.get(CACHE_KEY);
    
    if (!baseData) {
        baseData = await generateTaxonomyData();
    }

    // 2. Fallback to Static File if everything fails
    if (!baseData) {
        try {
            const filePath = path.join(process.cwd(), "public", "taxonomy-tree.json");
            const fileContent = await fs.readFile(filePath, "utf-8");
            baseData = JSON.parse(fileContent);
        } catch (e) {}
    }

    if (!baseData) return NextResponse.json({ error: "No data" }, { status: 503 });

    // 3. API Fusion: If filters are present, compute filtered count on the fly
    // This avoids a second API call from the SearchButton
    if (hasFilters) {
        const where = buildClassifiedFilterQuery(Object.fromEntries(searchParams));
        const filteredCount = await prisma.classified.count({ where });
        return NextResponse.json({ ...baseData, filteredCount }, { status: 200 });
    }

    return NextResponse.json(baseData, {
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=3600" }
    });

  } catch (error) {
    console.error("API Taxonomy Fusion Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
};
