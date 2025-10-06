"use server";
import {
  createAI,
  createStreamableUI,
  createStreamableValue,
  StreamableValue,
} from "ai/rsc";
import { CoreMessage, generateObject, UserContent } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import StreamableSkeletion, {
  StreamableSkeletonProps,
} from "@/components/admin/cars/StreamableSkeletion";
import { CarDetailsAISchema, CarTaxonomyAISchema } from "../schemas/car-ai";
import {
  CAR_DETAILS_SYSTEM_PROMPT,
  CAR_DETAILS_USER_MESSAGE,
  SYSTEM_PROMPT,
  USER_MESSAGE,
} from "@/config/constants";
import { mapToTaxonomyOrCreate } from "@/lib/ai-utils";
import { prisma } from "@/lib/prisma";
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: "strict",
});

type ServerMessage = {
  id?: number;
  name?: undefined | string;
  role: "user" | "assistant" | "system";
  content: UserContent;
};

export async function generateCar(
  image: string
): Promise<ClientMessage | null> {
  const uiStream = createStreamableUI();
  const valueStream = createStreamableValue<any>();

  let car = { image } as StreamableSkeletonProps;
  uiStream.update(<StreamableSkeletion {...car} />);

  async function processEvent() {
    const { object: taxonomy } = await generateObject({
      model: openai("gpt-4o-mini-2024-07-18", {
        structuredOutputs: true,
      }),
      schema: CarTaxonomyAISchema,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", image },
            {
              type: "text",
              text: USER_MESSAGE,
            },
          ],
        },
      ] as CoreMessage[],
    });

    car.title = `${taxonomy.year} ${taxonomy.make} ${taxonomy.model} ${
      taxonomy.modelVariant ? ` ${taxonomy.modelVariant}` : ""
    }`.trim();

    const foundedTaxonomy = await mapToTaxonomyOrCreate({
      year: taxonomy.year,
      make: taxonomy.make,
      model: taxonomy.model,
      modelVariant: taxonomy.modelVariant || null,
    });

    if (foundedTaxonomy) {
      const make = await prisma.make.findFirst({
        where: {
          name: foundedTaxonomy.make,
        },
      });

      if (make) {
        car = {
          ...car,
          ...foundedTaxonomy,
          make,
          makeId: make.id,
        };
      }
    }
    const { object: details } = await generateObject({
      model: openai("gpt-4o-mini-2024-07-18", { structuredOutputs: true }),
      schema: CarDetailsAISchema,
      system: CAR_DETAILS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", image },
            {
              type: "text",
              text: CAR_DETAILS_USER_MESSAGE(car.title as string),
            },
          ],
        },
      ] as CoreMessage[],
    });

    car = {
      ...car,
      ...details,
    };
    uiStream.update(<StreamableSkeletion done={true} {...car} />);
    valueStream.update(car);

    uiStream.done();
    valueStream.done();
  }

  processEvent();
  return {
    id: Date.now(),
    display: uiStream.value,
    role: "assistant" as const,
    car: valueStream.value,
  };
}

export type ClientMessage = {
  id: number;

  role: "user" | "assistant";
  display: React.ReactNode;
  car: StreamableValue<StreamableSkeletonProps>;
};
export const AI = createAI({
  initialUIState: [] as ClientMessage[],
  initialAIState: [] as ServerMessage[],
  actions: {
    generateCar,
  },
});
