import { SingleImageUploadSchema } from "@/app/schemas/images.schema";
import { auth } from "@/auth";
import { MAX_IMAGE_SIZE } from "@/config/constants";
import { uploadToS3 } from "@/lib/s3";

import { forbidden } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const POST = auth(async (req) => {
    if (!req.auth) {
        forbidden()
    }
    const formData = await req.formData()
    const validated = SingleImageUploadSchema.safeParse(formData)
    if (!validated.success) {
        return NextResponse.json(
            { error: "Invalid form data" },
            { status: 400 }
        )
    }

    const {file} = validated.data
    const uuid = uuidv4()

    // 100MB Limit for S3 Single Upload
    if (!file || file.size > 100 * 1024 * 1024) {
        return NextResponse.json(
            { message: "File is too large (Max 100MB)" }, 
            { status: 400 }
        )
    }

    const {default: mimetype} = await import ("mime-types")

    const mime = mimetype.lookup(file.name).toString()
    // Allow images and videos
    if (mime.match(/image\/(jpeg|jpg|png|webp|svg\+xml)/) === null && mime.match(/video\/(mp4|webm|quicktime)/) === null)  {
		return NextResponse.json(
			{ message: `File type invalid ${mime}` },
			{ status: 400 },
		);
    } 

    const decodedFileName = decodeURIComponent(decodeURIComponent(file.name));
    // Replace spaces to avoid S3 issues
	const key = `upload/${uuid}/${decodedFileName.replace(/\s+/g, '-')}`;

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        
        await uploadToS3({
            bucketName: process.env.AWS_BUCKET_NAME!,
            file: buffer,
            path: key,
            mimetype: mime,
        })
        
        // Construct S3 URL
        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        
        return NextResponse.json({
            message: "File uploaded successfully",
            url,
        }, { status: 200 });
        
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        return NextResponse.json(
            { message: "Failed to upload file to S3" },
            { status: 500 }
        );
    }
})
