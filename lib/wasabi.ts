import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  endpoint: process.env.NEXT_PUBLIC_WASABI_ENDPOINT || 'https://s3.wasabisys.com',
  region: process.env.WASABI_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY || '',
    secretAccessKey: process.env.WASABI_SECRET_KEY || '',
  },
});

export const wasabiStorage = {
  async uploadFile(file: File, folder: string = 'resumes') {
    const fileName = `${folder}/${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();
    
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.WASABI_BUCKET_NAME || '',
      Key: fileName,
      Body: Buffer.from(buffer),
      ContentType: file.type,
    }));

    return { $id: fileName, name: file.name };
  },

  async getFileUrl(fileId: string) {
    const command = new GetObjectCommand({
      Bucket: process.env.WASABI_BUCKET_NAME || '',
      Key: fileId,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  },

  async deleteFile(fileId: string) {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.WASABI_BUCKET_NAME || '',
      Key: fileId,
    }));
  },
};
