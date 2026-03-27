'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { databases, storage } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { applyToJob, deleteJob } from '@/lib/job-actions';
import { Job, Application } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { MapPin, Briefcase, DollarSign, Clock, CheckCircle, Trash2, Pencil, X, Users, MessageSquare, ChevronLeft, Gift, ToggleLeft, ToggleRight } from 'lucide-react';

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
  const [toggling, setToggling] = useState(false);

  useEffect(() => { loadJob(); }, [id]);

  const loadJob = async () => {
    try {
      const doc: any = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
        id as string
      );
      setJob({
        ...doc,
        salary: { min: Number(doc.salaryMin), max: Number(doc.salaryMax), currency: doc.currency },
        requirements: doc.requirements?.split('\n').filter((r: string) => r.trim()) || [],
        benefits: doc.benefits ? doc.benefits.split('\n').filter((b: string) => b.trim()) : [],
        skills: doc.skills?.split(',').map((s: string) => s.trim()).filter((s: string) => s) || []
      });
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
    } catch (error) { console.error('Failed to load job:', error); }
  };

  const handleApply = async () => {
    if (!user || user.role !== 'employee') {
      toast.error('Only job seeker accounts can apply to jobs');
      return;
    }
    if (!job || job.status !== 'active') {
      toast.error('This job is no longer accepting applications');
      return;
    }
    setLoading(true);
    try {
      let resumeId = '';
      if (resume) {
        const uploaded = await storage.createFile(process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!, ID.unique(), resume);
        resumeId = uploaded.$id;
      }
      await applyToJob(id as string, user.$id, user.name, user.email, resumeId, coverLetter);
      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
      router.push('/applications');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    } finally { setLoading(false); }
  };

  const handleStatusUpdate = async (appId: string, status: Application['status']) => {
    if (!isOwner) {
      toast.error('You are not allowed to update this application');
      return;
    }
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID!,
        appId, { status, updatedAt: new Date().toISOString() }
      );
      toast.success('Status updated');
      loadJob();
    } catch { toast.error('Failed to update status'); }
  };

  const handleToggleStatus = async () => {
    if (!job || !isOwner) {
      toast.error('You are not allowed to update this job');
      return;
    }
    setToggling(true);
    try {
      const newStatus = job.status === 'active' ? 'closed' : 'active';
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
        id as string, { status: newStatus }
      );
      setJob({ ...job, status: newStatus } as any);
      toast.success(`Job ${newStatus === 'active' ? 'reopened' : 'closed'} successfully`);
    } catch { toast.error('Failed to update job status'); }
    finally { setToggling(false); }
  };

  const handleDelete = async () => {
    if (!isOwner) {
      toast.error('You are not allowed to delete this job');
      return;
    }
    if (!confirm('Are you sure you want to delete this job? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteJob(id as string);
      toast.success('Job deleted successfully');
      router.push('/jobs');
    } catch { toast.error('Failed to delete job'); }
    finally { setDeleting(false); }
  };

  if (!job) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
    </div>
  );

  const isOwner = user?.role === 'recruiter' && job.recruiterId === user.$id;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-sm">
        <ChevronLeft className="w-4 h-4" /> Back to Jobs
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border shadow-sm p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{job.title}</h1>
              <p className="text-lg text-gray-600 font-medium">{job.company}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {job.status === 'active' ? '● Active' : '● Closed'}
                </span>
                <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium capitalize">{job.type}</span>
              </div>
            </div>
          </div>
          {user?.role === 'employee' && job.status === 'active' && (
            <button onClick={() => setShowApplyModal(true)} className="btn btn-primary px-8 py-3 text-base font-semibold">
              Apply Now
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 text-primary-600" />
            <span className="text-sm">{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm">{job.salary.currency} {job.salary.min.toLocaleString()} – {job.salary.max.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-sm">{job.applicationsCount || 0} applicants</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {job.skills.map(skill => (
            <span key={skill} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-100">{skill}</span>
          ))}
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary-600" /> Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600" /> Requirements</h2>
            <ul className="space-y-2">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
          {job.benefits.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Gift className="w-5 h-5 text-pink-600" /> Benefits</h2>
              <ul className="space-y-2">
                {job.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {isOwner && (
          <div className="mt-8 pt-6 border-t flex flex-wrap gap-3">
            <Link href={`/jobs/${id}/edit`} className="btn btn-primary flex items-center gap-2">
              <Pencil className="w-4 h-4" /> Edit Job
            </Link>
            <button onClick={handleToggleStatus} disabled={toggling} className={`btn flex items-center gap-2 ${job.status === 'active' ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'}`}>
              {job.status === 'active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {toggling ? 'Updating...' : job.status === 'active' ? 'Close Job' : 'Reopen Job'}
            </button>
            <button onClick={handleDelete} disabled={deleting} className="btn bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete Job'}
            </button>
          </div>
        )}
      </div>

      {/* Applications Section */}
      {isOwner && (
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Applications</h2>
            <span className="bg-primary-100 text-primary-700 text-sm font-semibold px-3 py-1 rounded-full">{applications.length} total</span>
          </div>
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No applications yet</p>
              </div>
            ) : applications.map(app => (
              <div key={app.$id} className="border border-gray-100 rounded-xl p-5 hover:border-primary-200 hover:shadow-sm transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {app.employeeName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{app.employeeName}</h3>
                      <p className="text-sm text-gray-500">{app.employeeEmail}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    app.status === 'shortlisted' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{app.status}</span>
                </div>
                {app.coverLetter && <p className="text-gray-600 text-sm mb-4 bg-gray-50 rounded-lg p-3 line-clamp-3">{app.coverLetter}</p>}
                <div className="flex flex-wrap gap-2">
                  {resumeUrls[app.$id] && (
                    <a href={resumeUrls[app.$id]} target="_blank" rel="noreferrer" className="btn btn-secondary text-xs py-1.5 px-3">📄 View Resume</a>
                  )}
                  <Link href={`/messages?to=${app.employeeId}&name=${encodeURIComponent(app.employeeName)}`} className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Chat
                  </Link>
                  {app.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatusUpdate(app.$id, 'shortlisted')} className="btn bg-blue-600 text-white hover:bg-blue-700 text-xs py-1.5 px-3">Shortlist</button>
                      <button onClick={() => handleStatusUpdate(app.$id, 'rejected')} className="btn bg-red-600 text-white hover:bg-red-700 text-xs py-1.5 px-3">Reject</button>
                    </>
                  )}
                  {app.status === 'shortlisted' && (
                    <button onClick={() => handleStatusUpdate(app.$id, 'accepted')} className="btn bg-green-600 text-white hover:bg-green-700 text-xs py-1.5 px-3">✓ Accept</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Apply for {job.title}</h2>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Letter</label>
                <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} className="input" rows={5} placeholder="Tell us why you're a great fit for this role..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Resume (PDF, DOC)</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files?.[0] || null)} className="input" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleApply} disabled={loading} className="btn btn-primary flex-1 py-3 font-semibold">
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
                <button onClick={() => setShowApplyModal(false)} className="btn btn-secondary px-6">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
