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

    const { default: mimetype } = await import("mime-types");
    const mime = mimetype.lookup(fileData.name).toString();

    if (mime.match(/image\/(jpeg|jpg|png|webp|svg\+xml)/) === null && mime.match(/video\/(mp4|webm|quicktime)/) === null) {
        return NextResponse.json(
            { message: `File type invalid ${mime}` },
            { status: 400 }
        );
    }

    const decodedFileName = decodeURIComponent(decodeURIComponent(fileData.name));
    const key = `upload/${uuid}/${decodedFileName.replace(/\s+/g, '-')}`;

    try {
        const buffer = Buffer.from(await fileData.arrayBuffer());
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: key,
            Body: buffer,
            ContentType: mime,
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
