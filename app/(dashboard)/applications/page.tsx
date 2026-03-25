'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import Link from 'next/link';
import { Clock, ExternalLink, Briefcase } from 'lucide-react';

export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) loadApplications(); }, [user]);

  const loadApplications = async () => {
    if (!user) return;
    try {
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
            try {
              resumeUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${app.resumeId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
            } catch {}
          }
          return { ...app, job, resumeUrl };
        })
      );
      setApplications(appsWithJobs);
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
    setLoading(false);
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Applications</h1>
      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
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
                  {app.coverLetter && <p className="text-gray-700 mt-3 line-clamp-2">{app.coverLetter}</p>}
                </div>
                <div className="text-right ml-4 flex flex-col items-end gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    app.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                    app.status === 'reviewing' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {app.status}
                  </span>
                  {app.resumeUrl && (
                    <a href={app.resumeUrl} target="_blank" className="flex items-center gap-1 text-sm text-primary-600 hover:underline">
                      View Resume <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {app.job?.recruiterId && (
                    <a href={`/messages?to=${app.job.recruiterId}&name=${encodeURIComponent(app.job.recruiterName || 'Recruiter')}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                      💬 Chat with Recruiter
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
