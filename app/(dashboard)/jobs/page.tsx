'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { jobService } from '@/lib/services';
import { Job } from '@/types';
import Link from 'next/link';
import { MapPin, Briefcase, DollarSign, Clock, Search } from 'lucide-react';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, [user, typeFilter]);

  const loadJobs = async () => {
    setLoading(true);
    if (user?.role === 'recruiter') {
      const data = await jobService.getRecruiterJobs(user.$id);
      setJobs(data);
    } else {
      const data = await jobService.getJobs(typeFilter ? { type: typeFilter } : undefined);
      setJobs(data);
    }
    setLoading(false);
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.company.toLowerCase().includes(search.toLowerCase()) ||
    job.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{user?.role === 'recruiter' ? 'My Job Postings' : 'Browse Jobs'}</h1>
        {user?.role === 'recruiter' && (
          <Link href="/jobs/create" className="btn btn-primary">Post New Job</Link>
        )}
      </div>

      <div className="card mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search jobs, companies, locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input w-48">
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading jobs...</div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map(job => (
            <Link key={job.$id} href={`/jobs/${job.$id}`} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                  <p className="text-gray-600 mb-3">{job.company}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {job.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.skills.slice(0, 5).map(skill => (
                      <span key={skill} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    job.status === 'active' ? 'bg-green-100 text-green-800' :
                    job.status === 'closed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                  {user?.role === 'recruiter' && (
                    <p className="text-sm text-gray-600 mt-2">{job.applicationsCount} applications</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {filteredJobs.length === 0 && (
            <div className="text-center py-12 text-gray-500">No jobs found</div>
          )}
        </div>
      )}
    </div>
  );
}
