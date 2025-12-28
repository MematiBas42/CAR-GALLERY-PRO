import { NextResponse } from "next/server";
import { redis } from "@/lib/redis-store";
import { generateTaxonomyData } from "@/lib/taxonomy-utils";

const CACHE_KEY = "global_taxonomy_data";

export const GET = async () => {
  try {
    // 1. Try to get from Redis Cache first
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
        return NextResponse.json(cachedData, {
            status: 200,
            headers: { "Cache-Control": "public, s-maxage=3600" }
        });
    }

    // 2. Cache miss: Use the central generator logic
    const responseData = await generateTaxonomyData();

    if (responseData) {
        // 3. Save to Redis for 24 hours
        await redis.set(CACHE_KEY, responseData, { ex: 86400 });
    }

    return NextResponse.json(responseData || { error: "No data found" }, {
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=3600" }
    });

  } catch (error) {
    console.error("API Taxonomy Error:", error);
    return NextResponse.json({ error: "Failed to fetch taxonomy" }, { status: 500 });
  }
};
