'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User, Discipline } from '@/types';

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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [selectedDisciplines, setSelectedDisciplines] = useState<Discipline[]>([]);
  const [pin, setPin] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get user from sessionStorage
    const userJson = sessionStorage.getItem('user');
    if (!userJson) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userJson);
    setUser(userData);
    setName(userData.name);
    setWorkplace(userData.workplace || '');
    setSelectedDisciplines(userData.disciplines);
    setPin(userData.pin || '');
  }, [router]);

  const handleDisciplineToggle = (discipline: Discipline) => {
    setSelectedDisciplines((prev) =>
      prev.includes(discipline)
        ? prev.filter((d) => d !== discipline)
        : [...prev, discipline]
    );
  };

  const handlePinChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
    setPin(digitsOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim() || !workplace.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (selectedDisciplines.length === 0) {
      setError('Please select at least one discipline');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user!.id,
          name,
          workplace,
          disciplines: selectedDisciplines,
          pin,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update sessionStorage with new data
        const updatedUser = {
          ...user!,
          name,
          workplace,
          disciplines: selectedDisciplines,
          pin,
        };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);

        setSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      console.error('Update error:', err);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full">
        <div className="mb-8 flex justify-between items-center">
          <Link href="/checkin" className="text-gray-600 hover:text-black text-sm">
            ← Back to Check-in
          </Link>
          <button
            onClick={() => {
              sessionStorage.removeItem('user');
              router.push('/');
            }}
            className="text-sm text-gray-600 hover:text-black"
          >
            Sign Out
          </button>
        </div>

        <h1 className="text-3xl md:text-4xl font-normal mb-2">
          Your Profile
        </h1>
        <p className="text-gray-600 mb-8">
          {isEditing ? 'Edit your information' : 'View and edit your information'}
        </p>

        {success && (
          <div className="bg-green-50 border border-green-200 px-4 py-3 mb-6 animate-fade-in">
            <p className="text-green-600 text-sm">Profile updated successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field (Read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={!isEditing}
              className={`w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors ${
                !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>

          {/* Workplace Field */}
          <div>
            <label htmlFor="workplace" className="block text-sm font-medium mb-2">
              Where do you work?
            </label>
            <input
              type="text"
              id="workplace"
              value={workplace}
              onChange={(e) => setWorkplace(e.target.value)}
              readOnly={!isEditing}
              className={`w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors ${
                !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>

          {/* Disciplines */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Discipline(s)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {DISCIPLINES.map((discipline) => (
                <label
                  key={discipline}
                  className={`flex items-center space-x-2 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed'} group`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDisciplines.includes(discipline)}
                    onChange={() => isEditing && handleDisciplineToggle(discipline)}
                    disabled={!isEditing}
                    className={`w-4 h-4 border-2 border-gray-300 checked:bg-black checked:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all ${
                      isEditing ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                  />
                  <span className="text-sm group-hover:text-gray-600 transition-colors">
                    {discipline}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* PIN Field */}
          <div>
            <label htmlFor="pin" className="block text-sm font-medium mb-2">
              4-Digit PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              id="pin"
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              readOnly={!isEditing}
              maxLength={4}
              className={`w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors text-center text-2xl tracking-widest font-mono ${
                !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-black text-white px-6 py-4 hover:bg-gray-800 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setName(user.name);
                    setWorkplace(user.workplace);
                    setSelectedDisciplines(user.disciplines);
                    setPin(user.pin);
                    setError(null);
                  }}
                  className="flex-1 border-2 border-black text-black px-6 py-4 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-black text-white px-6 py-4 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
