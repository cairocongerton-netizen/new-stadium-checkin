'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User, Discipline } from '@/types';

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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [selectedDisciplines, setSelectedDisciplines] = useState<Discipline[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const userJson = sessionStorage.getItem('user');
    if (!userJson) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userJson);
    setUser(userData);
    setName(userData.name);
    setPreferredName(userData.preferred_name || '');
    setWorkplace(userData.workplace || '');
    setSelectedDisciplines(userData.disciplines);
  }, [router]);

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

    if (!name.trim() || !workplace.trim()) {
      setError('Please fill in all fields');
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
          preferred_name: preferredName,
          workplace,
          disciplines: selectedDisciplines,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const updatedUser = {
          ...user!,
          name,
          preferred_name: preferredName,
          workplace,
          disciplines: selectedDisciplines,
        };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);

        setSuccess(true);
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="max-w-sm w-full mx-auto">
        {/* Logo - CENTERED */}
        <div className="flex justify-center mb-6">
          <svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="40" cy="16" rx="40" ry="16" fill="black"/>
            <text x="12" y="22" fill="white" fontFamily="system-ui, -apple-system, sans-serif" fontSize="18" fontWeight="600" fontStyle="italic">New</text>
            <circle cx="62" cy="20" r="2" fill="white"/>
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-normal leading-tight mb-1">
          Edit<br/>Profile
        </h1>

        {/* Go Back */}
        <Link href="/checkin" className="text-sm underline block mb-5">
          Go Back
        </Link>

        {success && (
          <div className="bg-green-50 border border-green-200 px-4 py-3 mb-4">
            <p className="text-green-600 text-sm">Profile updated successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address:
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div>
            <label htmlFor="preferredName" className="block text-sm font-medium mb-1">
              Preferred Name
            </label>
            <input
              type="text"
              id="preferredName"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div>
            <label htmlFor="workplace" className="block text-sm font-medium mb-1">
              Where do you work?
            </label>
            <input
              type="text"
              id="workplace"
              value={workplace}
              onChange={(e) => setWorkplace(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Your disciplines?
            </label>
            <div className="grid grid-cols-3 gap-x-4 gap-y-0">
              {DISCIPLINES.map((discipline) => (
                <button
                  key={discipline}
                  type="button"
                  onClick={() => handleDisciplineToggle(discipline)}
                  className={`text-left text-sm py-0.5 transition-colors ${
                    selectedDisciplines.includes(discipline)
                      ? 'text-black font-medium'
                      : 'text-gray-500'
                  }`}
                >
                  {discipline}
                </button>
              ))}
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
            className="w-full bg-black text-white px-6 py-4 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="spinner mr-2"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Edits</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
