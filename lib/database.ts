/**
 * Database operations and queries
 */

import { supabase } from './supabase/client';
import type { User, Visit, EmailLookupResult, Discipline } from '@/types';
import { sanitizeInput } from './validation';

/**
 * Check if email exists and return user data with last visit
 */
export async function lookupUserByEmail(
  email: string
): Promise<EmailLookupResult> {
  try {
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', sanitizedEmail)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      console.error('Error looking up user:', userError);
      throw new Error('Database error during lookup');
    }

    if (!user) {
      return { exists: false };
    }

    // Get the most recent visit
    const { data: lastVisit, error: visitError } = await supabase
      .from('visits')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (visitError && visitError.code !== 'PGRST116') {
      console.error('Error fetching last visit:', visitError);
    }

    return {
      exists: true,
      user: user as User,
      lastVisit: lastVisit ? (lastVisit as Visit) : undefined,
    };
  } catch (error) {
    console.error('Unexpected error in lookupUserByEmail:', error);
    throw new Error('Failed to lookup user');
  }
}

/**
 * Check if user has checked in within the last minute
 */
export async function hasRecentCheckIn(userId: string): Promise<boolean> {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('visits')
      .select('id')
      .eq('user_id', userId)
      .gte('timestamp', oneMinuteAgo)
      .limit(1);

    if (error) {
      console.error('Error checking recent check-in:', error);
      throw new Error('Failed to check recent visits');
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Unexpected error in hasRecentCheckIn:', error);
    throw new Error('Failed to check recent check-in');
  }
}

/**
 * Create or update user and record visit
 */
export async function checkInUser(data: {
  email: string;
  name: string;
  disciplines: Discipline[];
  reason: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const sanitizedEmail = sanitizeInput(data.email.toLowerCase());
    const sanitizedName = sanitizeInput(data.name);
    const sanitizedReason = sanitizeInput(data.reason);

    // Check if user exists
    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('id')
      .eq('email', sanitizedEmail)
      .single();

    if (lookupError && lookupError.code !== 'PGRST116') {
      console.error('Error during user lookup:', lookupError);
      return { success: false, error: 'Database error' };
    }

    let userId: string;

    if (existingUser) {
      // User exists - check for recent check-in
      const hasRecent = await hasRecentCheckIn(existingUser.id);
      if (hasRecent) {
        return {
          success: false,
          error: 'You have already checked in within the last minute',
        };
      }

      // Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: sanitizedName,
          disciplines: data.disciplines,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id);

      if (updateError) {
        console.error('Error updating user:', updateError);
        return { success: false, error: 'Failed to update user information' };
      }

      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          email: sanitizedEmail,
          name: sanitizedName,
          disciplines: data.disciplines,
        })
        .select()
        .single();

      if (insertError || !newUser) {
        console.error('Error creating user:', insertError);
        return { success: false, error: 'Failed to create user' };
      }

      userId = newUser.id;
    }

    // Record the visit
    const { error: visitError } = await supabase.from('visits').insert({
      user_id: userId,
      reason_for_visit: sanitizedReason,
      disciplines_at_visit: data.disciplines,
      timestamp: new Date().toISOString(),
    });

    if (visitError) {
      console.error('Error recording visit:', visitError);
      return { success: false, error: 'Failed to record visit' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in checkInUser:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all users with their visit counts
 */
export async function getAllUsersWithVisits() {
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('updated_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw new Error('Failed to fetch users');
    }

    // Get visit counts for each user
    const usersWithCounts = await Promise.all(
      (users || []).map(async (user) => {
        const { count, error: countError } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (countError) {
          console.error('Error counting visits:', countError);
          return { ...user, visitCount: 0 };
        }

        return { ...user, visitCount: count || 0 };
      })
    );

    return usersWithCounts;
  } catch (error) {
    console.error('Unexpected error in getAllUsersWithVisits:', error);
    throw new Error('Failed to fetch users');
  }
}

/**
 * Get all visits for a specific user
 */
export async function getUserVisits(userId: string): Promise<Visit[]> {
  try {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching user visits:', error);
      throw new Error('Failed to fetch visits');
    }

    return (data || []) as Visit[];
  } catch (error) {
    console.error('Unexpected error in getUserVisits:', error);
    throw new Error('Failed to fetch user visits');
  }
}

/**
 * Get analytics data for admin dashboard
 */
export async function getAnalyticsData() {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const weekStart = new Date(
      now.setDate(now.getDate() - now.getDay())
    ).toISOString();
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();

    // Get total check-ins
    const [todayCount, weekCount, monthCount] = await Promise.all([
      supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', todayStart),
      supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', weekStart),
      supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', monthStart),
    ]);

    // Get all visits for discipline breakdown
    const { data: allVisits, error: visitsError } = await supabase
      .from('visits')
      .select('disciplines_at_visit');

    if (visitsError) {
      console.error('Error fetching visits for analytics:', visitsError);
    }

    // Count disciplines
    const disciplineCounts: Record<Discipline, number> = {
      Software: 0,
      Hardware: 0,
      Creative: 0,
    };

    (allVisits || []).forEach((visit) => {
      (visit.disciplines_at_visit || []).forEach((discipline: Discipline) => {
        if (disciplineCounts[discipline] !== undefined) {
          disciplineCounts[discipline]++;
        }
      });
    });

    const disciplineBreakdown = Object.entries(disciplineCounts).map(
      ([discipline, count]) => ({
        discipline: discipline as Discipline,
        count,
      })
    );

    // Get recent activity
    const { data: recentVisits, error: recentError } = await supabase
      .from('visits')
      .select(`
        *,
        users!inner(name, email)
      `)
      .order('timestamp', { ascending: false })
      .limit(20);

    if (recentError) {
      console.error('Error fetching recent visits:', recentError);
    }

    return {
      totalCheckIns: {
        today: todayCount.count || 0,
        week: weekCount.count || 0,
        month: monthCount.count || 0,
      },
      disciplineBreakdown,
      recentActivity: recentVisits || [],
    };
  } catch (error) {
    console.error('Unexpected error in getAnalyticsData:', error);
    throw new Error('Failed to fetch analytics data');
  }
}

/**
 * Export data as CSV
 */
export async function exportToCSV(filters?: {
  startDate?: Date;
  endDate?: Date;
  discipline?: Discipline;
  searchTerm?: string;
}): Promise<string> {
  try {
    let query = supabase.from('visits').select(`
      *,
      users!inner(name, email)
    `);

    if (filters?.startDate) {
      query = query.gte('timestamp', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('timestamp', filters.endDate.toISOString());
    }

    if (filters?.searchTerm) {
      query = query.or(
        `users.name.ilike.%${filters.searchTerm}%,users.email.ilike.%${filters.searchTerm}%`
      );
    }

    const { data, error } = await query.order('timestamp', {
      ascending: false,
    });

    if (error) {
      console.error('Error fetching data for export:', error);
      throw new Error('Failed to export data');
    }

    // Create CSV
    const headers = ['Timestamp', 'Name', 'Email', 'Disciplines', 'Reason'];
    const rows = (data || []).map((visit: any) => [
      new Date(visit.timestamp).toLocaleString(),
      visit.users.name,
      visit.users.email,
      visit.disciplines_at_visit.join('; '),
      visit.reason_for_visit,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    return csv;
  } catch (error) {
    console.error('Unexpected error in exportToCSV:', error);
    throw new Error('Failed to export data');
  }
}
