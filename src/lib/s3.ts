import {
	PutObjectCommand,
	type PutObjectCommandInput,
	S3Client,
} from "@aws-sdk/client-s3";

export const s3 = new S3Client({
	region: process.env.AWS_REGION || "auto",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
	},
    // Add endpoint support for Cloudflare R2, MinIO, etc.
    // If AWS_ENDPOINT is defined in .env, use it. Otherwise default to AWS standard.
    ...(process.env.AWS_ENDPOINT ? { endpoint: process.env.AWS_ENDPOINT } : {}),
});

interface UploadToS3Args {
	bucketName: string;
	path: string;
	file: Buffer;
	mimetype: string;
}

export async function uploadToS3({
    bucketName,
    path,
    file,
    mimetype,
}: UploadToS3Args) {
    const params = {
		Bucket: bucketName,
		Key: path,
		Body: file,
		ContentType: mimetype,
		CacheControl: "no-store",
	} satisfies PutObjectCommandInput;
    try {
        const command = new PutObjectCommand(params);
        return await s3.send(command);
    } catch (error) {
        console.error("Error uploading to S3:", error);
        throw new Error(`Failed to upload file: ${path}. Error: ${error}`);
    }
}
