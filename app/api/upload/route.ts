import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  endpoint: process.env.NEXT_PUBLIC_WASABI_ENDPOINT!,
  region: process.env.WASABI_REGION!,
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY!,
    secretAccessKey: process.env.WASABI_SECRET_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'resumes';
    
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    
    const fileName = `${folder}/${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();
    
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.WASABI_BUCKET_NAME!,
      Key: fileName,
      Body: Buffer.from(buffer),
      ContentType: file.type,
    }));

    return NextResponse.json({ $id: fileName, name: file.name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
