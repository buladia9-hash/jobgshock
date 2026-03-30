'use client';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { account } from '@/lib/appwrite';
import toast from 'react-hot-toast';
import { ArrowLeft, Briefcase } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const userId = useMemo(() => searchParams.get('userId') || '', [searchParams]);
  const secret = useMemo(() => searchParams.get('secret') || '', [searchParams]);
  const hasRecoveryParams = Boolean(userId && secret);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasRecoveryParams) {
      toast.error('Invalid or expired reset link');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await account.updateRecovery(userId, secret, password);
      setCompleted(true);
      toast.success('Password updated successfully');
      setTimeout(() => router.push('/login'), 1200);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Briefcase className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold">Reset Password</h2>
          <p className="text-gray-600 mt-2">
            {completed ? 'Your password has been updated.' : 'Create a new password for your account.'}
          </p>
        </div>

        {!hasRecoveryParams ? (
          <div className="card text-center">
            <p className="text-gray-700 mb-6">
              This password reset link is invalid or has expired. Please request a new reset email.
            </p>
            <Link href="/forgot-password" className="btn btn-primary w-full mb-4">
              Request New Link
            </Link>
            <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-primary-600">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        ) : completed ? (
          <div className="card text-center">
            <p className="text-gray-700 mb-6">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Link href="/login" className="btn btn-primary w-full">
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                minLength={8}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                minLength={8}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full mb-4">
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
            <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-primary-600">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
