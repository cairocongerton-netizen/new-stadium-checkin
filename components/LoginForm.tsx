'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [now, setNow] = useState(new Date());

  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
    if (searchParams.get('registered') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePinChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
    setPin(digitsOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !pin) {
      setError('Please enter both email and PIN');
      return;
    }

    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem('user', JSON.stringify(data.user));
        router.push('/checkin');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className="text-4xl font-normal mb-4">Sign In</h1>

        {/* Date and Time */}
        <div className="flex justify-between items-center mb-8">
          <span className="text-lg">{format(now, 'MMM d, yyyy')}</span>
          <span className="text-lg">{format(now, 'h:mm a')}</span>
        </div>

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 px-4 py-3 mb-6">
            <p className="text-green-600 text-sm">Account created successfully! Please sign in.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address:
            </label>
            <input
              ref={emailInputRef}
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
              placeholder="email@example.com"
              autoComplete="email"
            />
          </div>

          {/* PIN */}
          <div>
            <label htmlFor="pin" className="block text-sm font-medium mb-2">
              4-digit PIN:
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              id="pin"
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              maxLength={4}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors text-center text-2xl tracking-widest"
              placeholder="&#9679; &#9679; &#9679; &#9679;"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white px-6 py-4 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="spinner mr-2"></div>
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Go Back */}
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/" className="hover:text-black">
            &larr; Go Back
          </Link>
        </p>
      </div>
    </div>
  );
}
