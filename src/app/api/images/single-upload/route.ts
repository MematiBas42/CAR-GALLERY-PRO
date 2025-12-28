import { auth } from "@/auth";
import { s3 } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const uploadSchema = z.object({
    file: z.instanceof(File),
});

export async function POST(req: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    const validated = uploadSchema.safeParse({ file });
    if (!validated.success) {
        return NextResponse.json({ message: "Invalid file" }, { status: 400 });
    }

    const { file: fileData } = validated.data;
    const uuid = uuidv4();

    // 100MB Limit
    if (!fileData || fileData.size > 100 * 1024 * 1024) {
        return NextResponse.json(
            { message: "File is too large (Max 100MB)" },
            { status: 400 }
        );
    }

    // Magic Bytes Validation
    const buffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(buffer.slice(0, 4));
    let header = "";
    for (let i = 0; i < bytes.length; i++) {
        header += bytes[i].toString(16).toUpperCase();
    }

    let detectedMime: string | null = null;

    // Check for common image signatures
    if (header.startsWith("FFD8FF")) {
        detectedMime = "image/jpeg";
    } else if (header === "89504E47") {
        detectedMime = "image/png";
    } else if (header.startsWith("47494638")) {
        detectedMime = "image/gif";
    } else if (header.startsWith("52494646") && new TextDecoder().decode(buffer.slice(8, 12)) === "WEBP") {
        // WEBP is RIFF....WEBP. We checked RIFF (52494646), now check WEBP.
        detectedMime = "image/webp";
    }

    if (!detectedMime) {
        return NextResponse.json(
            { message: "Invalid file content. Only JPEG, PNG, GIF, and WEBP are allowed." },
            { status: 400 }
        );
    }

    const { default: mimetype } = await import("mime-types");
    const mime = mimetype.lookup(fileData.name).toString();

    // Double check if extension matches content (optional but good practice)
    // or just use the detectedMime for the S3 Upload content-type
    
    const decodedFileName = decodeURIComponent(decodeURIComponent(fileData.name));
    const key = `upload/${uuid}/${decodedFileName.replace(/\s+/g, '-')}`;

    try {
        const nodeBuffer = Buffer.from(buffer);
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: key,
            Body: nodeBuffer,
            ContentType: detectedMime, // Use the verified mime type
        });

        await s3.send(command);

        return NextResponse.json({
            message: "File uploaded successfully",
            url: key, // Now returning the KEY instead of full URL
        });
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        return NextResponse.json(
            { message: "Failed to upload file" },
            { status: 500 }
        );
    }
}
