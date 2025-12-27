import { InitialiseMultipartUploadSchema } from "@/app/schemas/images.schema";
import { auth } from "@/auth";

import { s3 } from "@/lib/s3";
import type { CreateMultipartUploadCommandInput } from "@aws-sdk/client-s3";
import { forbidden } from "next/navigation";
import { NextResponse } from "next/server";

export const POST = auth(async (req) => {
  try {
    if (!req.auth) forbidden();
    const data = await req.json();
    const validated = InitialiseMultipartUploadSchema.safeParse(data);
    if (!validated.success) return NextResponse.error();
    const { name, uuid } = validated.data;
    const key = `upload/${uuid}/${name}`;
    const { default: mimetype } = await import("mime-types");

    const mime = mimetype.lookup(name);

    // .env dosyasındaki değişken isimlerini kullanıyoruz (AWS_BUCKET_NAME)
    const bucketName = process.env.AWS_BUCKET_NAME;

    const multipartParams: CreateMultipartUploadCommandInput = {
      Bucket: bucketName,
      Key: key.replace(/\s+/g, "-"),
      ...(mime && { ContentType: mime }),
    };

    const { CreateMultipartUploadCommand } = await import("@aws-sdk/client-s3");

    const command = new CreateMultipartUploadCommand(multipartParams);

    const multipartUpload = await s3.send(command);

    return NextResponse.json(
      {
        fileId: multipartUpload.UploadId,
        fileKey: multipartUpload.Key,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("----- S3 MULTIPART INIT ERROR -----");
    console.error("Error Message:", error instanceof Error ? error.message : error);
    console.log("Bucket Name:", process.env.AWS_BUCKET_NAME);
    console.log("Region:", process.env.AWS_REGION);
    // Güvenlik için sadece var olup olmadıklarını kontrol ediyoruz
    console.log("Access Key Exists:", !!process.env.AWS_ACCESS_KEY_ID);
    console.log("Secret Key Exists:", !!process.env.AWS_SECRET_ACCESS_KEY);
    console.error("-----------------------------------");
    return NextResponse.error();
  }
});