'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { account, databases } from '@/lib/appwrite';
import { createNotification } from '@/lib/notification-actions';
import { ID, Query } from 'appwrite';
import toast from 'react-hot-toast';
import { Briefcase } from 'lucide-react';

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'employee' | 'recruiter'>('employee');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'recruiter' || roleParam === 'employee') setRole(roleParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        ID.unique(),
        { email, name, role, skills: '', createdAt: new Date() }
      );
      
      const userDoc = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        [Query.equal('email', email)]
      );
      
      if (userDoc.documents[0]) {
        await createNotification(
          userDoc.documents[0].$id,
          'welcome',
          'Welcome to JobPortal! 🎉',
          `Hi ${name}! Your account has been created successfully. Start exploring jobs or post your first job listing.`,
          '/dashboard'
        );
      }
      
      toast.success(
        `🎉 Welcome aboard, ${name}! Your account has been created successfully. Let's find your dream job!`,
        { duration: 5000 }
      );
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Briefcase className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="text-gray-600 mt-2">Join our platform today</p>
        </div>

        <form onSubmit={handleSubmit} className="card">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" minLength={8} required />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">I am a</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input type="radio" value="employee" checked={role === 'employee'} onChange={(e) => setRole('employee')} className="mr-2" />
                Job Seeker
              </label>
              <label className="flex items-center">
                <input type="radio" value="recruiter" checked={role === 'recruiter'} onChange={(e) => setRole('recruiter')} className="mr-2" />
                Recruiter
              </label>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
          <p className="text-center mt-4 text-sm text-gray-600">
            Already have an account? <Link href="/login" className="text-primary-600 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
