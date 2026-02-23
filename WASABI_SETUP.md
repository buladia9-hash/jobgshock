# Wasabi Storage Setup

## 1. Create Wasabi Account
- Go to https://wasabi.com
- Sign up for an account
- Login to Wasabi Console

## 2. Create Bucket
- Click "Buckets" → "Create Bucket"
- Bucket Name: `job-portal-resumes` (or your choice)
- Region: Choose closest to you (e.g., us-east-1)
- Keep default settings
- Click "Create Bucket"

## 3. Create Access Keys
- Click your username (top right) → "Access Keys"
- Click "Create New Access Key"
- Copy both:
  - Access Key
  - Secret Key
- Save them securely (you won't see Secret Key again)

## 4. Configure CORS (Optional - for direct uploads)
- Go to your bucket → "Settings" → "CORS Configuration"
- Add this configuration:
```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## 5. Update .env.local
```
WASABI_ACCESS_KEY=your_access_key_here
WASABI_SECRET_KEY=your_secret_key_here
WASABI_BUCKET_NAME=job-portal-resumes
WASABI_REGION=us-east-1
NEXT_PUBLIC_WASABI_ENDPOINT=https://s3.wasabisys.com
```

## Wasabi Regions
- us-east-1: https://s3.wasabisys.com
- us-east-2: https://s3.us-east-2.wasabisys.com
- us-west-1: https://s3.us-west-1.wasabisys.com
- eu-central-1: https://s3.eu-central-1.wasabisys.com
- ap-northeast-1: https://s3.ap-northeast-1.wasabisys.com

Update NEXT_PUBLIC_WASABI_ENDPOINT based on your region.

## Done!
Wasabi is now configured. Resume uploads will go to Wasabi instead of Appwrite.
