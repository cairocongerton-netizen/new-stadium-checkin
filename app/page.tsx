'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function Home() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white px-6 pt-24">
      <div className="max-w-sm w-full mx-auto">
        {/* Logo */}
        <div className="mb-6">
          <svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="32" rx="4" fill="black"/>
            <text x="10" y="23" fill="white" fontFamily="Apfel Grotezk, sans-serif" fontSize="18" fontWeight="bold">New.</text>
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-normal leading-tight mb-4">
          New Stadium<br/>Check-In
        </h1>

        {/* Date and Time */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg">{format(now, 'MMM d, yyyy')}</span>
          <span className="text-lg">{format(now, 'h:mm a')}</span>
        </div>

        {/* Welcome text */}
        <p className="text-sm text-gray-700 mb-4">
          Welcome to New Stadium! Please register or sign in to check in.
        </p>

        <p className="text-sm text-gray-700 mb-8">
          If you have any questions regarding stadium, come find us at the front desk or email{' '}
          <a href="mailto:cairo@newsystems.ca" className="underline">cairo@newsystems.ca</a>.
        </p>

        {/* Buttons */}
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full border border-black text-black px-6 py-4 text-center"
          >
            Sign In
          </Link>

          <Link
            href="/register"
            className="block w-full bg-black text-white px-6 py-4 text-center"
          >
            Register for an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
