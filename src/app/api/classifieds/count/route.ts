import { prisma } from "@/lib/prisma";
import { buildClassifiedFilterQuery } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  
  try {
    const where = buildClassifiedFilterQuery(Object.fromEntries(searchParams));
    
    // Optimized: Fetch top 2 items to check for "exactly 1" case and get slug in ONE query
    const sample = await prisma.classified.findMany({
        where,
        take: 2,
        select: { slug: true }
    });

    let count = sample.length;
    let slug = null;

    if (count === 1) {
        slug = sample[0].slug;
    } else if (count === 2) {
        // If 2 or more, we need the actual count
        count = await prisma.classified.count({ where });
    }

    return NextResponse.json({ count, slug }, {
      status: 200,
      headers: { 
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=59" 
      }
    });
  } catch (error) {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
};