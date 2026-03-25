'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { databases, storage } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { applyToJob, deleteJob } from '@/lib/job-actions';
import { Job, Application } from '@/types';
import toast from 'react-hot-toast';
import { MapPin, Briefcase, DollarSign, Clock, CheckCircle, Trash2 } from 'lucide-react';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [resumeUrls, setResumeUrls] = useState<Record<string, string>>({});
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const doc: any = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
        id as string
      );
      const data = {
        ...doc,
        salary: { min: Number(doc.salaryMin), max: Number(doc.salaryMax), currency: doc.currency },
        requirements: doc.requirements?.split('\n').filter((r: string) => r.trim()) || [],
        benefits: doc.benefits ? doc.benefits.split('\n').filter((b: string) => b.trim()) : [],
        skills: doc.skills?.split(',').map((s: string) => s.trim()).filter((s: string) => s) || []
      };
      setJob(data);
      if (user?.role === 'recruiter' && doc.recruiterId === user.$id) {
        const appsResult = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
          [Query.equal('jobId', id as string)]
        );
        const apps = appsResult.documents as unknown as Application[];
        setApplications(apps);
        const urls: Record<string, string> = {};
        for (const app of apps) {
          if (app.resumeId) {
            urls[app.$id] = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${app.resumeId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
          }
        }
        setResumeUrls(urls);
      }
    } catch (error) {
      console.error('Failed to load job:', error);
    }
  };

  const handleApply = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let resumeId = '';
      if (resume) {
        const uploaded = await storage.createFile(
          process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!,
          ID.unique(),
          resume
        );
        resumeId = uploaded.$id;
      }
      await applyToJob(id as string, user.$id, user.name, user.email, resumeId, coverLetter);
      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
      router.push('/applications');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId: string, status: Application['status']) => {
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
        appId,
        { status, updatedAt: new Date().toISOString() }
      );
      toast.success('Application status updated');
      loadJob();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteJob(id as string);
      toast.success('Job deleted successfully');
      router.push('/jobs');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  if (!job) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <div className="card mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <p className="text-xl text-gray-600">{job.company}</p>
          </div>
          {user?.role === 'employee' && job.status === 'active' && (
            <button onClick={() => setShowApplyModal(true)} className="btn btn-primary">Apply Now</button>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
          <span className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {job.location}
          </span>
          <span className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            {job.type}
          </span>
          <span className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {job.skills.map(skill => (
            <span key={skill} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Requirements</h2>
            <ul className="space-y-2">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {job.benefits.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Benefits</h2>
              <ul className="space-y-2">
                {job.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {user?.role === 'recruiter' && job.recruiterId === user.$id && (
          <div className="mt-8 pt-6 border-t">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete Job'}
            </button>
          </div>
        )}
      </div>

      {user?.role === 'recruiter' && job.recruiterId === user.$id && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Applications ({applications.length})</h2>
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.$id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{app.employeeName}</h3>
                    <p className="text-gray-600">{app.employeeEmail}</p>
                    <p className="text-sm text-gray-500 mt-1">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    app.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>{app.status}</span>
                </div>
                <p className="text-gray-700 mb-3">{app.coverLetter}</p>
                <div className="flex gap-2">
                  {resumeUrls[app.$id] && (
                    <a href={resumeUrls[app.$id]} target="_blank" rel="noreferrer" className="btn btn-secondary text-sm">View Resume</a>
                  )}
                  {app.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatusUpdate(app.$id, 'shortlisted')} className="btn bg-blue-600 text-white hover:bg-blue-700 text-sm">Shortlist</button>
                      <button onClick={() => handleStatusUpdate(app.$id, 'rejected')} className="btn bg-red-600 text-white hover:bg-red-700 text-sm">Reject</button>
                    </>
                  )}
                  {app.status === 'shortlisted' && (
                    <button onClick={() => handleStatusUpdate(app.$id, 'accepted')} className="btn bg-green-600 text-white hover:bg-green-700 text-sm">Accept</button>
                  )}
                </div>
              </div>
            ))}
            {applications.length === 0 && (
              <p className="text-center text-gray-500 py-8">No applications yet</p>
            )}
          </div>
        </div>
      )}

      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Apply for {job.title}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cover Letter</label>
                <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} className="input" rows={4} placeholder="Tell us why you're a great fit..." required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Resume (PDF)</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files?.[0] || null)} className="input" />
              </div>
              <div className="flex gap-4">
                <button onClick={handleApply} disabled={loading} className="btn btn-primary flex-1">
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
                <button onClick={() => setShowApplyModal(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
