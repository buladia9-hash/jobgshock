'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';
import toast from 'react-hot-toast';
import { Briefcase, DollarSign, MapPin, Clock, FileText, Award, Gift, X, Plus } from 'lucide-react';

export default function CreateJob() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', type: 'full-time' as const,
    salaryMin: '', salaryMax: '', currency: 'USD',
    description: '', requirements: [''], benefits: [''], skills: ['']
  });
  const [loading, setLoading] = useState(false);

  const addField = (field: 'requirements' | 'benefits' | 'skills') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeField = (field: 'requirements' | 'benefits' | 'skills', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const updateField = (field: 'requirements' | 'benefits' | 'skills', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        salaryMin: Number(formData.salaryMin),
        salaryMax: Number(formData.salaryMax),
        currency: formData.currency,
        description: formData.description,
        requirements: formData.requirements.filter(r => r.trim()).join('\n'),
        benefits: formData.benefits.filter(b => b.trim()).join('\n'),
        skills: formData.skills.filter(s => s.trim()).join(','),
        recruiterId: user.$id,
        recruiterName: user.name,
        status: 'active',
        applicationsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
        ID.unique(),
        jobData
      );
      
      toast.success('Job posted successfully! 🎉');
      router.push('/jobs');
    } catch (error: any) {
      toast.error(error.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Post a New Job</h1>
        <p className="text-gray-600">Fill in the details to attract the best candidates</p>
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
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                className="input" 
                placeholder="e.g. Senior Software Engineer"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Company Name *</label>
              <input 
                type="text" 
                value={formData.company} 
                onChange={(e) => setFormData({...formData, company: e.target.value})} 
                className="input" 
                placeholder="e.g. Tech Corp"
                required 
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location *
              </label>
              <input 
                type="text" 
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
                className="input" 
                placeholder="e.g. New York, NY or Remote"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Job Type *
              </label>
              <select 
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value as any})} 
                className="input" 
                required
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
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
              <label className="block text-sm font-medium mb-2">Minimum Salary *</label>
              <input 
                type="number" 
                value={formData.salaryMin} 
                onChange={(e) => setFormData({...formData, salaryMin: e.target.value})} 
                className="input" 
                placeholder="50000"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Maximum Salary *</label>
              <input 
                type="number" 
                value={formData.salaryMax} 
                onChange={(e) => setFormData({...formData, salaryMax: e.target.value})} 
                className="input" 
                placeholder="80000"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Currency *</label>
              <select 
                value={formData.currency} 
                onChange={(e) => setFormData({...formData, currency: e.target.value})} 
                className="input"
              >
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
            <h2 className="text-2xl font-semibold">Job Description</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="input" 
              rows={6} 
              placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
              required 
            />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <Award className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-semibold">Requirements</h2>
          </div>
          
          <div className="space-y-3">
            {formData.requirements.map((req, index) => (
              <div key={index} className="flex gap-2">
                <input 
                  type="text" 
                  value={req} 
                  onChange={(e) => updateField('requirements', index, e.target.value)} 
                  className="input flex-1" 
                  placeholder="e.g. 5+ years of experience in React"
                  required
                />
                {formData.requirements.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeField('requirements', index)} 
                    className="btn bg-red-100 text-red-600 hover:bg-red-200 px-3"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => addField('requirements')} 
              className="btn btn-secondary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Requirement
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <Gift className="w-6 h-6 text-pink-600" />
            <h2 className="text-2xl font-semibold">Benefits</h2>
          </div>
          
          <div className="space-y-3">
            {formData.benefits.map((benefit, index) => (
              <div key={index} className="flex gap-2">
                <input 
                  type="text" 
                  value={benefit} 
                  onChange={(e) => updateField('benefits', index, e.target.value)} 
                  className="input flex-1" 
                  placeholder="e.g. Health insurance, 401k matching"
                />
                {formData.benefits.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeField('benefits', index)} 
                    className="btn bg-red-100 text-red-600 hover:bg-red-200 px-3"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => addField('benefits')} 
              className="btn btn-secondary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Benefit
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <Award className="w-6 h-6 text-orange-600" />
            <h2 className="text-2xl font-semibold">Required Skills</h2>
          </div>
          
          <div className="space-y-3">
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex gap-2">
                <input 
                  type="text" 
                  value={skill} 
                  onChange={(e) => updateField('skills', index, e.target.value)} 
                  className="input flex-1" 
                  placeholder="e.g. React, Node.js, TypeScript"
                  required
                />
                {formData.skills.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeField('skills', index)} 
                    className="btn bg-red-100 text-red-600 hover:bg-red-200 px-3"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => addField('skills')} 
              className="btn btn-secondary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Skill
            </button>
          </div>
        </div>

        <div className="card bg-gray-50">
          <div className="flex gap-4">
            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-primary flex-1 py-4 text-lg font-semibold"
            >
              {loading ? 'Posting Job...' : '🚀 Post Job'}
            </button>
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="btn btn-secondary px-8 py-4"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
