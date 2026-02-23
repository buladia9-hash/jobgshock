export type UserRole = 'employee' | 'recruiter';

export interface User {
  $id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  company?: string;
  website?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  resumeId?: string;
  createdAt: string;
}

export interface Job {
  $id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salary: { min: number; max: number; currency: string };
  description: string;
  requirements: string[];
  benefits: string[];
  skills: string[];
  recruiterId: string;
  recruiterName: string;
  status: 'active' | 'closed' | 'draft';
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  $id: string;
  jobId: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  resumeId: string;
  coverLetter: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted';
  appliedAt: string;
  updatedAt: string;
}

export interface Message {
  $id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Notification {
  $id: string;
  userId: string;
  type: 'application' | 'message' | 'job' | 'status';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}
