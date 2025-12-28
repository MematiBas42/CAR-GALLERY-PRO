import sharp from "sharp"
import { rgbaToThumbHash } from "thumbhash";

export async function generateThumbHashFromSrUrl(url:string): Promise<string> {
	const maxSize = 100;
    // Add 5s timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
	try {
        const response = await fetch(url, { signal: controller.signal });
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, info } = await sharp(buffer)
            .resize(maxSize, maxSize, { fit: "inside", withoutEnlargement: true })
            .raw()
            .ensureAlpha()
            .toBuffer({ resolveWithObject: true });

        const thumbhash = rgbaToThumbHash(info.width, info.height, data);
        return Buffer.from(thumbhash).toString("base64");
    } finally {
        clearTimeout(timeoutId);
    }
}