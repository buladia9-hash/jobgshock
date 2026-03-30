import Link from 'next/link';
import { Briefcase, Users, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border shadow-sm p-8 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 mb-4">About JobPortal</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">A professional platform for employers and candidates.</h1>
          <p className="text-lg text-gray-600 leading-8 mb-10">
            JobPortal is designed to support structured recruitment, clearer candidate evaluation, and a more reliable job search
            experience. Our focus is on practical hiring workflows, credible opportunity discovery, and professional communication
            across every stage of the process.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="rounded-2xl bg-primary-50 p-6">
              <Briefcase className="w-8 h-8 text-primary-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Professional opportunity access</h2>
              <p className="text-gray-600">Candidates can focus on meaningful openings through a cleaner application experience.</p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-6">
              <Users className="w-8 h-8 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Structured hiring workflow</h2>
              <p className="text-gray-600">Employers can post roles, review applicants, and manage decisions with better clarity.</p>
            </div>
            <div className="rounded-2xl bg-green-50 p-6">
              <TrendingUp className="w-8 h-8 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Faster forward progress</h2>
              <p className="text-gray-600">We help both sides reduce delays and keep hiring conversations moving productively.</p>
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
