import { validateIdSchema } from "@/app/schemas/form.schema";
import { routes } from "@/config/routes";
import { Favourites } from "@/config/types";
import { redis } from "@/lib/redis-store";
import { setSourceId } from "@/lib/source-id";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  // get sourceId from cookies
  const sourceId = await setSourceId();

  // get the existing fave from redis
  const storefav = await redis.get<Favourites>(sourceId);
  const favs: Favourites = storefav || { ids: [] };

  if (favs.ids.includes(data.id)) {
    // remove the id if it exists
    favs.ids = favs.ids.filter((id) => id !== data.id);
  } else {
    // add the id if it does not exist
    favs.ids.push(data.id);
  }

  // Parallel Execution: Update Redis AND Sync DB
  const promises: Promise<any>[] = [redis.set(sourceId, favs)];

  // LIVE SYNC: Update all customers associated with this browser/device
  const dbSyncPromise = (async () => {
      try {
        const customers = await prisma.customer.findMany({
            where: { sourceId: sourceId }
        });

        if (customers.length > 0) {
            await prisma.$transaction(
                customers.map(customer => 
                prisma.customer.update({
                    where: { id: customer.id },
                    data: {
                    favorites: {
                        set: favs.ids.map(id => ({ id }))
                    }
                    }
                })
                )
            );
        }
      } catch (err) {
        console.error("Failed to sync favorites with DB:", err);
      }
  })();

  promises.push(dbSyncPromise);

  await Promise.all(promises);

  revalidatePath(routes.favourites)
  return NextResponse.json({ids: favs.ids}, { status: 200 });
};
