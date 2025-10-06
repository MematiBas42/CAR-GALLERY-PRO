import { validateIdSchema } from "@/app/schemas/form.schema";
import { routes } from "@/config/routes";
import { Favourites } from "@/config/types";
import { redis } from "@/lib/redis-store";
import { setSourceId } from "@/lib/source-id";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";


export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const { data, error } = validateIdSchema.safeParse(body);
  if (!data) {
    return NextResponse.json(
      {
        error: error.errors[0].message
      },
      { status: 400 }
    );
  }

  if (typeof data.id !== "number") {
    return NextResponse.json(
      {
        error: "Invalid ID type"
      },
      { status: 400 }
    );
  }

  // get sopurceId from cookies
  const sourceId = await setSourceId();

  // get the exisitng fave from redis
  const storefav = await redis.get<Favourites>(sourceId);
  const favs: Favourites = storefav || { ids: [] };

  if (favs.ids.includes(data.id)) {
    // add or remove the id based on its current presence in the favourites
    // remove the id if it exists
    favs.ids = favs.ids.filter((id) => id !== data.id);
  } else {
    // add the id if it does not exist
    favs.ids.push(data.id);
  }

  // update the rdis store with the updated favourites
  await redis.set(sourceId, favs);
  revalidatePath(routes.favourites)
  return NextResponse.json({ids: favs.ids}, { status: 200 });
};
