# Appwrite Setup - Quick Guide

## 1. Create Project
- Go to https://cloud.appwrite.io
- Click "Create Project"
- Name: "JobPortal"
- Copy the **Project ID**

## 2. Create Database
- Click "Databases" → "Create Database"
- Name: "jobportal"
- Copy the **Database ID**

## 3. Create Collections (Click "Create Collection" 5 times)

### Collection 1: "users"
Click "Create Collection" → Name: "users" → Copy Collection ID

**Add Attributes:**
- email (String, size: 255, required)
- name (String, size: 255, required)
- role (String, size: 50, required)
- phone (String, size: 50)
- location (String, size: 255)
- bio (String, size: 2000)
- company (String, size: 255)
- website (String, size: 500)
- skills (String, size: 1000)
- experience (String, size: 5000)
- education (String, size: 2000)
- resumeId (String, size: 255)
- createdAt (String, size: 100, required)

**Settings → Permissions:**
- Click "Add Role" → Select "Any" → Check all boxes (Create, Read, Update, Delete)

### Collection 2: "jobs"
Name: "jobs" → Copy Collection ID

**Add Attributes:**
- title (String, size: 255, required)
- company (String, size: 255, required)
- location (String, size: 255, required)
- type (String, size: 50, required)
- salaryMin (Integer, required)
- salaryMax (Integer, required)
- currency (String, size: 10, required)
- description (String, size: 10000, required)
- requirements (String, size: 5000, required)
- benefits (String, size: 3000)
- skills (String, size: 1000, required)
- recruiterId (String, size: 255, required)
- recruiterName (String, size: 255, required)
- status (String, size: 50, required)
- applicationsCount (Integer, required, default: 0)
- createdAt (String, size: 100, required)
- updatedAt (String, size: 100, required)

**Settings → Permissions:**
- Click "Add Role" → Select "Any" → Check all boxes

### Collection 3: "applications"
Name: "applications" → Copy Collection ID

**Add Attributes:**
- jobId (String, size: 255, required)
- employeeId (String, size: 255, required)
- employeeName (String, size: 255, required)
- employeeEmail (String, size: 255, required)
- resumeId (String, size: 255, required)
- coverLetter (String, size: 5000, required)
- status (String, size: 50, required)
- appliedAt (String, size: 100, required)
- updatedAt (String, size: 100, required)

**Settings → Permissions:**
- Click "Add Role" → Select "Any" → Check all boxes

### Collection 4: "messages"
Name: "messages" → Copy Collection ID

**Add Attributes:**
- senderId (String, size: 255, required)
- receiverId (String, size: 255, required)
- content (String, size: 5000, required)
- read (Boolean, required, default: false)
- createdAt (String, size: 100, required)

**Settings → Permissions:**
- Click "Add Role" → Select "Any" → Check all boxes

### Collection 5: "notifications"
Name: "notifications" → Copy Collection ID

**Add Attributes:**
- userId (String, size: 255, required)
- type (String, size: 50, required)
- title (String, size: 255, required)
- message (String, size: 1000, required)
- read (Boolean, required, default: false)
- link (String, size: 500)
- createdAt (String, size: 100, required)

**Settings → Permissions:**
- Click "Add Role" → Select "Any" → Check all boxes

## 4. Storage Setup
**SKIP Appwrite Storage - Using Wasabi Instead**
- Follow **WASABI_SETUP.md** for storage configuration

## 5. Enable Authentication
- Click "Auth" → "Settings"
- Enable "Email/Password"

## 6. Copy All IDs to .env.local

Create file `.env.local` in your project root:

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=paste_project_id_here
NEXT_PUBLIC_APPWRITE_DATABASE_ID=paste_database_id_here
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=paste_users_collection_id_here
NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID=paste_jobs_collection_id_here
NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID=paste_applications_collection_id_here
NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID=paste_messages_collection_id_here
NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID=paste_notifications_collection_id_here

WASABI_ACCESS_KEY=your_wasabi_access_key
WASABI_SECRET_KEY=your_wasabi_secret_key
WASABI_BUCKET_NAME=your_bucket_name
WASABI_REGION=us-east-1
NEXT_PUBLIC_WASABI_ENDPOINT=https://s3.wasabisys.com
```

## Done!
Now run: `npm install` then `npm run dev`
