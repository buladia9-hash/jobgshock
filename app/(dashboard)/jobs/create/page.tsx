'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { jobService } from '@/lib/services';
import toast from 'react-hot-toast';

export default function CreateJob() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', type: 'full-time' as const,
    salaryMin: '', salaryMax: '', currency: 'USD',
    description: '', requirements: '', benefits: '', skills: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await jobService.createJob({
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        salary: { min: Number(formData.salaryMin), max: Number(formData.salaryMax), currency: formData.currency },
        description: formData.description,
        requirements: formData.requirements.split('\n').filter(r => r.trim()),
        benefits: formData.benefits.split('\n').filter(b => b.trim()),
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        recruiterId: user.$id,
        recruiterName: user.name,
        status: 'active'
      });
      toast.success('Job posted successfully!');
      router.push('/jobs');
    } catch (error: any) {
      toast.error(error.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Post a New Job</h1>
      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Job Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Company</label>
            <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="input" required />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Job Type</label>
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as any})} className="input" required>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Min Salary</label>
            <input type="number" value={formData.salaryMin} onChange={(e) => setFormData({...formData, salaryMin: e.target.value})} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Salary</label>
            <input type="number" value={formData.salaryMax} onChange={(e) => setFormData({...formData, salaryMax: e.target.value})} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} className="input">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input" rows={4} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Requirements (one per line)</label>
          <textarea value={formData.requirements} onChange={(e) => setFormData({...formData, requirements: e.target.value})} className="input" rows={4} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Benefits (one per line)</label>
          <textarea value={formData.benefits} onChange={(e) => setFormData({...formData, benefits: e.target.value})} className="input" rows={3} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Skills (comma separated)</label>
          <input type="text" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} className="input" placeholder="React, Node.js, TypeScript" required />
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn btn-primary flex-1">
            {loading ? 'Posting...' : 'Post Job'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
