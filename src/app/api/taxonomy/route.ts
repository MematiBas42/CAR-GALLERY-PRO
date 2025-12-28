import { NextResponse } from "next/server";
import { redis } from "@/lib/redis-store";
import { generateTaxonomyData } from "@/lib/taxonomy-utils";
import fs from "fs/promises";
import path from "path";

const CACHE_KEY = "global_taxonomy_data";

export const GET = async () => {
  try {
    // 1. Level 1 Cache: Redis
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
        return NextResponse.json(cachedData, {
            status: 200,
            headers: { "Cache-Control": "public, s-maxage=3600" }
        });
    }

    // 2. Cache miss: Try to generate from DB
    const responseData = await generateTaxonomyData();
    if (responseData) {
        return NextResponse.json(responseData, { status: 200 });
    }

    // 3. Critical Fallback: Try static file if Redis and DB fail
    try {
        const filePath = path.join(process.cwd(), "public", "taxonomy-tree.json");
        const fileContent = await fs.readFile(filePath, "utf-8");
        return NextResponse.json(JSON.parse(fileContent), {
            status: 200,
            headers: { "Cache-Control": "public, s-maxage=300" }
        });
    } catch (fileError) {
        return NextResponse.json({ error: "No data available" }, { status: 503 });
    }

  } catch (error) {
    console.error("API Taxonomy Critical Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};