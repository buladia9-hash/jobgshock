'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { jobService, applicationService } from '@/lib/services';
import { Job, Application } from '@/types';
import Link from 'next/link';
import { Briefcase, Users, TrendingUp, Clock, PlusCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ jobs: 0, applications: 0, active: 0 });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (user?.role === 'recruiter') {
      const jobs = await jobService.getRecruiterJobs(user.$id);
      setRecentJobs(jobs.slice(0, 5));
      const totalApps = jobs.reduce((sum, job) => sum + job.applicationsCount, 0);
      setStats({ jobs: jobs.length, applications: totalApps, active: jobs.filter(j => j.status === 'active').length });
    } else {
      const jobs = await jobService.getJobs();
      setRecentJobs(jobs.slice(0, 5));
      const apps = await applicationService.getApplicationsByEmployee(user!.$id);
      setRecentApplications(apps.slice(0, 5));
      setStats({ jobs: jobs.length, applications: apps.length, active: apps.filter(a => a.status === 'pending' || a.status === 'reviewing').length });
    }
  };

  if (!user) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-gray-600">Here's what's happening with your {user.role === 'recruiter' ? 'job postings' : 'job search'}</p>
      </div>

      {user.role === 'recruiter' && (
        <div className="card bg-gradient-to-r from-primary-600 to-primary-800 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Ready to find your next hire?</h2>
              <p className="text-primary-100 mb-4">Post a job and connect with talented professionals</p>
              <Link href="/jobs/create" className="btn bg-white text-primary-600 hover:bg-gray-100 inline-flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Post a New Job
              </Link>
            </div>
            <Briefcase className="w-32 h-32 text-primary-300 hidden md:block" />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{user.role === 'recruiter' ? 'Total Jobs' : 'Available Jobs'}</p>
              <p className="text-3xl font-bold mt-1">{stats.jobs}</p>
            </div>
            <Briefcase className="w-12 h-12 text-primary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{user.role === 'recruiter' ? 'Total Applications' : 'My Applications'}</p>
              <p className="text-3xl font-bold mt-1">{stats.applications}</p>
            </div>
            <Users className="w-12 h-12 text-secondary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{user.role === 'recruiter' ? 'Active Jobs' : 'Pending'}</p>
              <p className="text-3xl font-bold mt-1">{stats.active}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Jobs</h2>
          <div className="space-y-3">
            {recentJobs.map(job => (
              <Link key={job.$id} href={`/jobs/${job.$id}`} className="block p-3 hover:bg-gray-50 rounded-lg border">
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <Clock className="w-4 h-4" />
                  {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
          <Link href="/jobs" className="btn btn-secondary w-full mt-4">View All Jobs</Link>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
          <div className="space-y-3">
            {recentApplications.map(app => (
              <div key={app.$id} className="p-3 border rounded-lg">
                <h3 className="font-semibold">{app.employeeName || 'Application'}</h3>
                <p className="text-sm text-gray-600">{app.employeeEmail}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>{app.status}</span>
                  <span className="text-xs text-gray-500">{new Date(app.appliedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          <Link href="/applications" className="btn btn-secondary w-full mt-4">View All Applications</Link>
        </div>
      </div>
    </div>
  );
}
