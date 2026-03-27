'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Briefcase, Globe, Pencil, CheckCircle, BookOpen, Star } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', location: '', bio: '', company: '', website: '', skills: '', experience: '', education: '', role: 'employee' as 'employee' | 'recruiter'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setFormData({
      name: user.name || '', phone: user.phone || '', location: user.location || '',
      bio: user.bio || '', company: user.company || '', website: user.website || '',
      skills: user.skills?.join(', ') || '', experience: user.experience || '', education: user.education || '',
      role: user.role || 'employee'
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        name: formData.name, phone: formData.phone, location: formData.location,
        bio: formData.bio, company: formData.company, website: formData.website,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        experience: formData.experience, education: formData.education, role: formData.role
      });
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally { setLoading(false); }
  };

  if (!user) return null;

  const profileFields = ['phone', 'location', 'bio', 'website', ...(user.role === 'employee' ? ['skills', 'experience', 'education'] : ['company'])];
  const filled = profileFields.filter(f => {
    const val = (user as any)[f];
    return val && (Array.isArray(val) ? val.length > 0 : String(val).trim() !== '');
  }).length;
  const completion = Math.round((filled / profileFields.length) * 100);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">{user.role === 'recruiter' ? 'Manage your company profile' : 'Manage your professional profile'}</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn btn-primary flex items-center gap-2">
            <Pencil className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>

      {/* Completion Bar */}
      {!editing && (
        <div className="bg-white rounded-2xl border shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-800">Profile Completion</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {completion === 100 ? '🎉 Your profile is complete!' : 'Complete your profile to stand out'}
              </p>
            </div>
            <span className={`text-2xl font-bold ${completion === 100 ? 'text-green-600' : completion >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
              {completion}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${completion === 100 ? 'bg-green-500' : completion >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border shadow-sm p-8 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 pb-4 border-b">Edit Profile</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type *</label>
              <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as 'employee' | 'recruiter'})} className="input">
                <option value="employee">Job Seeker</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input" placeholder="+1 234 567 8900" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="input" placeholder="City, Country" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
              <input type="url" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="input" placeholder="https://yourwebsite.com" />
            </div>
            {formData.role === 'recruiter' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="input" placeholder="Company name" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
            <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="input" rows={3} placeholder="Tell us about yourself..." />
          </div>
          {formData.role === 'employee' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Skills <span className="text-gray-400 font-normal">(comma separated)</span></label>
                <input type="text" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} className="input" placeholder="React, Node.js, Python, TypeScript" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Work Experience</label>
                <textarea value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="input" rows={4} placeholder="Describe your work experience..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Education</label>
                <textarea value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})} className="input" rows={3} placeholder="Your educational background..." />
              </div>
            </>
          )}
          <div className="flex gap-4 pt-2">
            <button type="submit" disabled={loading} className="btn btn-primary flex-1 py-3 font-semibold">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary px-8">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl border shadow-sm p-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-500 mt-1">{user.role === 'recruiter' ? '🏢 Recruiter' : '👤 Job Seeker'}</p>
                {user.location && <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{user.location}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InfoItem icon={<Mail className="w-4 h-4 text-primary-600" />} label="Email" value={user.email} />
              {user.phone && <InfoItem icon={<Phone className="w-4 h-4 text-green-600" />} label="Phone" value={user.phone} />}
              {user.company && <InfoItem icon={<Briefcase className="w-4 h-4 text-blue-600" />} label="Company" value={user.company} />}
              {user.website && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Globe className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Website</p>
                    <a href={user.website} target="_blank" className="text-sm font-medium text-primary-600 hover:underline truncate">{user.website}</a>
                  </div>
                </div>
              )}
            </div>

            {user.bio && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><User className="w-4 h-4 text-gray-500" /> About</h3>
                <p className="text-gray-700 leading-relaxed">{user.bio}</p>
              </div>
            )}
          </div>

          {/* Skills, Experience, Education for employees */}
          {user.role === 'employee' && (
            <>
              {user.skills && user.skills.length > 0 && (
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500" /> Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map(skill => (
                      <span key={skill} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-100">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {user.experience && (
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" /> Work Experience</h3>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{user.experience}</p>
                </div>
              )}
              {user.education && (
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-green-600" /> Education</h3>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{user.education}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
