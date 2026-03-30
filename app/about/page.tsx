import Link from 'next/link';
import { Briefcase, Users, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border shadow-sm p-8 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 mb-4">About JobPortal</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Built to make hiring simpler and job search faster.</h1>
          <p className="text-lg text-gray-600 leading-8 mb-10">
            JobPortal connects recruiters with qualified candidates and gives job seekers a cleaner, more direct way to find real opportunities.
            We focus on practical hiring tools, clear communication, and a smoother application experience.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="rounded-2xl bg-primary-50 p-6">
              <Briefcase className="w-8 h-8 text-primary-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Better Job Discovery</h2>
              <p className="text-gray-600">Search and apply to roles without fighting cluttered workflows.</p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-6">
              <Users className="w-8 h-8 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Smarter Hiring</h2>
              <p className="text-gray-600">Recruiters can post jobs, review applicants, and move faster.</p>
            </div>
            <div className="rounded-2xl bg-green-50 p-6">
              <TrendingUp className="w-8 h-8 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Real Momentum</h2>
              <p className="text-gray-600">We help both sides spend less time waiting and more time progressing.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="/register?role=employee" className="btn btn-primary">Join as Job Seeker</Link>
            <Link href="/register?role=recruiter" className="btn btn-secondary">Join as Recruiter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
