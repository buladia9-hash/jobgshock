'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import Link from 'next/link';
import { Briefcase, MapPin, DollarSign, Building2, TrendingUp, Users, Clock, ArrowRight } from 'lucide-react';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadJobs(); }, [user, typeFilter]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const queries: any[] = [Query.orderDesc('createdAt')];
      if (user?.role === 'recruiter') {
        queries.push(Query.equal('recruiterId', user.$id));
      } else {
        queries.push(Query.equal('status', 'active'));
      }
      if (typeFilter) queries.push(Query.equal('type', typeFilter));
      const result = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
        queries
      );
      setJobs(result.documents.map((doc: any) => ({
        ...doc,
        salary: { min: Number(doc.salaryMin), max: Number(doc.salaryMax), currency: doc.currency },
        skills: doc.skills?.split(',').map((s: string) => s.trim()).filter((s: string) => s) || []
      })));
    } catch (error) { console.error('Failed to load jobs:', error); }
    setLoading(false);
  };

  const filteredJobs = jobs.filter(job => {
    const matchSearch = !search || job.title?.toLowerCase().includes(search.toLowerCase()) || job.company?.toLowerCase().includes(search.toLowerCase()) || job.location?.toLowerCase().includes(search.toLowerCase());
    const matchLocation = !locationFilter || job.location?.toLowerCase().includes(locationFilter.toLowerCase());
    return matchSearch && matchLocation;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{user?.role === 'recruiter' ? 'My Job Postings' : 'Discover Jobs'}</h1>
        <p className="text-gray-600 text-lg">Find your next opportunity from {jobs.length} active positions</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input type="text" placeholder="Search by title, company, or location..." value={search} onChange={(e) => setSearch(e.target.value)} className="input" />
          </div>
          <input type="text" placeholder="Filter by location..." value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="input md:w-48" />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input md:w-48">
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
          {user?.role === 'recruiter' && (
            <Link href="/jobs/create" className="btn btn-primary whitespace-nowrap">
              Post New Job
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-600 mt-4">Loading jobs...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <Link key={job.$id} href={`/jobs/${job.$id}`} className="group">
              <div className="bg-white rounded-xl border hover:border-primary-600 hover:shadow-lg transition-all p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    {job.type}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">{job.title}</h3>
                <p className="text-gray-600 font-medium mb-4">{job.company}</p>
                
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 flex-shrink-0" />
                    <span>{job.salary?.currency} {job.salary?.min?.toLocaleString()} - {job.salary?.max?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills?.slice(0, 3).map((skill: string) => (
                    <span key={skill} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {skill}
                    </span>
                  ))}
                  {job.skills?.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      +{job.skills.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="mt-auto pt-4 border-t flex items-center justify-between">
                  {user?.role === 'recruiter' ? (
                    <span className="text-sm text-gray-600">{job.applicationsCount} applicants</span>
                  ) : (
                    <span className="text-sm font-medium text-primary-600">View Details</span>
                  )}
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredJobs.length === 0 && (
        <div className="text-center py-20">
          <Briefcase className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-2xl font-bold mb-2">No jobs found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
          {user?.role === 'recruiter' && (
            <Link href="/jobs/create" className="btn btn-primary">
              Post Your First Job
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
