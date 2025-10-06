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

    if (!file||file.size >MAX_IMAGE_SIZE) {
        return NextResponse.json(
            { message: "File is too large or missing" }, 
            { status: 400 }
        )
    }

    const {default: mimetype} = await import ("mime-types")

    const mime = mimetype.lookup(file.name).toString()
    if (mime.match(/image\/(jpeg|jpg|png|webp)/) === null)  {
        console.log("File is not an image");

		return NextResponse.json(
			{ message: `File type invalid ${mime}` },
			{ status: 400 },
		);
    } 

    const decodedFileName = decodeURIComponent(decodeURIComponent(file.name));
	const key = `upload/${uuid}/${decodedFileName}`;

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        await uploadToS3({
            bucketName: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            file: buffer,
            path: key,
            mimetype: mime,
        })
        const url  = `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/${key}`
        return NextResponse.json({
            message: "File uploaded successfully",
            url,
        }, { status: 200 });
        
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        return NextResponse.json(
            { message: "Failed to upload file" },
            { status: 500 }
        );
    }
})