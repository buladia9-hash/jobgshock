'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { storageService } from '@/lib/services';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Briefcase, Globe } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', location: '', bio: '', company: '', website: '', skills: '', experience: '', education: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        company: user.company || '',
        website: user.website || '',
        skills: user.skills?.join(', ') || '',
        experience: user.experience || '',
        education: user.education || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        company: formData.company,
        website: formData.website,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        experience: formData.experience,
        education: formData.education
      });
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn btn-primary">Edit Profile</button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="card space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="input" />
            </div>
            {user.role === 'recruiter' && (
              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="input" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="input" rows={3} />
          </div>

          {user.role === 'employee' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Skills (comma separated)</label>
                <input type="text" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} className="input" placeholder="React, Node.js, Python" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Experience</label>
                <textarea value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="input" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Education</label>
                <textarea value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})} className="input" rows={2} />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <input type="url" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="input" />
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="card space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-gray-600">{user.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{user.location}</p>
                </div>
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium">{user.company}</p>
                </div>
              </div>
            )}
            {user.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Website</p>
                  <a href={user.website} target="_blank" className="font-medium text-primary-600 hover:underline">{user.website}</a>
                </div>
              </div>
            )}
          </div>

          {user.bio && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-gray-700">{user.bio}</p>
            </div>
          )}

          {user.role === 'employee' && (
            <>
              {user.skills && user.skills.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {user.experience && (
                <div>
                  <h3 className="font-semibold mb-2">Experience</h3>
                  <p className="text-gray-700 whitespace-pre-line">{user.experience}</p>
                </div>
              )}
              {user.education && (
                <div>
                  <h3 className="font-semibold mb-2">Education</h3>
                  <p className="text-gray-700 whitespace-pre-line">{user.education}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
