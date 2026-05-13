import {
  S3Client,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Generate a presigned URL so the browser can upload directly to R2.
 * Expires in 15 minutes.
 */
export async function getPresignedUploadUrl(key, contentType) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(r2, command, { expiresIn: 900 });
  return url;
}

/**
 * Delete an object from R2.
 */
export async function deleteR2Object(key) {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    })
  );
}

/**
 * Build the public URL for an R2 object.
 * Requires the bucket to have public access enabled.
 */
export function getPublicUrl(key) {
  const base = process.env.R2_PUBLIC_URL.replace(/\/$/, '');
  return `${base}/${key}`;
}
