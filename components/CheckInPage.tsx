'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const userJson = sessionStorage.getItem('user');
    if (!userJson) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userJson));
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

        // Show success for 3 seconds, then transition to post-check-in state
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Success screen - full black
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <h1 className="text-4xl text-white font-normal text-center leading-tight">
          Thanks for<br/>Checking In :)
        </h1>
      </div>
    );
  }

  const displayName = user.preferred_name || user.name.split(' ')[0];

  return (
    <div className="min-h-screen bg-white px-6 pt-24">
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
  );
}
