// identify user on theri cookie so they can store thier fav on redis

import "server-only";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

const SOURCE_ID_KEY = "sourceId";

export const setSourceId = async () => {
  const cookiesStore = await cookies();
  let sourceId = cookiesStore.get(SOURCE_ID_KEY)?.value ;

  if (!sourceId) {
    sourceId = uuidv4();
    cookiesStore.set(SOURCE_ID_KEY, sourceId, {
      path: "/",
    });
   
  }
   return sourceId;
};


export const getSourceId = async () => {
    const cookiesStore = await cookies();
    const sourceId = cookiesStore.get(SOURCE_ID_KEY)?.value;
    return sourceId
}