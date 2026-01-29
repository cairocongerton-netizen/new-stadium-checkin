'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import type { User } from '@/types';

export default function CheckInPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);

  const reasonInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const userJson = sessionStorage.getItem('user');
    if (!userJson) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userJson));
    reasonInputRef.current?.focus();
  }, [router]);

  const handleSignOut = () => {
    sessionStorage.removeItem('user');
    router.push('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
        const now = new Date();
        setCheckInTime(now);
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          setCheckedIn(true);
          setReason('');
        }, 3000);
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

  // Success screen - full black (same for mobile and desktop)
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <h1 className="text-4xl md:text-5xl text-white font-normal text-center leading-tight">
          Thanks for<br/>Checking In :)
        </h1>
      </div>
    );
  }

  const displayName = user.preferred_name || user.name.split(' ')[0];

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen bg-white px-6 py-16">
        <div className="max-w-sm w-full mx-auto">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="32" rx="4" fill="black"/>
              <text x="10" y="23" fill="white" fontFamily="Apfel Grotezk, sans-serif" fontSize="18" fontWeight="bold">New.</text>
            </svg>
          </div>

          {/* Welcome heading */}
          <h1 className="text-4xl font-normal leading-tight mb-2">
            Welcome<br/>{displayName}!
          </h1>

          {/* Email and Edit Profile */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Link href="/profile" className="text-sm underline">
              Edit Profile
            </Link>
          </div>

          {/* Disciplines */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-1">My Disciplines:</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {user.disciplines.map((d) => (
                <span key={d} className="text-sm text-gray-600">{d}</span>
              ))}
            </div>
          </div>

          {/* Check-in form or post-check-in state */}
          {!checkedIn ? (
            <>
              <h2 className="text-2xl font-normal mb-4">
                Checking In on {format(new Date(), 'MMM d')} @{' '}
                {format(new Date(), 'h:mma')}
              </h2>

              <form onSubmit={handleSubmit}>
                <label className="block text-sm mb-2">
                  What brings you in to New Stadium today?
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors mb-4"
                  placeholder="I'm working on my..."
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 px-4 py-3 mb-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white px-6 py-4 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner mr-2"></div>
                      <span>Checking In...</span>
                    </>
                  ) : (
                    <span>Check-In</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-normal mb-6">
                You&apos;ve last been checked in on{' '}
                {checkInTime ? format(checkInTime, 'MMM d') : ''} @{' '}
                {checkInTime ? format(checkInTime, 'h:mma') : ''}
              </h2>

              <button
                onClick={handleSignOut}
                className="w-full bg-black text-white px-6 py-4 transition-colors"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen bg-gray-50 py-8 px-4 items-center justify-center">
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

          {!checkedIn ? (
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {error && (
                <div className="bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

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
          ) : (
            <div className="text-center py-8">
              <h2 className="text-2xl font-normal mb-4">
                You&apos;ve been checked in!
              </h2>
              <p className="text-gray-600 mb-6">
                Last check-in: {checkInTime ? format(checkInTime, 'MMM d @ h:mma') : ''}
              </p>
              <button
                onClick={handleSignOut}
                className="bg-black text-white px-8 py-4 hover:bg-gray-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Press Enter to submit • Tab to navigate
          </p>
        </div>
      </div>
    </>
  );
}
