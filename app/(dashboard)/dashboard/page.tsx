'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import Link from 'next/link';
import {
  Briefcase, Users, PlusCircle, Eye, CheckCircle,
  ArrowRight, BarChart2, Star, FileText, Search
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ jobs: 0, applications: 0, active: 0, views: 0 });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.$id && user?.role) loadData();
  }, [user?.$id, user?.role]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.role === 'recruiter') {
        await loadRecruiterData();
      } else {
        await loadEmployeeData();
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
    setLoading(false);
  };

  const loadRecruiterData = async () => {
    const jobsResult = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
      [Query.equal('recruiterId', user!.$id), Query.orderDesc('createdAt')]
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

    if (jobs.length > 0) {
      const jobIds = jobs.map((j: any) => j.$id);
      const appsResult = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
        [Query.equal('jobId', jobIds), Query.orderDesc('appliedAt'), Query.limit(5)]
      );
      setRecentApplications(appsResult.documents);
    }
  };

  const loadEmployeeData = async () => {
    const jobsResult = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
      [Query.equal('status', 'active'), Query.orderDesc('createdAt'), Query.limit(5)]
    );
    setRecentJobs(jobsResult.documents);

    const appsResult = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
      [Query.equal('employeeId', user!.$id), Query.orderDesc('appliedAt')]
    );
    setRecentApplications(appsResult.documents);
    setStats({
      jobs: jobsResult.total,
      applications: appsResult.total,
      active: appsResult.documents.filter((a: any) => a.status === 'pending').length,
      views: 0
    });
  };

  if (!user) return null;

  const isRecruiter = user.role === 'recruiter';

  return (
    <div>
      {/* Welcome Banner */}
      <div className={`rounded-2xl p-8 mb-8 text-white ${isRecruiter ? 'bg-gradient-to-r from-blue-600 to-blue-800' : 'bg-gradient-to-r from-primary-600 to-primary-800'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Welcome back, {user.name}! 👋</h1>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${isRecruiter ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                {isRecruiter ? '🏢 Recruiter' : '👤 Job Seeker'}
              </span>
            </div>
            <p className="text-white/80 text-lg">
              {isRecruiter ? 'Manage your job postings and find the best talent' : 'Discover your next career opportunity'}
            </p>
            {isRecruiter ? (
              <Link href="/jobs/create" className="btn bg-white text-blue-600 hover:bg-gray-100 mt-4 inline-flex items-center gap-2 font-semibold">
                <PlusCircle className="w-5 h-5" /> Post a New Job
              </Link>
            ) : (
              <Link href="/jobs" className="btn bg-white text-primary-600 hover:bg-gray-100 mt-4 inline-flex items-center gap-2 font-semibold">
                <Search className="w-5 h-5" /> Browse Jobs
              </Link>
            )}
          </div>
          <BarChart2 className="w-32 h-32 text-white/30 hidden md:block" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {isRecruiter ? (
          <>
            <StatCard icon={<Briefcase className="w-6 h-6 text-blue-600" />} bg="bg-blue-100" value={stats.jobs} label="Jobs Posted" />
            <StatCard icon={<Users className="w-6 h-6 text-purple-600" />} bg="bg-purple-100" value={stats.applications} label="Total Applications" />
            <StatCard icon={<CheckCircle className="w-6 h-6 text-green-600" />} bg="bg-green-100" value={stats.active} label="Active Listings" />
            <StatCard icon={<Eye className="w-6 h-6 text-orange-600" />} bg="bg-orange-100" value={stats.views} label="Total Views" />
          </>
        ) : (
          <>
            <StatCard icon={<Briefcase className="w-6 h-6 text-blue-600" />} bg="bg-blue-100" value={stats.jobs} label="Available Jobs" />
            <StatCard icon={<FileText className="w-6 h-6 text-purple-600" />} bg="bg-purple-100" value={stats.applications} label="My Applications" />
            <StatCard icon={<CheckCircle className="w-6 h-6 text-green-600" />} bg="bg-green-100" value={stats.active} label="Pending" />
            <StatCard icon={<Star className="w-6 h-6 text-orange-600" />} bg="bg-orange-100" value={0} label="Saved Jobs" />
          </>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Jobs Section */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{isRecruiter ? 'My Job Postings' : 'Latest Jobs'}</h2>
            <Link href="/jobs" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : recentJobs.length > 0 ? recentJobs.map((job: any) => (
              <Link key={job.$id} href={`/jobs/${job.$id}`} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isRecruiter ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-primary-600 to-primary-800'}`}>
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
                  {isRecruiter && <p className="text-xs text-gray-500 mt-1">{job.applicationsCount || 0} apps</p>}
                </div>
              </Link>
            )) : (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-4">{isRecruiter ? 'No jobs posted yet' : 'No jobs available'}</p>
                {isRecruiter && <Link href="/jobs/create" className="btn btn-primary text-sm">Post Your First Job</Link>}
              </div>
            )}
          </div>
        </div>

        {/* Applications Section */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{isRecruiter ? 'Recent Applicants' : 'My Applications'}</h2>
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
                  {(isRecruiter ? app.employeeName : app.jobTitle)?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{isRecruiter ? app.employeeName : app.jobTitle || 'Job Application'}</h3>
                  <p className="text-xs text-gray-500 truncate">{isRecruiter ? app.employeeEmail : app.company}</p>
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
                <p className="text-gray-500">{isRecruiter ? 'No applicants yet' : 'No applications yet'}</p>
                {!isRecruiter && <Link href="/jobs" className="btn btn-primary text-sm mt-4">Find Jobs to Apply</Link>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-xl border p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isRecruiter ? (
            <>
              <QuickAction href="/jobs/create" icon={<PlusCircle className="w-8 h-8 text-primary-600" />} label="Post a Job" bg="bg-primary-50 hover:bg-primary-100" text="text-primary-700" />
              <QuickAction href="/jobs" icon={<Briefcase className="w-8 h-8 text-blue-600" />} label="Manage Jobs" bg="bg-blue-50 hover:bg-blue-100" text="text-blue-700" />
              <QuickAction href="/applications" icon={<Users className="w-8 h-8 text-purple-600" />} label="View Applicants" bg="bg-purple-50 hover:bg-purple-100" text="text-purple-700" />
              <QuickAction href="/profile" icon={<Star className="w-8 h-8 text-green-600" />} label="Edit Profile" bg="bg-green-50 hover:bg-green-100" text="text-green-700" />
            </>
          ) : (
            <>
              <QuickAction href="/jobs" icon={<Search className="w-8 h-8 text-primary-600" />} label="Browse Jobs" bg="bg-primary-50 hover:bg-primary-100" text="text-primary-700" />
              <QuickAction href="/applications" icon={<FileText className="w-8 h-8 text-blue-600" />} label="My Applications" bg="bg-blue-50 hover:bg-blue-100" text="text-blue-700" />
              <QuickAction href="/profile" icon={<Star className="w-8 h-8 text-purple-600" />} label="Update Profile" bg="bg-purple-50 hover:bg-purple-100" text="text-purple-700" />
              <QuickAction href="/profile" icon={<CheckCircle className="w-8 h-8 text-green-600" />} label="Upload Resume" bg="bg-green-50 hover:bg-green-100" text="text-green-700" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, bg, value, label }: { icon: React.ReactNode; bg: string; value: number; label: string }) {
  return (
    <div className="bg-white rounded-xl p-6 border hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>{icon}</div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function QuickAction({ href, icon, label, bg, text }: { href: string; icon: React.ReactNode; label: string; bg: string; text: string }) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-3 p-4 ${bg} rounded-xl transition-colors text-center`}>
      {icon}
      <span className={`text-sm font-medium ${text}`}>{label}</span>
    </Link>
  );
}
