import { prisma } from "@/lib/prisma";
import { buildClassifiedFilterQuery } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const searchParams = Object.fromEntries(new URL(request.url).searchParams);
  
  try {
    const where = buildClassifiedFilterQuery(searchParams);
    const count = await prisma.classified.count({ where });

    return NextResponse.json({ count }, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=60" } // 1 dk cache yeterli
    });
  } catch (error) {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
};
