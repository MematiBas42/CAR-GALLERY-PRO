import {
	PutObjectCommand,
	type PutObjectCommandInput,
	S3Client,
} from "@aws-sdk/client-s3";
import { Credentials } from "aws-sdk/lib/core";
const credentials = new Credentials({
    accessKeyId: process.env.AWS_S3_BUCKET_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_S3_BUCKET_SECRET_KEY!
})

export const s3 = new S3Client({
	region: process.env.NEXT_PUBLIC_S3_BUCKET_REGION,
	credentials,
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