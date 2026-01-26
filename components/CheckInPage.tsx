'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@/types';

export default function CheckInPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const reasonInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Get user from sessionStorage
    const userJson = sessionStorage.getItem('user');
    if (!userJson) {
      // Not logged in - redirect to login
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userJson);
    setUser(userData);

    // Focus on reason input
    reasonInputRef.current?.focus();
  }, [router]);

  const handleSignOut = () => {
    sessionStorage.removeItem('user');
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!reason.trim() || reason.length < 10) {
      setError('Please enter a reason for your visit (at least 10 characters)');
      return;
    }

    if (reason.length > 500) {
      setError('Reason must be 500 characters or less');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user!.id,
          reason,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowSuccess(true);

        // Reset form and show success for 2 seconds
        setTimeout(() => {
          setReason('');
          setShowSuccess(false);
          reasonInputRef.current?.focus();
        }, 2000);
      } else {
        setError(data.error || 'Check-in failed');
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setError('Unable to connect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="animate-success text-center">
          <h1 className="text-4xl md:text-5xl mb-6">
            Thank you for checking in :)
          </h1>
          <div className="text-lg text-gray-600 space-y-2">
            <p><strong>{user.name}</strong></p>
            <p>{user.disciplines.join(', ')}</p>
            <p className="text-sm mt-4 italic">{reason}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-normal mb-1">
              Welcome, {user.name}!
            </h1>
            <p className="text-gray-600 text-sm">{user.email}</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/profile"
              className="text-sm text-gray-600 hover:text-black"
            >
              Edit Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-black"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-2">
            Your Disciplines
          </h2>
          <p className="text-gray-900">{user.disciplines.join(', ')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reason for Visit */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium mb-2">
              Reason for Visit
            </label>
            <textarea
              ref={reasonInputRef}
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors resize-none"
              placeholder="Please describe the purpose of your visit today..."
            />
            <div className="flex justify-between items-center mt-1">
              <p className={`text-sm ${
                reason.length < 10 ? 'text-gray-400' : reason.length > 500 ? 'text-red-500' : 'text-gray-600'
              }`}>
                {reason.length}/500
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white px-6 py-4 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                <span>Checking In...</span>
              </>
            ) : (
              <span>Check In</span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Press Enter to submit • Tab to navigate
        </p>
      </div>
    </div>
  );
}
