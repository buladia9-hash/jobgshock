'use client';
import { useState } from 'react';
import Link from 'next/link';
import { account } from '@/lib/appwrite';
import toast from 'react-hot-toast';
import { Briefcase, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );
      setSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
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
          <h2 className="text-3xl font-bold">Forgot Password?</h2>
          <p className="text-gray-600 mt-2">
            {sent ? 'Check your email' : 'Enter your email to reset your password'}
          </p>
        </div>

        {sent ? (
          <div className="card text-center">
            <p className="text-gray-700 mb-6">
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your inbox and follow the instructions.
            </p>
            <Link href="/login" className="btn btn-primary w-full">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="input" 
                placeholder="your@email.com"
                required 
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full mb-4">
              {loading ? 'Sending...' : 'Send Reset Link'}
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
