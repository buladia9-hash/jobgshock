'use server';
import { createAdminClient } from './appwrite-server';
import { ID, Query } from 'node-appwrite';
import { cookies } from 'next/headers';

export async function createJob(data: any) {
  const { databases } = createAdminClient();
  
  const jobData = {
    title: data.title,
    company: data.company,
    location: data.location,
    type: data.type,
    salaryMin: String(data.salary.min),
    salaryMax: String(data.salary.max),
    currency: data.salary.currency,
    description: data.description,
    requirements: data.requirements.join('\n'),
    benefits: data.benefits.join('\n'),
    skills: data.skills.join(','),
    recruiterId: data.recruiterId,
    recruiterName: data.recruiterName,
    status: data.status,
    applicationsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return await databases.createDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
    ID.unique(),
    jobData
  );
}

export async function getJobs(filters?: { type?: string; search?: string; location?: string }) {
  const { databases } = createAdminClient();
  
  const queries = [Query.equal('status', 'active'), Query.orderDesc('createdAt')];
  if (filters?.type) queries.push(Query.equal('type', filters.type));
  
  const result = await databases.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
    queries
  );
  
  return result.documents.map((doc: any) => ({
    ...doc,
    salary: { min: Number(doc.salaryMin), max: Number(doc.salaryMax), currency: doc.currency },
    requirements: doc.requirements.split('\n').filter((r: string) => r.trim()),
    benefits: doc.benefits ? doc.benefits.split('\n').filter((b: string) => b.trim()) : [],
    skills: doc.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s)
  }));
}

export async function getJobById(id: string) {
  const { databases } = createAdminClient();
  
  const doc: any = await databases.getDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
    id
  );
  
  return {
    ...doc,
    salary: { min: Number(doc.salaryMin), max: Number(doc.salaryMax), currency: doc.currency },
    requirements: doc.requirements.split('\n').filter((r: string) => r.trim()),
    benefits: doc.benefits ? doc.benefits.split('\n').filter((b: string) => b.trim()) : [],
    skills: doc.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s)
  };
}

export async function getRecruiterJobs(recruiterId: string) {
  const { databases } = createAdminClient();
  
  const result = await databases.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
    [Query.equal('recruiterId', recruiterId), Query.orderDesc('createdAt')]
  );
  
  return result.documents.map((doc: any) => ({
    ...doc,
    salary: { min: Number(doc.salaryMin), max: Number(doc.salaryMax), currency: doc.currency },
    requirements: doc.requirements.split('\n').filter((r: string) => r.trim()),
    benefits: doc.benefits ? doc.benefits.split('\n').filter((b: string) => b.trim()) : [],
    skills: doc.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s)
  }));
}

export async function applyToJob(jobId: string, employeeId: string, employeeName: string, employeeEmail: string, resumeId: string, coverLetter: string) {
  const { databases } = createAdminClient();
  
  const app = await databases.createDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
    ID.unique(),
    {
      jobId,
      employeeId,
      employeeName,
      employeeEmail,
      resumeId,
      coverLetter,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  );
  
  const job: any = await databases.getDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
    jobId
  );
  
  await databases.updateDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
    jobId,
    { applicationsCount: job.applicationsCount + 1 }
  );
  
  return app;
}

export async function getApplicationsByJob(jobId: string) {
  const { databases } = createAdminClient();
  
  const result = await databases.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
    [Query.equal('jobId', jobId), Query.orderDesc('appliedAt')]
  );
  
  return result.documents;
}

export async function getApplicationsByEmployee(employeeId: string) {
  const { databases } = createAdminClient();
  
  const result = await databases.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
    [Query.equal('employeeId', employeeId), Query.orderDesc('appliedAt')]
  );
  
  return result.documents;
}

export async function updateApplicationStatus(id: string, status: string) {
  const { databases } = createAdminClient();
  
  return await databases.updateDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
    id,
    { status, updatedAt: new Date().toISOString() }
  );
}

export async function getCurrentUser() {
  const sessionCookie = cookies().get('session');
  if (!sessionCookie) return null;
  
  const { account, databases } = createAdminClient();
  
  try {
    const accountData = await account.get();
    const userDoc = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
      [Query.equal('email', accountData.email)]
    );
    
    const userData: any = userDoc.documents[0];
    return {
      ...userData,
      skills: userData.skills ? userData.skills.split(',').map((s: string) => s.trim()) : []
    };
  } catch {
    return null;
  }
}
