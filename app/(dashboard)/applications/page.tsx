'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import Link from 'next/link';
import { Clock, ExternalLink, Briefcase, X, MessageSquare, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) loadApplications(); }, [user]);

  const loadApplications = async () => {
    if (!user) return;
    try {
      if (user.role === 'recruiter') {
        // Recruiter: get all jobs first, then their applications
        const jobsResult = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
          [Query.equal('recruiterId', user.$id), Query.orderDesc('createdAt')]
        );
        const jobs = jobsResult.documents;
        if (jobs.length === 0) { setApplications([]); setLoading(false); return; }
        const jobIds = jobs.map((j: any) => j.$id);
        const appsResult = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
          [Query.equal('jobId', jobIds), Query.orderDesc('appliedAt')]
        );
        const appsWithJobs = appsResult.documents.map((app: any) => ({
          ...app,
          job: jobs.find((j: any) => j.$id === app.jobId) || null
        }));
        setApplications(appsWithJobs);
      } else {
        // Employee: get their own applications
        const appsResult = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
          [Query.equal('employeeId', user.$id), Query.orderDesc('appliedAt')]
        );
        const appsWithJobs = await Promise.all(
          appsResult.documents.map(async (app: any) => {
            let job = null;
            let resumeUrl = '';
            try {
              job = await databases.getDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
                app.jobId
              );
            } catch {}
            if (app.resumeId) {
              resumeUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${app.resumeId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
            }
            return { ...app, job, resumeUrl };
          })
        );
        setApplications(appsWithJobs);
      }
    } catch (error) { console.error('Failed to load applications:', error); }
    setLoading(false);
  };

  const handleWithdraw = async (appId: string) => {
    if (!confirm('Withdraw this application?')) return;
    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
        appId
      );
      setApplications(prev => prev.filter(a => a.$id !== appId));
      toast.success('Application withdrawn');
    } catch { toast.error('Failed to withdraw application'); }
  };

  const statusConfig: Record<string, { color: string; label: string }> = {
    pending:    { color: 'bg-yellow-100 text-yellow-700 border-yellow-200',   label: 'Pending Review' },
    reviewing:  { color: 'bg-purple-100 text-purple-700 border-purple-200',   label: 'Under Review' },
    shortlisted:{ color: 'bg-blue-100 text-blue-700 border-blue-200',         label: 'Shortlisted' },
    accepted:   { color: 'bg-green-100 text-green-700 border-green-200',      label: 'Accepted 🎉' },
    rejected:   { color: 'bg-red-100 text-red-700 border-red-200',            label: 'Not Selected' },
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{user?.role === 'recruiter' ? 'All Applications' : 'My Applications'}</h1>
        <p className="text-gray-500 mt-1">{applications.length} application{applications.length !== 1 ? 's' : ''} {user?.role === 'recruiter' ? 'received' : 'submitted'}</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl border shadow-sm text-center py-16">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">{user?.role === 'recruiter' ? 'No applications yet' : 'No applications yet'}</h3>
          <p className="text-gray-500 mb-6">{user?.role === 'recruiter' ? 'Applications will appear here when job seekers apply' : 'Start applying to jobs that match your skills'}</p>
          {user?.role === 'employee' && <Link href="/jobs" className="btn btn-primary px-8">Browse Jobs</Link>}
          {user?.role === 'recruiter' && <Link href="/jobs/create" className="btn btn-primary px-8">Post a Job</Link>}
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => {
            const status = statusConfig[app.status] || statusConfig.pending;
            return (
              <div key={app.$id} className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                      {user?.role === 'recruiter' ? app.employeeName?.charAt(0)?.toUpperCase() : app.job?.company?.charAt(0)?.toUpperCase() || 'J'}
                    </div>
                    <div className="flex-1 min-w-0">
                      {user?.role === 'recruiter' ? (
                        <>
                          <p className="text-lg font-bold text-gray-900">{app.employeeName}</p>
                          <p className="text-sm text-gray-500">{app.employeeEmail}</p>
                          {app.job && (
                            <Link href={`/jobs/${app.jobId}`} className="text-sm text-primary-600 hover:underline mt-1 inline-block">
                              Applied for: {app.job.title}
                            </Link>
                          )}
                        </>
                      ) : (
                        <>
                          {app.job ? (
                            <>
                              <Link href={`/jobs/${app.jobId}`} className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors">
                                {app.job.title}
                              </Link>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                <span className="font-medium text-gray-700">{app.job.company}</span>
                                {app.job.location && (
                                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{app.job.location}</span>
                                )}
                              </div>
                            </>
                          ) : (
                            <h3 className="text-lg font-bold text-gray-900">Job Application</h3>
                          )}
                        </>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        Applied {new Date(app.appliedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      {app.coverLetter && (
                        <p className="text-gray-600 text-sm mt-3 line-clamp-2 bg-gray-50 rounded-lg p-3">{app.coverLetter}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                      {status.label}
                    </span>
                    <div className="flex flex-col items-end gap-2">
                      {app.resumeUrl && (
                        <a href={app.resumeUrl} target="_blank" className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 font-medium">
                          <ExternalLink className="w-3 h-3" /> View Resume
                        </a>
                      )}
                      {user?.role === 'recruiter' ? (
                        <Link href={`/messages?to=${app.employeeId}&name=${encodeURIComponent(app.employeeName)}`} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                          <MessageSquare className="w-3 h-3" /> Message
                        </Link>
                      ) : (
                        app.job?.recruiterId && (
                          <Link href={`/messages?to=${app.job.recruiterId}&name=${encodeURIComponent(app.job.recruiterName || 'Recruiter')}`} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                            <MessageSquare className="w-3 h-3" /> Message Recruiter
                          </Link>
                        )
                      )}
                      {app.status === 'pending' && user?.role === 'employee' && (
                        <button onClick={() => handleWithdraw(app.$id)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium">
                          <X className="w-3 h-3" /> Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
