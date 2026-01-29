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
    <>
      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen bg-white px-6 py-20">
        <div className="max-w-sm w-full mx-auto">
          {/* Logo - centered */}
          <div className="flex justify-center mb-8">
            <svg width="90" height="36" viewBox="0 0 90 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="45" cy="18" rx="45" ry="18" fill="black"/>
              <text x="14" y="25" fill="white" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="600" fontStyle="italic">New</text>
              <circle cx="72" cy="24" r="2" fill="white"/>
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-normal leading-tight mb-3">
            New Stadium<br/>Check-In
          </h1>

          {/* Date and Time */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg">{format(now, 'MMM d, yyyy')}</span>
            <span className="text-lg">{format(now, 'h:mm a')}</span>
          </div>

          {/* Welcome text */}
          <p className="text-sm text-gray-700 mb-3">
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
              className="block w-full border border-black text-black px-6 py-4 text-center rounded-md"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="block w-full bg-black text-white px-6 py-4 text-center rounded-md"
            >
              Register for an Account
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen bg-gray-50 items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl md:text-5xl font-normal mb-4">
            New Stadium Check-In
          </h1>
          <p className="text-gray-600 mb-12">
            Welcome! Please register or sign in to check in.
          </p>

          <div className="space-y-4">
            <Link
              href="/register"
              className="block w-full bg-black text-white px-6 py-4 hover:bg-gray-800 transition-colors text-center"
            >
              Register New Account
            </Link>

            <Link
              href="/login"
              className="block w-full border-2 border-black text-black px-6 py-4 hover:bg-gray-100 transition-colors text-center"
            >
              Sign In
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            New users: Create an account with your email and a 4-digit PIN
          </p>
        </div>
      </div>
    </>
  );
}
