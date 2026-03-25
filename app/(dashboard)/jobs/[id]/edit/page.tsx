'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { databases } from '@/lib/appwrite';
import toast from 'react-hot-toast';
import { Briefcase, DollarSign, MapPin, Clock, FileText, Award, Gift, X, Plus } from 'lucide-react';

export default function EditJob() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', type: 'full-time',
    salaryMin: '', salaryMax: '', currency: 'USD', status: 'active',
    description: '', requirements: [''], benefits: [''], skills: ['']
  });

  useEffect(() => { loadJob(); }, [id]);

  const loadJob = async () => {
    try {
      const doc: any = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
        id as string
      );
      setFormData({
        title: doc.title, company: doc.company, location: doc.location,
        type: doc.type, salaryMin: doc.salaryMin, salaryMax: doc.salaryMax,
        currency: doc.currency, status: doc.status, description: doc.description,
        requirements: doc.requirements?.split('\n').filter((r: string) => r.trim()) || [''],
        benefits: doc.benefits?.split('\n').filter((b: string) => b.trim()) || [''],
        skills: doc.skills?.split(',').map((s: string) => s.trim()).filter((s: string) => s) || ['']
      });
    } catch { toast.error('Failed to load job'); }
    setFetching(false);
  };

  const addField = (field: 'requirements' | 'benefits' | 'skills') =>
    setFormData({ ...formData, [field]: [...formData[field], ''] });

  const removeField = (field: 'requirements' | 'benefits' | 'skills', index: number) =>
    setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });

  const updateField = (field: 'requirements' | 'benefits' | 'skills', index: number, value: string) => {
    const arr = [...formData[field]]; arr[index] = value;
    setFormData({ ...formData, [field]: arr });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
        id as string,
        {
          title: formData.title, company: formData.company, location: formData.location,
          type: formData.type, salaryMin: String(formData.salaryMin), salaryMax: String(formData.salaryMax),
          currency: formData.currency, status: formData.status, description: formData.description,
          requirements: formData.requirements.filter(r => r.trim()).join('\n'),
          benefits: formData.benefits.filter(b => b.trim()).join('\n'),
          skills: formData.skills.filter(s => s.trim()).join(','),
          updatedAt: new Date().toISOString()
        }
      );
      toast.success('Job updated successfully!');
      router.push(`/jobs/${id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update job');
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Edit Job</h1>
        <p className="text-gray-600">Update your job posting details</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <Briefcase className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-semibold">Job Details</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Job Title *</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Company Name *</label>
              <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2"><MapPin className="w-4 h-4 inline mr-1" />Location *</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2"><Clock className="w-4 h-4 inline mr-1" />Job Type *</label>
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="input">
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="input">
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-semibold">Compensation</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Min Salary</label>
              <input type="number" value={formData.salaryMin} onChange={(e) => setFormData({...formData, salaryMin: e.target.value})} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Salary</label>
              <input type="number" value={formData.salaryMax} onChange={(e) => setFormData({...formData, salaryMax: e.target.value})} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} className="input">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="NGN">NGN (₦)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold">Description</h2>
          </div>
          <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input" rows={6} required />
        </div>

        {(['requirements', 'benefits', 'skills'] as const).map((field) => (
          <div key={field} className="card">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b">
              <Award className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-semibold capitalize">{field}</h2>
            </div>
            <div className="space-y-3">
              {formData[field].map((val, index) => (
                <div key={index} className="flex gap-2">
                  <input type="text" value={val} onChange={(e) => updateField(field, index, e.target.value)} className="input flex-1" />
                  {formData[field].length > 1 && (
                    <button type="button" onClick={() => removeField(field, index)} className="btn bg-red-100 text-red-600 hover:bg-red-200 px-3">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addField(field)} className="btn btn-secondary flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add
              </button>
            </div>
          </div>
        ))}

        <div className="card bg-gray-50">
          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="btn btn-primary flex-1 py-4 text-lg font-semibold">
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
            <button type="button" onClick={() => router.back()} className="btn btn-secondary px-8 py-4">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
