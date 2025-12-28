import { prisma } from "@/lib/prisma";
import { buildClassifiedFilterQuery } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  
  try {
    const where = buildClassifiedFilterQuery(Object.fromEntries(searchParams));
    const count = await prisma.classified.count({ where });

    return NextResponse.json({ count }, {
      status: 200,
      headers: { "Cache-Control": "private, no-cache" }
    });
  } catch (error) {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
};