'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Briefcase, Home, FileText, User, LogOut, PlusCircle, Bell } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Briefcase className="w-8 h-8 text-primary-600" />
                <span className="text-xl font-bold">JobPortal</span>
              </Link>
              <div className="flex gap-6">
                <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
                  <Home className="w-5 h-5" />
                  Dashboard
                </Link>
                <Link href="/jobs" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
                  <FileText className="w-5 h-5" />
                  {user.role === 'recruiter' ? 'My Jobs' : 'Browse Jobs'}
                </Link>
                <Link href="/applications" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
                  <FileText className="w-5 h-5" />
                  Applications
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user.role === 'recruiter' && (
                <Link href="/jobs/create" className="btn btn-primary flex items-center gap-2">
                  <PlusCircle className="w-5 h-5" />
                  Post Job
                </Link>
              )}
              <button className="relative p-2 text-gray-600 hover:text-primary-600">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/profile" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
                <User className="w-5 h-5" />
                {user.name}
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-gray-700 hover:text-red-600">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
