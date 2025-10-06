import { BadgeProps } from "@/components/ui/badge";
import { ClassifiedStatus, CustomerStatus } from "@prisma/client";

export const imageSources = {
    classifiedPlaceholder: `https://meat-motors.imgix.net/placeholder.jpg`,
    carPlaceholer: `/placeholder.jpg`,
    features: `https://meat-motors.imgix.net/features.jpg`,
    carLineup: `https://meat-motors.imgix.net/car-lineup.jpg`
}

export const CARS_PER_PAGE = 6
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; 
export const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB
export const SYSTEM_PROMPT= `
You are a vehicle analysis expert AI specializing in identifying car makes, models, and variants from images. 
You always return structured JSON data that matches the exact schema provided. 
When analyzing a vehicle, base your answers on visible visual features such as the badge, shape, lights, grille, and design patterns.

Be accurate and cautious — if certain attributes like modelVariant or modelId cannot be confidently determined, return null instead of guessing.

Always return:
- year: Estimated year based on vehicle design.
- make and model: Based on visual badges or industry knowledge.
- makeId and modelId: Only if known, otherwise return null.
- modelVariant and modelVariantId: Return only if confidently identifiable, else null.

Return only a structured JSON object matching the schema and nothing else.
`
export const USER_MESSAGE = `
Please analyze the attached vehicle image and return the structured data in the correct JSON format, based on the schema provided.
If any field (e.g. modelVariantId) cannot be reliably detected from the image alone, return it as null.

Only return the structured object. Do not include any explanation or extra text.
        `.trim()

export const CAR_DETAILS_SYSTEM_PROMPT = `
You are a professional automotive inspection AI that specializes in extracting structured details from vehicle images.

Your task is to return accurate JSON data strictly matching the CarDetailsAISchema. Use visual cues from the image — including license plates, badges, dashboards, interior layout, and exterior body design — to identify each field.

Apply the following rules:
- If the odometer reading is visible, extract the number and choose the appropriate unit (e.g., miles or kilometers).
- Estimate door and seat count based on visible layout and door handles.
- For ULEZ compliance, infer if the car is likely to meet current urban emissions standards — when unclear, make a reasonable guess based on age and type.
- Determine transmission type by visual or contextual cues (e.g., gear stick for manual vs. automatic).
- Detect the vehicle colour and fuel type accurately.
- Body type should be derived from vehicle shape (e.g., hatchback, SUV, estate).
- For VRM (vehicle registration mark), use text recognition — if unreadable, return "UNKNOWN".
- Return only structured data in JSON format that matches the provided schema. If a value is not visually determinable but strongly implied, infer it carefully.

Never include explanations or extra commentary. Return strictly the JSON object.
`.trim()

export const CAR_DETAILS_USER_MESSAGE =  (title: string) => `
You are given an image of the vehicle titled "${title}".

From this image, extract and return structured vehicle details according to the schema provided. This includes:

- Odometer reading and unit
- Number of doors 
- Number of seats
- ULEZ compliance
- Transmission type
- Vehicle colour
- Fuel type
- Body type
- VRM (Vehicle Registration Mark)

If the VRM cannot be identified, return "UNKNOWN". Be as accurate and realistic as possible, and infer only when there's a strong visual cue.

Return only the structured JSON object, with no extra text or explanation.
        `.trim()

export const MAX_IMAGES = 8


export const sortOrder = ["asc", "desc"] as const;

export const CarBadgeMap : Record<ClassifiedStatus,BadgeProps['variant']  >= {
        [ClassifiedStatus.DRAFT]: "secondary",
	[ClassifiedStatus.LIVE]: "default",
	[ClassifiedStatus.SOLD]: "destructive",

}

export const CustomerBadgeMap: Record<CustomerStatus, BadgeProps["variant"]> = {
	[CustomerStatus.COLD]: "secondary",
	[CustomerStatus.CONTACTED]: "default",
	[CustomerStatus.INTERESTED]: "destructive",
	[CustomerStatus.PURCHASED]: "warning",
	[CustomerStatus.SUBSCRIBER]: "info",
};