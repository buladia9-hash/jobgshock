'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  TrendingUp,
  Search,
  MapPin,
  Building2,
  Clock,
  ArrowRight,
  DollarSign,
  Mail,
  Phone,
} from 'lucide-react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';

const trustStats = [
  { value: '10k+', label: 'candidate profiles reviewed by employers' },
  { value: '2k+', label: 'active openings across growing businesses' },
  { value: '48h', label: 'average time to first applicant activity' },
];

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [latestJobs, setLatestJobs] = useState<any[]>([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    loadLatestJobs();
  }, []);

  const loadLatestJobs = async () => {
    try {
      const result = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_JOBS_COLLECTION_ID!,
        [Query.equal('status', 'active'), Query.orderDesc('createdAt'), Query.limit(5)]
      );
      setLatestJobs(result.documents);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const handleSearch = () => {
    router.push(`/jobs?search=${searchQuery}&location=${location}`);
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              JobPortal
            </span>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="btn btn-secondary">Sign In</Link>
            <Link href="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-primary-50 backdrop-blur-sm mb-6">
              Professional hiring tools for employers and career-focused talent
            </p>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Hire with confidence.
              <br />
              Advance your career with clarity.
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto leading-8">
              JobPortal creates a more structured environment for employers to attract qualified candidates
              and for professionals to discover credible opportunities.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-2xl p-3 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900"
                  />
                </div>
                <div className="md:w-64 relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900"
                  />
                </div>
                <button onClick={handleSearch} className="btn bg-primary-600 text-white hover:bg-primary-700 px-8 py-4 whitespace-nowrap font-semibold rounded-xl">
                  Search Jobs
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-sm text-gray-600">Popular searches:</span>
                <button onClick={() => { setSearchQuery('Developer'); handleSearch(); }} className="text-sm px-3 py-1 bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100">Developer</button>
                <button onClick={() => { setSearchQuery('Designer'); handleSearch(); }} className="text-sm px-3 py-1 bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100">Designer</button>
                <button onClick={() => { setSearchQuery('Manager'); handleSearch(); }} className="text-sm px-3 py-1 bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100">Manager</button>
                <button onClick={() => { setSearchQuery('Marketing'); handleSearch(); }} className="text-sm px-3 py-1 bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100">Marketing</button>
                <button onClick={() => { setSearchQuery('Sales'); handleSearch(); }} className="text-sm px-3 py-1 bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100">Sales</button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register?role=employee" className="btn bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Candidate Access
            </Link>
            <Link href="/register?role=recruiter" className="btn bg-primary-800 hover:bg-primary-900 px-6 py-3 font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Employer Access
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-12">
            {trustStats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 px-6 py-5 text-left backdrop-blur-sm">
                <p className="text-3xl font-bold text-white">{item.value}</p>
                <p className="text-sm text-primary-100 mt-2 leading-6">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-2">Available Jobs</h2>
              <p className="text-xl text-gray-600">Current openings from active employers on the platform</p>
            </div>
            <Link href="/jobs" className="btn btn-primary">View All Jobs</Link>
          </div>
          <div className="grid gap-6">
            {latestJobs.map((job) => (
              <Link key={job.$id} href={`/jobs/${job.$id}`} className="card hover:shadow-lg transition-shadow border-l-4 border-primary-600">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-2">{job.title}</h3>
                    <p className="text-lg text-gray-600 mb-4">{job.company}</p>
                    <div className="flex flex-wrap gap-4 text-gray-600">
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
                        {job.currency} {job.salaryMin?.toLocaleString()} - {job.salaryMax?.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-primary-600" />
                </div>
              </Link>
            ))}
            {latestJobs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl">No jobs available yet</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">A more professional hiring experience</h2>
            <p className="text-xl text-gray-600">Built to support stronger candidate discovery, cleaner workflows, and better hiring decisions</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Focused discovery</h3>
              <p className="text-gray-600">Candidates can move from search to application with less friction and clearer intent.</p>
            </div>
            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Structured evaluation</h3>
              <p className="text-gray-600">Recruiters get a cleaner way to review applicants, manage responses, and stay organized.</p>
            </div>
            <div className="card text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Operational momentum</h3>
              <p className="text-gray-600">Every part of the workflow is designed to reduce delays and improve follow-through.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop"
              alt="Person working on laptop searching for jobs"
              className="w-full h-96 object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">For professionals seeking the right next move</h2>
              <p className="text-xl text-gray-600 mb-8">Present your experience clearly, apply efficiently, and stay informed throughout the hiring process.</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ArrowRight className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Clear application flow</h4>
                    <p className="text-gray-600">Move from discovery to application with a more direct and structured process.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ArrowRight className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Status transparency</h4>
                    <p className="text-gray-600">Monitor progress and stay aligned with employer activity after you apply.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ArrowRight className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Professional presentation</h4>
                    <p className="text-gray-600">Showcase your profile, experience, and resume in a more credible format.</p>
                  </div>
                </li>
              </ul>
              <Link href="/register?role=employee" className="btn btn-primary px-8 py-3 font-semibold">Create Candidate Account</Link>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop"
                  alt="Job seeker"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-2xl font-bold mb-2">Reliable visibility</h3>
                <p className="text-gray-600">Designed for serious job search activity</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-3xl p-12 text-center order-2 md:order-1">
              <Building2 className="w-24 h-24 text-secondary-600 mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-4">Employer-ready workflow</h3>
              <p className="text-xl text-gray-600">Built for teams hiring with structure, speed, and accountability</p>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-4xl font-bold mb-6">For employers building stronger teams</h2>
              <p className="text-xl text-gray-600 mb-8">Publish roles, review applicants, and manage communication through a cleaner hiring workflow.</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Faster publishing</h4>
                    <p className="text-gray-600">Launch openings quickly and keep active roles visible to qualified talent.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Organized review process</h4>
                    <p className="text-gray-600">Track applications, shortlist strong candidates, and maintain clearer decision records.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Practical oversight</h4>
                    <p className="text-gray-600">Monitor hiring activity and keep the process moving without unnecessary friction.</p>
                  </div>
                </li>
              </ul>
              <Link href="/register?role=recruiter" className="btn btn-primary px-8 py-3 font-semibold">Create Employer Account</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-950 text-white">
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">JobPortal</span>
              </div>
              <p className="text-gray-300 max-w-md leading-7 mb-6">
                JobPortal provides a structured environment for employers and candidates to connect, evaluate opportunities,
                and move hiring decisions forward with confidence.
              </p>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary-400" />
                  <a href="mailto:support@jobportal.com" className="hover:text-white transition-colors">
                    support@jobportal.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary-400" />
                  <a href="tel:08051243425" className="hover:text-white transition-colors">
                    08051243425
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <span>Lagos, Nigeria</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 mb-4">Platform</h3>
              <div className="space-y-3">
                <Link href="/jobs" className="block text-gray-300 hover:text-white transition-colors">Browse Jobs</Link>
                <Link href="/login" className="block text-gray-300 hover:text-white transition-colors">Sign In</Link>
                <Link href="/register" className="block text-gray-300 hover:text-white transition-colors">Create Account</Link>
                <Link href="/dashboard" className="block text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 mb-4">Solutions</h3>
              <div className="space-y-3">
                <Link href="/register?role=employee" className="block text-gray-300 hover:text-white transition-colors">Job Seekers</Link>
                <Link href="/register?role=recruiter" className="block text-gray-300 hover:text-white transition-colors">Recruiters</Link>
                <Link href="/applications" className="block text-gray-300 hover:text-white transition-colors">Applications</Link>
                <Link href="/messages" className="block text-gray-300 hover:text-white transition-colors">Messages</Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 mb-4">Company</h3>
              <div className="space-y-3">
                <Link href="/about" className="block text-gray-300 hover:text-white transition-colors">About Us</Link>
                <Link href="/privacy" className="block text-gray-300 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="block text-gray-300 hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors">Contact Support</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-sm text-gray-400">
          <p>Copyright {currentYear} JobPortal. All rights reserved.</p>
          <p>Professional hiring tools for employers and career-focused talent.</p>
        </div>
      </footer>
    </div>
  );
}
