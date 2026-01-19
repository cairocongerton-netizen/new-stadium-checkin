'use client';

/**
 * Admin Dashboard - View check-ins, analytics, and export data
 */

import { useState, useEffect } from 'react';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';
import type { Discipline, Visit } from '@/types';
import {
  getAllUsersWithVisits,
  getUserVisits,
  getAnalyticsData,
  exportToCSV,
} from '@/lib/database';

interface UserWithCount {
  id: string;
  email: string;
  name: string;
  disciplines: Discipline[];
  created_at: string;
  updated_at: string;
  visitCount: number;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [users, setUsers] = useState<UserWithCount[]>([]);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userVisits, setUserVisits] = useState<Record<string, Visit[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<
    'name' | 'email' | 'updated_at' | 'visitCount'
  >('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Analytics state
  const [analytics, setAnalytics] = useState<{
    totalCheckIns: { today: number; week: number; month: number };
    disciplineBreakdown: { discipline: Discipline; count: number }[];
    recentActivity: any[];
  } | null>(null);

  // Export filters
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();

    // In production, this should be handled server-side
    // For this demo, we're checking against the env variable on client
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid password');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, analyticsData] = await Promise.all([
        getAllUsersWithVisits(),
        getAnalyticsData(),
      ]);
      setUsers(usersData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpandUser = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }

    setExpandedUserId(userId);

    if (!userVisits[userId]) {
      try {
        const visits = await getUserVisits(userId);
        setUserVisits((prev) => ({ ...prev, [userId]: visits }));
      } catch (error) {
        console.error('Failed to load user visits:', error);
      }
    }
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filters: any = {};

      if (exportStartDate) {
        filters.startDate = new Date(exportStartDate);
      }
      if (exportEndDate) {
        filters.endDate = new Date(exportEndDate);
      }
      if (searchTerm) {
        filters.searchTerm = searchTerm;
      }

      const csv = await exportToCSV(filters);

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `new-stadium-checkins-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const filteredAndSortedUsers = users
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const multiplier = sortDirection === 'asc' ? 1 : -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * multiplier;
      }
      return ((aVal as number) - (bVal as number)) * multiplier;
    });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-4">
          <h1 className="text-3xl font-normal mb-8 text-center">
            Admin Dashboard
          </h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                placeholder="Enter admin password"
                autoFocus
              />
              {authError && (
                <p className="text-red-500 text-sm mt-1">{authError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner-large"></div>
      </div>
    );
  }

  return (
    <div className="admin-container py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-normal mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage check-ins and view analytics
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border border-gray-300 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Check-ins Today
          </h3>
          <p className="text-4xl font-normal">{analytics.totalCheckIns.today}</p>
        </div>
        <div className="border border-gray-300 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Check-ins This Week
          </h3>
          <p className="text-4xl font-normal">{analytics.totalCheckIns.week}</p>
        </div>
        <div className="border border-gray-300 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Check-ins This Month
          </h3>
          <p className="text-4xl font-normal">{analytics.totalCheckIns.month}</p>
        </div>
      </div>

      {/* Discipline Breakdown */}
      <div className="border border-gray-300 p-6 mb-8">
        <h2 className="text-xl font-medium mb-4">Discipline Breakdown</h2>
        <div className="space-y-3">
          {analytics.disciplineBreakdown.map(({ discipline, count }) => {
            const maxCount = Math.max(
              ...analytics.disciplineBreakdown.map((d) => d.count)
            );
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={discipline}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{discipline}</span>
                  <span className="text-gray-600">{count}</span>
                </div>
                <div className="w-full bg-gray-200 h-2">
                  <div
                    className="bg-black h-2 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Section */}
      <div className="border border-gray-300 p-6 mb-8">
        <h2 className="text-xl font-medium mb-4">Export Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={exportStartDate}
              onChange={(e) => setExportStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              End Date
            </label>
            <input
              type="date"
              value={exportEndDate}
              onChange={(e) => setExportEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-black text-white px-6 py-2 hover:bg-gray-800 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              {isExporting ? (
                <>
                  <div className="spinner"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <span>Export to CSV</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-gray-300">
        <div className="p-6 border-b border-gray-300">
          <h2 className="text-xl font-medium mb-4">All Check-ins</h2>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
            placeholder="Search by name or email..."
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  <button
                    onClick={() => handleSort('name')}
                    className="hover:text-gray-600"
                  >
                    Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  <button
                    onClick={() => handleSort('email')}
                    className="hover:text-gray-600"
                  >
                    Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  Disciplines
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  <button
                    onClick={() => handleSort('visitCount')}
                    className="hover:text-gray-600"
                  >
                    Visits {sortField === 'visitCount' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium">
                  <button
                    onClick={() => handleSort('updated_at')}
                    className="hover:text-gray-600"
                  >
                    Last Visit {sortField === 'updated_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedUsers.map((user) => (
                <>
                  <tr
                    key={user.id}
                    onClick={() => handleExpandUser(user.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 text-sm">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {user.disciplines.join(', ')}
                    </td>
                    <td className="px-6 py-4 text-sm">{user.visitCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.updated_at).toLocaleString()}
                    </td>
                  </tr>
                  {expandedUserId === user.id && userVisits[user.id] && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Visit History</h4>
                          {userVisits[user.id].map((visit) => (
                            <div
                              key={visit.id}
                              className="border-l-2 border-black pl-4 py-2"
                            >
                              <div className="text-sm text-gray-600 mb-1">
                                {new Date(visit.timestamp).toLocaleString()}
                              </div>
                              <div className="text-sm mb-1">
                                <strong>Disciplines:</strong>{' '}
                                {visit.disciplines_at_visit.join(', ')}
                              </div>
                              <div className="text-sm">
                                <strong>Reason:</strong> {visit.reason_for_visit}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>

          {filteredAndSortedUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No users found
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border border-gray-300 p-6 mt-8">
        <h2 className="text-xl font-medium mb-4">Recent Activity (Last 20)</h2>
        <div className="space-y-3">
          {analytics.recentActivity.map((activity: any) => (
            <div
              key={activity.id}
              className="flex items-start justify-between py-3 border-b border-gray-200 last:border-0"
            >
              <div className="flex-1">
                <p className="font-medium">{activity.users?.name}</p>
                <p className="text-sm text-gray-600">
                  {activity.disciplines_at_visit.join(', ')}
                </p>
                <p className="text-sm text-gray-500 mt-1 italic">
                  {activity.reason_for_visit}
                </p>
              </div>
              <div className="text-sm text-gray-500 ml-4">
                {new Date(activity.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
