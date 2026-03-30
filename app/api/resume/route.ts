import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  endpoint: process.env.NEXT_PUBLIC_WASABI_ENDPOINT!,
  region: process.env.WASABI_REGION!,
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY!,
    secretAccessKey: process.env.WASABI_SECRET_KEY!,
  },
});

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get('fileId');

  if (!fileId) {
    return NextResponse.json({ error: 'No fileId provided' }, { status: 400 });
  }

  try {
    if (fileId.includes('/')) {
      const command = new GetObjectCommand({
        Bucket: process.env.WASABI_BUCKET_NAME!,
        Key: fileId,
      });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return NextResponse.redirect(signedUrl);
    }

    const appwriteResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${fileId}/view`,
      {
        headers: {
          'X-Appwrite-Project': process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
          'X-Appwrite-Key': process.env.APPWRITE_API_KEY!,
        },
      }
    );

    if (!appwriteResponse.ok || !appwriteResponse.body) {
      return NextResponse.json({ error: 'Failed to load resume' }, { status: appwriteResponse.status || 500 });
    }

    return new NextResponse(appwriteResponse.body, {
      headers: {
        'Content-Type': appwriteResponse.headers.get('content-type') || 'application/octet-stream',
        'Content-Disposition': appwriteResponse.headers.get('content-disposition') || 'inline',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load resume' }, { status: 500 });
  }
}
