'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import Link from 'next/link';
import {
  Briefcase, Users, TrendingUp, Clock, PlusCircle,
  Eye, CheckCircle, XCircle, ArrowRight, BarChart2, Star
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ jobs: 0, applications: 0, active: 0, views: 0 });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      if (user.role === 'recruiter') {
        const jobsResult = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
          [Query.equal('recruiterId', user.$id), Query.orderDesc('createdAt')]
        );
        const jobs = jobsResult.documents;
        setRecentJobs(jobs.slice(0, 5));
        const totalApps = jobs.reduce((sum: number, job: any) => sum + (job.applicationsCount || 0), 0);
        setStats({
          jobs: jobs.length,
          applications: totalApps,
          active: jobs.filter((j: any) => j.status === 'active').length,
          views: totalApps * 5
        });

        const appsResult = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
          [Query.equal('jobId', jobs[0]?.$id || 'none'), Query.orderDesc('appliedAt'), Query.limit(5)]
        );
        setRecentApplications(appsResult.documents);
      } else {
        const jobsResult = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
          [Query.equal('status', 'active'), Query.orderDesc('createdAt'), Query.limit(5)]
        );
        setRecentJobs(jobsResult.documents);

        const appsResult = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
          [Query.equal('employeeId', user.$id), Query.orderDesc('appliedAt')]
        );
        setRecentApplications(appsResult.documents);
        setStats({
          jobs: jobsResult.total,
          applications: appsResult.total,
          active: appsResult.documents.filter((a: any) => a.status === 'pending').length,
          views: 0
        });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
            <p className="text-primary-100 text-lg">
              {user.role === 'recruiter'
                ? 'Manage your job postings and find the best talent'
                : 'Discover your next career opportunity'}
            </p>
            {user.role === 'recruiter' && (
              <Link href="/jobs/create" className="btn bg-white text-primary-600 hover:bg-gray-100 mt-4 inline-flex items-center gap-2 font-semibold">
                <PlusCircle className="w-5 h-5" />
                Post a New Job
              </Link>
            )}
          </div>
          <BarChart2 className="w-32 h-32 text-primary-300 hidden md:block" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">Active</span>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.jobs}</p>
          <p className="text-sm text-gray-500">{user.role === 'recruiter' ? 'Total Jobs Posted' : 'Available Jobs'}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.applications}</p>
          <p className="text-sm text-gray-500">{user.role === 'recruiter' ? 'Total Applications' : 'My Applications'}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.active}</p>
          <p className="text-sm text-gray-500">{user.role === 'recruiter' ? 'Active Listings' : 'Pending'}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.views}</p>
          <p className="text-sm text-gray-500">{user.role === 'recruiter' ? 'Total Views' : 'Saved Jobs'}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{user.role === 'recruiter' ? 'My Job Postings' : 'Latest Jobs'}</h2>
            <Link href="/jobs" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : recentJobs.length > 0 ? recentJobs.map((job: any) => (
              <Link key={job.$id} href={`/jobs/${job.$id}`} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{job.title}</h3>
                  <p className="text-xs text-gray-500">{job.company} • {job.location}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {job.status}
                  </span>
                  {user.role === 'recruiter' && (
                    <p className="text-xs text-gray-500 mt-1">{job.applicationsCount || 0} apps</p>
                  )}
                </div>
              </Link>
            )) : (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-4">No jobs yet</p>
                {user.role === 'recruiter' && (
                  <Link href="/jobs/create" className="btn btn-primary text-sm">Post Your First Job</Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Applications</h2>
            <Link href="/applications" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : recentApplications.length > 0 ? recentApplications.map((app: any) => (
              <div key={app.$id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {app.employeeName?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{app.employeeName || 'Applicant'}</h3>
                  <p className="text-xs text-gray-500 truncate">{app.employeeEmail}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                  app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  app.status === 'shortlisted' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {app.status}
                </span>
              </div>
            )) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No applications yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions for Recruiter */}
      {user.role === 'recruiter' && (
        <div className="mt-6 bg-white rounded-xl border p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/jobs/create" className="flex flex-col items-center gap-3 p-4 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors text-center">
              <PlusCircle className="w-8 h-8 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Post a Job</span>
            </Link>
            <Link href="/jobs" className="flex flex-col items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center">
              <Briefcase className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Manage Jobs</span>
            </Link>
            <Link href="/applications" className="flex flex-col items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-center">
              <Users className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">View Applicants</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-center">
              <Star className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-green-700">Edit Profile</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
