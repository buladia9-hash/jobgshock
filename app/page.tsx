'use client';
import Link from 'next/link';
import { Briefcase, Users, TrendingUp, Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">JobPortal</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="btn btn-secondary">Login</Link>
            <Link href="/register" className="btn btn-primary">Sign Up</Link>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-6">Find Your Dream Job Today</h1>
            <p className="text-xl mb-8 text-primary-100">Connect with top companies and talented professionals</p>
          </div>
          
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex gap-4">
                <input type="text" placeholder="Job title, keywords, or company" className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900" />
                <input type="text" placeholder="Location" className="w-64 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 outline-none text-gray-900" />
                <button className="btn bg-primary-600 text-white hover:bg-primary-700 px-8 whitespace-nowrap">Search Jobs</button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/register?role=employee" className="btn bg-white text-primary-600 hover:bg-gray-100">I'm Looking for a Job</Link>
            <Link href="/register?role=recruiter" className="btn bg-primary-700 hover:bg-primary-800">I'm Hiring</Link>
            <Link href="/register" className="btn bg-secondary-600 text-white hover:bg-secondary-700">Get Started</Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose JobPortal?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <Search className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Job Search</h3>
              <p className="text-gray-600">Advanced filters to find the perfect match</p>
            </div>
            <div className="card text-center">
              <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Top Talent</h3>
              <p className="text-gray-600">Connect with qualified professionals</p>
            </div>
            <div className="card text-center">
              <TrendingUp className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Career Growth</h3>
              <p className="text-gray-600">Opportunities for advancement</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
