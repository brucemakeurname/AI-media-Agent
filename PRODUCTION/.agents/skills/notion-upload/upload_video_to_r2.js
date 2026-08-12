// Upload a local video file to Cloudflare R2 and print its public URL.
// Same bucket/credentials pattern as INHOUSE TEAMS/1. Account Team/r2-upload.js — kept as a
// standalone copy here since Notion pages cap file-property attachments at ~5MB and every
// ai-commercial-short-video final exceeds that; the printed URL feeds `upload.py --video-url`.
//
// Usage: node upload_video_to_r2.js <local_path> <r2_key>
// Env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME (default soloflowsv1)

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'soloflowsv1';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

async function main() {
  const [, , localPath, r2Key] = process.argv;
  if (!localPath || !r2Key) {
    console.error('Usage: node upload_video_to_r2.js <local_path> <r2_key>');
    process.exit(1);
  }
  const body = fs.readFileSync(localPath);
  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: r2Key,
    Body: body,
    ContentType: 'video/mp4',
  }));
  console.log(`https://pub-${R2_ACCOUNT_ID}.r2.dev/${r2Key}`);
}

main().catch((err) => {
  console.error('R2 video upload failed:', err);
  process.exit(1);
});
