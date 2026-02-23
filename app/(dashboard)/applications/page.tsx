'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { applicationService, jobService, storageService } from '@/lib/services';
import { Application, Job } from '@/types';
import Link from 'next/link';
import { Clock, ExternalLink } from 'lucide-react';

export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<(Application & { job?: Job; resumeUrl?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadApplications();
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;
    const apps = await applicationService.getApplicationsByEmployee(user.$id);
    const appsWithJobsAndUrls = await Promise.all(
      apps.map(async (app) => {
        try {
          const job = await jobService.getJobById(app.jobId);
          const resumeUrl = await storageService.getFileUrl(app.resumeId);
          return { ...app, job, resumeUrl };
        } catch {
          const resumeUrl = await storageService.getFileUrl(app.resumeId);
          return { ...app, resumeUrl };
        }
      })
    );
    setApplications(appsWithJobsAndUrls);
    setLoading(false);
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Applications</h1>

      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">You haven't applied to any jobs yet</p>
          <Link href="/jobs" className="btn btn-primary">Browse Jobs</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.$id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {app.job ? (
                    <>
                      <Link href={`/jobs/${app.jobId}`} className="text-xl font-semibold hover:text-primary-600">
                        {app.job.title}
                      </Link>
                      <p className="text-gray-600 mt-1">{app.job.company} • {app.job.location}</p>
                    </>
                  ) : (
                    <h3 className="text-xl font-semibold">Job Application</h3>
                  )}
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </div>
                  <p className="text-gray-700 mt-3 line-clamp-2">{app.coverLetter}</p>
                </div>
                <div className="text-right ml-4">
                  <span className={`px-3 py-1 rounded-full text-sm inline-block mb-3 ${
                    app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    app.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                    app.status === 'reviewing' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {app.status}
                  </span>
                  <a href={app.resumeUrl} target="_blank" className="flex items-center gap-1 text-sm text-primary-600 hover:underline">
                    View Resume <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
