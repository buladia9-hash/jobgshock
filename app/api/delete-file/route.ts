import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  endpoint: process.env.NEXT_PUBLIC_WASABI_ENDPOINT!,
  region: process.env.WASABI_REGION!,
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY!,
    secretAccessKey: process.env.WASABI_SECRET_KEY!,
  },
});

export async function DELETE(request: NextRequest) {
  try {
    const fileId = request.nextUrl.searchParams.get('fileId');
    if (!fileId) return NextResponse.json({ error: 'No fileId provided' }, { status: 400 });
    
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.WASABI_BUCKET_NAME!,
      Key: fileId,
    }));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
