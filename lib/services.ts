import { databases } from './appwrite';
import { wasabiStorage } from './wasabi';
import { Job, Application } from '@/types';
import { ID, Query } from 'appwrite';

export const jobService = {
  async createJob(data: Omit<Job, '$id' | 'createdAt' | 'updatedAt' | 'applicationsCount'>) {
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
      applicationsCount: '0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
      ID.unique(),
      jobData
    );
  },

  async getJobs(filters?: { type?: string; location?: string; skills?: string[] }) {
    const queries = [Query.equal('status', 'active'), Query.orderDesc('createdAt')];
    if (filters?.type) queries.push(Query.equal('type', filters.type));
    const result = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
      queries
    );
    return result.documents.map((doc: any) => ({
      ...doc,
      salary: { min: doc.salaryMin, max: doc.salaryMax, currency: doc.currency },
      requirements: doc.requirements.split('\n').filter((r: string) => r.trim()),
      benefits: doc.benefits ? doc.benefits.split('\n').filter((b: string) => b.trim()) : [],
      skills: doc.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s)
    })) as Job[];
  },

  async getJobById(id: string) {
    const doc: any = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
      id
    );
    return {
      ...doc,
      salary: { min: doc.salaryMin, max: doc.salaryMax, currency: doc.currency },
      requirements: doc.requirements.split('\n').filter((r: string) => r.trim()),
      benefits: doc.benefits ? doc.benefits.split('\n').filter((b: string) => b.trim()) : [],
      skills: doc.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s)
    } as Job;
  },

  async updateJob(id: string, data: Partial<Job>) {
    return await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
      id,
      { ...data, updatedAt: new Date().toISOString() }
    );
  },

  async deleteJob(id: string) {
    return await databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
      id
    );
  },

  async getRecruiterJobs(recruiterId: string) {
    const result = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
      [Query.equal('recruiterId', recruiterId), Query.orderDesc('createdAt')]
    );
    return result.documents.map((doc: any) => ({
      ...doc,
      salary: { min: doc.salaryMin, max: doc.salaryMax, currency: doc.currency },
      requirements: doc.requirements.split('\n').filter((r: string) => r.trim()),
      benefits: doc.benefits ? doc.benefits.split('\n').filter((b: string) => b.trim()) : [],
      skills: doc.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s)
    })) as Job[];
  }
};

export const applicationService = {
  async applyToJob(jobId: string, employeeId: string, employeeName: string, employeeEmail: string, resumeId: string, coverLetter: string) {
    const app = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
      ID.unique(),
      { jobId, employeeId, employeeName, employeeEmail, resumeId, coverLetter, status: 'pending', appliedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    );
    const job = await jobService.getJobById(jobId);
    await jobService.updateJob(jobId, { applicationsCount: String(Number(job.applicationsCount) + 1) as any });
    return app;
  },

  async getApplicationsByJob(jobId: string) {
    const result = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
      [Query.equal('jobId', jobId), Query.orderDesc('appliedAt')]
    );
    return result.documents as unknown as Application[];
  },

  async getApplicationsByEmployee(employeeId: string) {
    const result = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
      [Query.equal('employeeId', employeeId), Query.orderDesc('appliedAt')]
    );
    return result.documents as unknown as Application[];
  },

  async updateApplicationStatus(id: string, status: Application['status']) {
    return await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
      id,
      { status, updatedAt: new Date().toISOString() }
    );
  }
};

export const storageService = {
  async uploadResume(file: File) {
    return await wasabiStorage.uploadFile(file, 'resumes');
  },

  async getFileUrl(fileId: string) {
    return await wasabiStorage.getFileUrl(fileId);
  },

  async deleteFile(fileId: string) {
    return await wasabiStorage.deleteFile(fileId);
  }
};
