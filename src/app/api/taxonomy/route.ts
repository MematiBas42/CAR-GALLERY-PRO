import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis-store";
import { generateTaxonomyData } from "@/lib/taxonomy-utils";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

const CACHE_KEY = "global_taxonomy_data";

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    if (all) {
      const makeId = searchParams.get("make");
      const modelId = searchParams.get("model");

      const makes = await prisma.make.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
      });

      let models: { id: number; name: string }[] = [];
      if (makeId) {
        models = await prisma.model.findMany({
          where: { makeId: Number(makeId) },
          orderBy: { name: 'asc' },
          select: { id: true, name: true }
        });
      }

      let modelVariants: { id: number; name: string }[] = [];
      if (modelId) {
        modelVariants = await prisma.modelVariant.findMany({
          where: { modelId: Number(modelId) },
          orderBy: { name: 'asc' },
          select: { id: true, name: true }
        });
      }

      return NextResponse.json({
        makes: makes.map(m => ({ label: m.name, value: String(m.id) })),
        models: models.map(m => ({ label: m.name, value: String(m.id) })),
        modelVariants: modelVariants.map(m => ({ label: m.name, value: String(m.id) }))
      });
    }

    // Static data only. No dynamic counts here.
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
        return NextResponse.json(cachedData, {
            status: 200,
            headers: { "Cache-Control": "public, s-maxage=3600" }
        });
    }

    const responseData = await generateTaxonomyData();
    if (responseData) return NextResponse.json(responseData, { status: 200 });

    // Fallback to static snapshot
    try {
        const filePath = path.join(process.cwd(), "public", "taxonomy-tree.json");
        const fileContent = await fs.readFile(filePath, "utf-8");
        return NextResponse.json(JSON.parse(fileContent), { status: 200 });
    } catch (e) {
        return NextResponse.json({ error: "Service Unavailable" }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
};