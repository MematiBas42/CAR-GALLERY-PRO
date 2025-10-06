import { prisma } from "@/lib/prisma";
import { Model, ModelVariant } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const params = new URL(request.url).searchParams;

  try {
    const makes = await prisma.make.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    let models: Model[] = [];

    if (params.get("make")) {
      models = await prisma.model.findMany({
        where: {
          make: {
            id: Number(params.get("make")),
          },
        },
      });
    }
    let modelVariants: ModelVariant[] = [];
    if (params.get("model") && params.get("make")) {
      modelVariants = await prisma.modelVariant.findMany({
        where: {
          model: {
            id: Number(params.get("model")),
          },
        },
      });
    }

    const lvMakes = makes.map(({id, name}) => ({
        label: name,
        value: id.toString(),
    }))
    const lvModels = models.map(({id, name}) => ({
        label: name,
        value: id.toString(),
    }))
    const lvModelVariants = modelVariants.map(({id, name}) => ({
        label: name,
        value: id.toString(),
    }))

    return NextResponse.json({
        makes: lvMakes,
        models: lvModels,
        modelVariants: lvModelVariants,
    },{
        status: 200
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }
};
