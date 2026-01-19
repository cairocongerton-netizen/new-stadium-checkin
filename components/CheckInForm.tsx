'use client';

/**
 * Main check-in form component with email lookup and dual-state logic
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Discipline, User, Visit, ValidationError } from '@/types';
import { validateCheckInForm } from '@/lib/validation';
import { lookupUserByEmail, checkInUser } from '@/lib/database';

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

export default function CheckInForm() {
  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedDisciplines, setSelectedDisciplines] = useState<Discipline[]>([]);
  const [reason, setReason] = useState('');

  // UI state
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [returningUser, setReturningUser] = useState<User | null>(null);
  const [lastVisit, setLastVisit] = useState<Visit | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Rate limiting for email lookup
  const lookupTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lookupCountRef = useRef(0);
  const lookupResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // Email lookup with debounce and rate limiting
  const performEmailLookup = useCallback(async (emailValue: string) => {
    if (!emailValue || emailValue.length < 3) {
      setIsReturningUser(false);
      setReturningUser(null);
      setLastVisit(null);
      return;
    }

    // Rate limiting: max 10 lookups per minute
    if (lookupCountRef.current >= 10) {
      console.log('Rate limit reached for email lookups');
      return;
    }

    setIsLookingUp(true);
    lookupCountRef.current++;

    // Reset counter after 1 minute
    if (!lookupResetTimerRef.current) {
      lookupResetTimerRef.current = setTimeout(() => {
        lookupCountRef.current = 0;
        lookupResetTimerRef.current = null;
      }, 60000);
    }

    try {
      const result = await lookupUserByEmail(emailValue);

      if (result.exists && result.user) {
        setIsReturningUser(true);
        setReturningUser(result.user);
        setLastVisit(result.lastVisit || null);
        setName(result.user.name);
        setSelectedDisciplines(result.user.disciplines);
      } else {
        setIsReturningUser(false);
        setReturningUser(null);
        setLastVisit(null);
      }
    } catch (error) {
      console.error('Email lookup failed:', error);
      setGeneralError(
        "We're having trouble connecting. Please try again."
      );
    } finally {
      setIsLookingUp(false);
    }
  }, []);

  // Debounced email change handler
  useEffect(() => {
    if (lookupTimerRef.current) {
      clearTimeout(lookupTimerRef.current);
    }

    lookupTimerRef.current = setTimeout(() => {
      performEmailLookup(email);
    }, 500);

    return () => {
      if (lookupTimerRef.current) {
        clearTimeout(lookupTimerRef.current);
      }
    };
  }, [email, performEmailLookup]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (lookupResetTimerRef.current) {
        clearTimeout(lookupResetTimerRef.current);
      }
    };
  }, []);

  const handleDisciplineToggle = (discipline: Discipline) => {
    setSelectedDisciplines((prev) =>
      prev.includes(discipline)
        ? prev.filter((d) => d !== discipline)
        : [...prev, discipline]
    );
  };

  const handleSameAsLastTime = () => {
    if (lastVisit) {
      setReason(lastVisit.reason_for_visit);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setGeneralError(null);

    // Validate form
    const validationErrors = validateCheckInForm({
      email,
      name,
      disciplines: selectedDisciplines,
      reason,
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await checkInUser({
        email,
        name,
        disciplines: selectedDisciplines,
        reason,
      });

      if (result.success) {
        // Show success message
        setSuccessData({
          name,
          disciplines: selectedDisciplines,
          reason,
        });
        setShowSuccess(true);

        // Log to console for debugging
        console.log('Check-in successful:', {
          email,
          name,
          disciplines: selectedDisciplines,
          reason,
          timestamp: new Date().toISOString(),
        });

        // Reset form after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setEmail('');
          setName('');
          setSelectedDisciplines([]);
          setReason('');
          setIsReturningUser(false);
          setReturningUser(null);
          setLastVisit(null);
          setSuccessData(null);
          emailInputRef.current?.focus();
        }, 2000);
      } else {
        setGeneralError(
          result.error || 'Failed to check in. Please try again.'
        );
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setGeneralError(
        "We're having trouble connecting. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return errors.find((e) => e.field === field)?.message;
  };

  if (showSuccess && successData) {
    return (
      <div className="container-custom min-h-screen flex items-center justify-center">
        <div className="animate-success text-center">
          <h1 className="text-4xl md:text-5xl mb-6">
            Thank you for signing in :)
          </h1>
          <div className="text-lg text-gray-600 space-y-2">
            <p>
              <strong>{successData.name}</strong>
            </p>
            <p>{successData.disciplines.join(', ')}</p>
            <p className="text-sm mt-4 italic">{successData.reason}</p>
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
          {isReturningUser && returningUser
            ? `Welcome back, ${returningUser.name}!`
            : 'Please fill out the form below'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="form-transition">
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                ref={emailInputRef}
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border ${
                  getFieldError('email')
                    ? 'border-red-500'
                    : 'border-gray-300'
                } focus:outline-none focus:border-black transition-colors`}
                placeholder="your.email@example.com"
                autoComplete="email"
              />
              {isLookingUp && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
            {getFieldError('email') && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError('email')}
              </p>
            )}
          </div>

          {/* Name Field - Read-only for returning users */}
          <div className="form-transition animate-fade-in">
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={isReturningUser}
              className={`w-full px-4 py-3 border ${
                getFieldError('name') ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:border-black transition-colors ${
                isReturningUser ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="John Doe"
              autoComplete="name"
            />
            {getFieldError('name') && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError('name')}
              </p>
            )}
          </div>

          {/* Disciplines */}
          <div className="form-transition animate-fade-in">
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
            {getFieldError('disciplines') && (
              <p className="text-red-500 text-sm mt-2">
                {getFieldError('disciplines')}
              </p>
            )}
          </div>

          {/* Reason for Visit */}
          <div className="form-transition animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="reason" className="block text-sm font-medium">
                Reason for Visit
              </label>
              {lastVisit && (
                <button
                  type="button"
                  onClick={handleSameAsLastTime}
                  className="text-sm text-gray-600 hover:text-black border border-gray-300 px-3 py-1 transition-colors"
                >
                  Same as last time
                </button>
              )}
            </div>
            {lastVisit && (
              <p className="text-sm text-gray-500 mb-2 italic">
                Last time: {lastVisit.reason_for_visit}
              </p>
            )}
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border ${
                getFieldError('reason') ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:border-black transition-colors resize-none`}
              placeholder="Please describe the purpose of your visit..."
            />
            <div className="flex justify-between items-center mt-1">
              {getFieldError('reason') && (
                <p className="text-red-500 text-sm">
                  {getFieldError('reason')}
                </p>
              )}
              <p
                className={`text-sm ml-auto ${
                  reason.length < 10
                    ? 'text-gray-400'
                    : reason.length > 500
                    ? 'text-red-500'
                    : 'text-gray-600'
                }`}
              >
                {reason.length}/500
              </p>
            </div>
          </div>

          {/* General Error */}
          {generalError && (
            <div className="bg-red-50 border border-red-200 px-4 py-3 animate-fade-in">
              <p className="text-red-600 text-sm">{generalError}</p>
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
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Press Enter to submit • Tab to navigate between fields
        </p>
      </div>
    </div>
  );
}
