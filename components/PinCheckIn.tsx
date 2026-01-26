'use client';

/**
 * Simple PIN-based check-in
 * User enters PIN → System looks up their info → Auto-fills form → Submits to Google Sheets
 */

import { useState, useRef, useEffect } from 'react';
import type { Discipline, ValidationError } from '@/types';

const DISCIPLINES: Discipline[] = [
  'Software',
  'Art',
  'Hardware',
  'Design',
  'Fashion',
  'AI/ML',
  'Other',
  'Photographer/Videographer',
];

export default function PinCheckIn() {
  // Form state
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDisciplines, setSelectedDisciplines] = useState<Discipline[]>([]);
  const [reason, setReason] = useState('');

  // UI state
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pinInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus PIN input on mount
  useEffect(() => {
    pinInputRef.current?.focus();
  }, []);

  // Look up user by PIN
  const handlePinLookup = async () => {
    if (pin.length !== 4) return;

    setError(null);
    setIsLookingUp(true);

    try {
      const response = await fetch('/api/lookup-by-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (response.ok && data.exists) {
        // Returning user - auto-fill their info
        setIsReturningUser(true);
        setIsNewUser(false);
        setName(data.user.name);
        setEmail(data.user.email);
        setSelectedDisciplines(data.user.disciplines);
        // Leave reason blank for them to fill in
      } else {
        // New user - they need to fill out the form
        setIsNewUser(true);
        setIsReturningUser(false);
      }
    } catch (err) {
      console.error('PIN lookup failed:', err);
      setError('Unable to connect. Please try again.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handlePinChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
    setPin(digitsOnly);

    // Auto-lookup when 4 digits entered
    if (digitsOnly.length === 4) {
      setTimeout(() => {
        handlePinLookup();
      }, 100);
    } else {
      // Reset form if PIN changes
      setIsNewUser(false);
      setIsReturningUser(false);
      setName('');
      setEmail('');
      setSelectedDisciplines([]);
      setError(null);
    }
  };

  const handleDisciplineToggle = (discipline: Discipline) => {
    setSelectedDisciplines((prev) =>
      prev.includes(discipline)
        ? prev.filter((d) => d !== discipline)
        : [...prev, discipline]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (selectedDisciplines.length === 0) {
      setError('Please select at least one discipline');
      return;
    }
    if (!reason.trim() || reason.length < 10) {
      setError('Please enter a reason for your visit (at least 10 characters)');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/pin-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          name,
          email,
          disciplines: selectedDisciplines,
          reason,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowSuccess(true);

        // Reset form after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setPin('');
          setName('');
          setEmail('');
          setSelectedDisciplines([]);
          setReason('');
          setIsNewUser(false);
          setIsReturningUser(false);
          pinInputRef.current?.focus();
        }, 2000);
      } else {
        setError(data.error || 'Check-in failed. Please try again.');
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setError('Unable to connect. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="container-custom min-h-screen flex items-center justify-center">
        <div className="animate-success text-center">
          <h1 className="text-4xl md:text-5xl mb-6">
            Thank you for signing in :)
          </h1>
          <div className="text-lg text-gray-600 space-y-2">
            <p><strong>{name}</strong></p>
            <p>{selectedDisciplines.join(', ')}</p>
            <p className="text-sm mt-4 italic">{reason}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom min-h-screen py-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-normal mb-2">
          New Stadium Guest Check-In
        </h1>
        <p className="text-gray-600 mb-8">
          {isReturningUser ? `Welcome back, ${name}!` : 'Enter your PIN to check in'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PIN Field - Always shown */}
          <div>
            <label htmlFor="pin" className="block text-sm font-medium mb-2">
              Your 4-Digit PIN
            </label>
            <div className="relative">
              <input
                ref={pinInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                id="pin"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors text-center text-2xl tracking-widest font-mono"
                placeholder="••••"
                autoComplete="off"
              />
              {isLookingUp && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {isNewUser && 'New PIN! Please fill out the form below.'}
              {isReturningUser && 'PIN recognized! Confirm your info below.'}
              {!isNewUser && !isReturningUser && 'Enter your PIN to continue'}
            </p>
          </div>

          {/* Show form once PIN is entered */}
          {(isNewUser || isReturningUser) && (
            <>
              {/* Name Field */}
              <div className="animate-fade-in">
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  readOnly={isReturningUser}
                  className={`w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors ${
                    isReturningUser ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>

              {/* Email Field */}
              <div className="animate-fade-in">
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={isReturningUser}
                  className={`w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors ${
                    isReturningUser ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="your.email@example.com"
                  autoComplete="email"
                />
              </div>

              {/* Disciplines */}
              <div className="animate-fade-in">
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

              {/* Reason for Visit */}
              <div className="animate-fade-in">
                <label htmlFor="reason" className="block text-sm font-medium mb-2">
                  Reason for Visit
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors resize-none"
                  placeholder="Please describe the purpose of your visit..."
                />
                <p className={`text-sm text-right mt-1 ${
                  reason.length < 10 ? 'text-gray-400' : reason.length > 500 ? 'text-red-500' : 'text-gray-600'
                }`}>
                  {reason.length}/500
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 px-4 py-3 animate-fade-in">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLookingUp}
                className="w-full bg-black text-white px-6 py-4 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner"></div>
                    <span>Checking in...</span>
                  </>
                ) : (
                  <span>Check In</span>
                )}
              </button>
            </>
          )}
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Press Enter to submit • Tab to navigate between fields
        </p>
      </div>
    </div>
  );
}
