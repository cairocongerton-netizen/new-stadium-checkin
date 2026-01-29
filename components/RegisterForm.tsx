'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Discipline } from '@/types';

const DISCIPLINES: Discipline[] = [
  'Software',
  'Hardware',
  'Art',
  'Design',
  'Fashion',
  'AI/ML',
  'Photographer/Videographer',
  'Other',
];

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [selectedDisciplines, setSelectedDisciplines] = useState<Discipline[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleDisciplineToggle = (discipline: Discipline) => {
    setSelectedDisciplines((prev) =>
      prev.includes(discipline)
        ? prev.filter((d) => d !== discipline)
        : [...prev, discipline]
    );
  };

  const handlePinChange = (value: string, setter: (v: string) => void) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
    setter(digitsOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !name.trim() || !workplace.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (selectedDisciplines.length === 0) {
      setError('Please select at least one discipline');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          preferred_name: preferredName,
          workplace,
          pin,
          disciplines: selectedDisciplines,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push('/login?registered=true');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Unable to connect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen bg-white px-6 py-16">
        <div className="max-w-sm w-full mx-auto">
          {/* Logo */}
          <div className="mb-6">
            <svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="32" rx="4" fill="black"/>
              <text x="10" y="23" fill="white" fontFamily="Apfel Grotezk, sans-serif" fontSize="18" fontWeight="bold">New.</text>
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-normal leading-tight mb-2">
            Create<br/>Account
          </h1>
          <p className="text-sm text-gray-700 mb-6">
            Register with your email and create a 4-digit PIN
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email-mobile" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                ref={emailInputRef}
                type="email"
                id="email-mobile"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="email@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="name-mobile" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name-mobile"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="preferredName-mobile" className="block text-sm font-medium mb-2">
                Preferred Name
              </label>
              <input
                type="text"
                id="preferredName-mobile"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="Johnny"
                autoComplete="given-name"
              />
            </div>

            <div>
              <label htmlFor="workplace-mobile" className="block text-sm font-medium mb-2">
                Where do you work?
              </label>
              <input
                type="text"
                id="workplace-mobile"
                value={workplace}
                onChange={(e) => setWorkplace(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="Company or Organization"
                autoComplete="organization"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                What are your disciplines?
              </label>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                {DISCIPLINES.map((discipline) => (
                  <label
                    key={discipline}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDisciplines.includes(discipline)}
                      onChange={() => handleDisciplineToggle(discipline)}
                      className="w-4 h-4 border-2 border-gray-300 checked:bg-black checked:border-black focus:outline-none cursor-pointer"
                    />
                    <span className="text-sm">{discipline}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="pin-mobile" className="block text-sm font-medium mb-2">
                4-digit PIN:
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                id="pin-mobile"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value, setPin)}
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors text-center text-2xl tracking-widest"
                placeholder="&#9679; &#9679; &#9679; &#9679;"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirmPin-mobile" className="block text-sm font-medium mb-2">
                Confirm 4-digit PIN:
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                id="confirmPin-mobile"
                value={confirmPin}
                onChange={(e) => handlePinChange(e.target.value, setConfirmPin)}
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors text-center text-2xl tracking-widest"
                placeholder="&#9679; &#9679; &#9679; &#9679;"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 px-4 py-3">
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link href="/" className="hover:text-black">
              &larr; Go Back
            </Link>
          </p>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen bg-gray-50 py-8 px-4 items-center justify-center">
        <div className="max-w-xl w-full">
          <div className="mb-8">
            <Link href="/" className="text-gray-600 hover:text-black text-sm">
              ← Back to Home
            </Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-normal mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 mb-8">
            Register with your email and create a 4-digit PIN
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email-desktop" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email-desktop"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="your.email@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="name-desktop" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name-desktop"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="preferredName-desktop" className="block text-sm font-medium mb-2">
                Preferred Name
              </label>
              <input
                type="text"
                id="preferredName-desktop"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="Johnny"
                autoComplete="given-name"
              />
            </div>

            <div>
              <label htmlFor="workplace-desktop" className="block text-sm font-medium mb-2">
                Where do you work?
              </label>
              <input
                type="text"
                id="workplace-desktop"
                value={workplace}
                onChange={(e) => setWorkplace(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="Company or Organization"
                autoComplete="organization"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                Discipline(s)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {DISCIPLINES.map((discipline) => (
                  <label
                    key={discipline}
                    className="flex items-center space-x-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDisciplines.includes(discipline)}
                      onChange={() => handleDisciplineToggle(discipline)}
                      className="w-4 h-4 border-2 border-gray-300 checked:bg-black checked:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 cursor-pointer transition-all"
                    />
                    <span className="text-sm group-hover:text-gray-600 transition-colors">
                      {discipline}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="pin-desktop" className="block text-sm font-medium mb-2">
                Create a 4-Digit PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                id="pin-desktop"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value, setPin)}
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors text-center text-2xl tracking-widest font-mono"
                placeholder="••••"
                autoComplete="new-password"
              />
              <p className="text-sm text-gray-500 mt-1">
                Choose a memorable 4-digit PIN for signing in
              </p>
            </div>

            <div>
              <label htmlFor="confirmPin-desktop" className="block text-sm font-medium mb-2">
                Confirm PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                id="confirmPin-desktop"
                value={confirmPin}
                onChange={(e) => handlePinChange(e.target.value, setConfirmPin)}
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors text-center text-2xl tracking-widest font-mono"
                placeholder="••••"
                autoComplete="new-password"
              />
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-black hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
