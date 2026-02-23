# Appwrite Setup Guide

## Step 1: Create Appwrite Project

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io) and sign up/login
2. Click "Create Project"
3. Name it "JobPortal" and create
4. Copy your Project ID

## Step 2: Create Database

1. Go to "Databases" in the left sidebar
2. Click "Create Database"
3. Name it "jobportal-db"
4. Copy the Database ID

## Step 3: Create Collections

### Collection 1: users

**Attributes:**
- email (String, 255, Required)
- name (String, 255, Required)
- role (String, 50, Required)
- avatar (String, 500)
- phone (String, 50)
- location (String, 255)
- bio (String, 2000)
- company (String, 255)
- website (String, 500)
- skills (String[], 50 items)
- experience (String, 5000)
- education (String, 2000)
- resumeId (String, 255)
- createdAt (String, 100, Required)

**Indexes:**
- email (unique, asc)

**Permissions:**
- Read: Users
- Create: Users
- Update: Users
- Delete: Users

### Collection 2: jobs

**Attributes:**
- title (String, 255, Required)
- company (String, 255, Required)
- location (String, 255, Required)
- type (String, 50, Required)
- salary (String, 1000, Required) - Store as JSON string
- description (String, 10000, Required)
- requirements (String[], 100 items, Required)
- benefits (String[], 50 items)
- skills (String[], 50 items, Required)
- recruiterId (String, 255, Required)
- recruiterName (String, 255, Required)
- status (String, 50, Required)
- applicationsCount (Integer, Required, Default: 0)
- createdAt (String, 100, Required)
- updatedAt (String, 100, Required)

**Indexes:**
- recruiterId (asc)
- status (asc)
- createdAt (desc)

**Permissions:**
- Read: Any
- Create: Users
- Update: Users
- Delete: Users

### Collection 3: applications

**Attributes:**
- jobId (String, 255, Required)
- employeeId (String, 255, Required)
- employeeName (String, 255, Required)
- employeeEmail (String, 255, Required)
- resumeId (String, 255, Required)
- coverLetter (String, 5000, Required)
- status (String, 50, Required)
- appliedAt (String, 100, Required)
- updatedAt (String, 100, Required)

**Indexes:**
- jobId (asc)
- employeeId (asc)
- appliedAt (desc)

**Permissions:**
- Read: Users
- Create: Users
- Update: Users
- Delete: Users

### Collection 4: messages

**Attributes:**
- senderId (String, 255, Required)
- receiverId (String, 255, Required)
- content (String, 5000, Required)
- read (Boolean, Required, Default: false)
- createdAt (String, 100, Required)

**Indexes:**
- senderId (asc)
- receiverId (asc)
- createdAt (desc)

**Permissions:**
- Read: Users
- Create: Users
- Update: Users
- Delete: Users

### Collection 5: notifications

**Attributes:**
- userId (String, 255, Required)
- type (String, 50, Required)
- title (String, 255, Required)
- message (String, 1000, Required)
- read (Boolean, Required, Default: false)
- link (String, 500)
- createdAt (String, 100, Required)

**Indexes:**
- userId (asc)
- createdAt (desc)

**Permissions:**
- Read: Users
- Create: Users
- Update: Users
- Delete: Users

## Step 4: Create Storage Bucket

1. Go to "Storage" in the left sidebar
2. Click "Create Bucket"
3. Name it "resumes"
4. Set max file size to 10MB
5. Allowed file extensions: pdf, doc, docx
6. Copy the Bucket ID

**Permissions:**
- Read: Users
- Create: Users
- Update: Users
- Delete: Users

## Step 5: Enable Authentication

1. Go to "Auth" in the left sidebar
2. Enable "Email/Password" authentication
3. (Optional) Configure email templates

## Step 6: Update Environment Variables

Copy all IDs to your `.env.local` file:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_APPWRITE_DATABASE_ID=<your-database-id>
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=<users-collection-id>
NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID=<jobs-collection-id>
NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID=<applications-collection-id>
NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID=<messages-collection-id>
NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID=<notifications-collection-id>
NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=<resumes-bucket-id>
```

## Quick Setup Script (Optional)

You can use Appwrite CLI to automate this setup:

```bash
npm install -g appwrite-cli
appwrite login
appwrite init project
# Follow the prompts and use the provided schema
```

## Troubleshooting

**Issue: Permission denied errors**
- Make sure all collections have proper permissions set for "Users" role
- Check that authentication is enabled

**Issue: File upload fails**
- Verify storage bucket permissions
- Check file size limits
- Ensure allowed file extensions include pdf

**Issue: Can't create documents**
- Verify all required attributes are provided
- Check attribute types match the schema
- Ensure user is authenticated

## Security Best Practices

1. Never expose API keys in client-side code
2. Use Appwrite's built-in authentication
3. Set appropriate collection permissions
4. Validate data on both client and server
5. Use HTTPS in production
6. Enable rate limiting in Appwrite dashboard
7. Regularly backup your database

## Next Steps

After setup is complete:
1. Run `npm install` to install dependencies
2. Run `npm run dev` to start development server
3. Create test accounts for both recruiter and employee roles
4. Test all features thoroughly
5. Deploy to production when ready
