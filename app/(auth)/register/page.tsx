'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { createNotification } from '@/lib/notification-actions';
import toast from 'react-hot-toast';
import { Briefcase } from 'lucide-react';

function RegisterForm() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      await register(email, password, name, role);
      const newUser = useAuth.getState().user;

      if (newUser) await createNotification(
        newUser.$id,
        'welcome',
        'Welcome to JobPortal! 🎉',
        `Hi ${name}! Your account has been created successfully.`,
        '/dashboard'
      );

      toast.success(`🎉 Welcome aboard, ${name}!`, { duration: 5000 });
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
          <p className="text-xs text-gray-500 mt-2">Use a separate browser or incognito window if you need recruiter and job seeker accounts open at the same time.</p>
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pr-16"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-3 my-auto text-sm font-medium text-gray-500 hover:text-primary-600"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
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
