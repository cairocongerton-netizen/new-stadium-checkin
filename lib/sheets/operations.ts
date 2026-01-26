/**
 * Google Sheets data operations for email+PIN authentication
 */

import { getGoogleSheetsClient, SHEETS } from './client';
import type { User, Visit, Discipline } from '@/types';
import { sanitizeInput } from '../validation';
import { v4 as uuidv4 } from 'uuid';

/**
 * Helper: Read all rows from a sheet
 */
async function readSheet(sheetName: string): Promise<any[][]> {
  const { sheets, spreadsheetId } = await getGoogleSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A2:Z`, // Skip header row
  });

  return response.data.values || [];
}

/**
 * Helper: Append row to sheet
 */
async function appendToSheet(sheetName: string, values: any[]): Promise<void> {
  const { sheets, spreadsheetId } = await getGoogleSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:A`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [values],
    },
  });
}

/**
 * Helper: Update row in sheet
 */
async function updateRow(sheetName: string, rowIndex: number, values: any[]): Promise<void> {
  const { sheets, spreadsheetId } = await getGoogleSheetsClient();

  // rowIndex is 0-based, +2 for header row and 1-based indexing
  const range = `${sheetName}!A${rowIndex + 2}:Z${rowIndex + 2}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: {
      values: [values],
    },
  });
}

/**
 * Helper: Parse user row from sheet
 * Columns: ID, EMAIL, NAME, WORKPLACE, DISCIPLINES, CREATED_AT, UPDATED_AT, PIN
 */
function parseUserRow(row: any[]): User | null {
  if (!row || row.length < 7) return null;

  return {
    id: row[0],
    email: row[1],
    name: row[2],
    workplace: row[3] || '',
    disciplines: row[4] ? row[4].split(',') as Discipline[] : [],
    created_at: row[5],
    updated_at: row[6],
    pin: row[7] || '', // Plaintext PIN
  };
}

/**
 * Helper: Parse visit row from sheet
 * Columns: ID, USER_ID, TIMESTAMP, REASON, DISCIPLINES
 */
function parseVisitRow(row: any[]): Visit | null {
  if (!row || row.length < 5) return null;

  return {
    id: row[0],
    user_id: row[1],
    timestamp: row[2],
    reason_for_visit: row[3],
    disciplines_at_visit: row[4] ? row[4].split(',') as Discipline[] : [],
  };
}

/**
 * Register new user with email and PIN
 */
export async function registerUser(data: {
  email: string;
  name: string;
  workplace: string;
  pin: string;
  disciplines: Discipline[];
}): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const sanitizedEmail = sanitizeInput(data.email.toLowerCase());
    const sanitizedName = sanitizeInput(data.name);
    const sanitizedWorkplace = sanitizeInput(data.workplace);

    // Read all users
    const userRows = await readSheet(SHEETS.USERS);

    // Check if email already exists
    const emailExists = userRows.some(row => row[1] === sanitizedEmail);
    if (emailExists) {
      return { success: false, error: 'Email already registered' };
    }

    // Create new user
    const userId = uuidv4();
    const now = new Date().toISOString();

    const newUserRow = [
      userId,
      sanitizedEmail,
      sanitizedName,
      sanitizedWorkplace,
      data.disciplines.join(','),
      now,
      now,
      data.pin, // Store PIN in plaintext for admin recovery
    ];

    await appendToSheet(SHEETS.USERS, newUserRow);

    return { success: true, userId };
  } catch (error) {
    console.error('Error in registerUser:', error);
    return { success: false, error: 'Failed to register user' };
  }
}

/**
 * Authenticate user with email and PIN
 */
export async function authenticateUser(
  email: string,
  pin: string
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    console.log('🔍 Authenticating user:', sanitizedEmail);

    // Read all users
    const userRows = await readSheet(SHEETS.USERS);
    console.log('📊 Total users in sheet:', userRows.length);

    // Find user by email
    const userRowIndex = userRows.findIndex(row => row[1] === sanitizedEmail);

    if (userRowIndex === -1) {
      console.log('❌ User not found with email:', sanitizedEmail);
      return { success: false, error: 'Account not found. Please register first.' };
    }

    const user = parseUserRow(userRows[userRowIndex]);
    if (!user || !user.pin) {
      console.log('❌ User exists but has no PIN');
      return { success: false, error: 'Account exists but has no PIN. Please contact support.' };
    }

    console.log('🔐 Verifying PIN for user:', user.name);

    // Verify PIN (plaintext comparison)
    if (pin !== user.pin) {
      console.log('❌ PIN verification failed');
      return { success: false, error: 'Incorrect PIN. Please try again.' };
    }

    console.log('✅ Authentication successful');
    return { success: true, user };
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    return { success: false, error: 'Authentication failed. Please try again.' };
  }
}

/**
 * Get user by email (for checking if exists during registration)
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const userRows = await readSheet(SHEETS.USERS);

    const userRow = userRows.find(row => row[1] === sanitizedEmail);
    return userRow ? parseUserRow(userRow) : null;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: {
  userId: string;
  name: string;
  workplace: string;
  disciplines: Discipline[];
  pin: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const sanitizedName = sanitizeInput(data.name);
    const sanitizedWorkplace = sanitizeInput(data.workplace);

    // Read all users
    const userRows = await readSheet(SHEETS.USERS);

    // Find user by ID
    const userRowIndex = userRows.findIndex(row => row[0] === data.userId);

    if (userRowIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    const user = parseUserRow(userRows[userRowIndex]);
    if (!user) {
      return { success: false, error: 'Invalid user data' };
    }

    // Update user
    const now = new Date().toISOString();
    const updatedRow = [
      user.id,
      user.email, // Email cannot be changed
      sanitizedName,
      sanitizedWorkplace,
      data.disciplines.join(','),
      user.created_at,
      now,
      data.pin,
    ];

    await updateRow(SHEETS.USERS, userRowIndex, updatedRow);

    return { success: true };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

/**
 * Check in user (must be authenticated first)
 */
export async function checkInUser(data: {
  userId: string;
  reason: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const sanitizedReason = sanitizeInput(data.reason);

    // Read user to get their disciplines
    const userRows = await readSheet(SHEETS.USERS);
    const userRow = userRows.find(row => row[0] === data.userId);

    if (!userRow) {
      return { success: false, error: 'User not found' };
    }

    const user = parseUserRow(userRow);
    if (!user) {
      return { success: false, error: 'Invalid user data' };
    }

    // Check for recent check-in (within last minute)
    const visitRows = await readSheet(SHEETS.VISITS);
    const oneMinuteAgo = Date.now() - 60 * 1000;

    const hasRecent = visitRows.some(row => {
      if (!row || row[1] !== data.userId) return false;
      const visitTime = new Date(row[2]).getTime();
      return visitTime > oneMinuteAgo;
    });

    if (hasRecent) {
      return {
        success: false,
        error: 'You have already checked in within the last minute',
      };
    }

    // Record the visit
    const visitId = uuidv4();
    const visitRow = [
      visitId,
      data.userId,
      new Date().toISOString(),
      sanitizedReason,
      user.disciplines.join(','),
    ];

    await appendToSheet(SHEETS.VISITS, visitRow);

    return { success: true };
  } catch (error) {
    console.error('Error in checkInUser:', error);
    return { success: false, error: 'Failed to check in' };
  }
}

/**
 * Get user's last visit
 */
export async function getLastVisit(userId: string): Promise<Visit | null> {
  try {
    const visitRows = await readSheet(SHEETS.VISITS);

    const userVisits = visitRows
      .map(parseVisitRow)
      .filter(v => v && v.user_id === userId)
      .sort((a, b) => new Date(b!.timestamp).getTime() - new Date(a!.timestamp).getTime());

    return userVisits[0] || null;
  } catch (error) {
    console.error('Error in getLastVisit:', error);
    return null;
  }
}

/**
 * Get all users with visit counts (for admin)
 */
export async function getAllUsersWithVisits() {
  try {
    const userRows = await readSheet(SHEETS.USERS);
    const visitRows = await readSheet(SHEETS.VISITS);

    const users = userRows
      .map(parseUserRow)
      .filter(u => u !== null) as User[];

    const usersWithCounts = users.map(user => {
      const visitCount = visitRows.filter(row => row[1] === user.id).length;
      return { ...user, visitCount };
    });

    usersWithCounts.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    return usersWithCounts;
  } catch (error) {
    console.error('Error in getAllUsersWithVisits:', error);
    throw new Error('Failed to fetch users');
  }
}

/**
 * Get all visits for a specific user (for admin)
 */
export async function getUserVisits(userId: string): Promise<Visit[]> {
  try {
    const rows = await readSheet(SHEETS.VISITS);

    const visits = rows
      .map(parseVisitRow)
      .filter(v => v && v.user_id === userId) as Visit[];

    visits.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return visits;
  } catch (error) {
    console.error('Error in getUserVisits:', error);
    throw new Error('Failed to fetch user visits');
  }
}

/**
 * Get analytics data (for admin dashboard)
 */
export async function getAnalyticsData() {
  try {
    const visitRows = await readSheet(SHEETS.VISITS);
    const userRows = await readSheet(SHEETS.USERS);

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).getTime();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const allVisits = visitRows
      .map(parseVisitRow)
      .filter(v => v !== null) as Visit[];

    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;

    const disciplineCounts: Record<Discipline, number> = {
      Software: 0,
      Art: 0,
      Hardware: 0,
      Design: 0,
      Fashion: 0,
      'AI/ML': 0,
      Other: 0,
      'Photographer/Videographer': 0,
    };

    allVisits.forEach(visit => {
      const visitTime = new Date(visit.timestamp).getTime();

      if (visitTime >= todayStart) todayCount++;
      if (visitTime >= weekStart) weekCount++;
      if (visitTime >= monthStart) monthCount++;

      visit.disciplines_at_visit.forEach(discipline => {
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

    const recentVisits = allVisits
      .slice(0, 20)
      .map(visit => {
        const userRow = userRows.find(row => row[0] === visit.user_id);
        return {
          ...visit,
          users: userRow ? {
            name: userRow[2],
            email: userRow[1],
          } : {
            name: 'Unknown',
            email: 'Unknown',
          },
        };
      });

    return {
      totalCheckIns: {
        today: todayCount,
        week: weekCount,
        month: monthCount,
      },
      disciplineBreakdown,
      recentActivity: recentVisits,
    };
  } catch (error) {
    console.error('Error in getAnalyticsData:', error);
    throw new Error('Failed to fetch analytics data');
  }
}

/**
 * Export data as CSV (for admin)
 */
export async function exportToCSV(filters?: {
  startDate?: Date;
  endDate?: Date;
  discipline?: Discipline;
  searchTerm?: string;
}): Promise<string> {
  try {
    const visitRows = await readSheet(SHEETS.VISITS);
    const userRows = await readSheet(SHEETS.USERS);

    let visits = visitRows
      .map(parseVisitRow)
      .filter(v => v !== null) as Visit[];

    if (filters?.startDate) {
      const startTime = filters.startDate.getTime();
      visits = visits.filter(v => new Date(v.timestamp).getTime() >= startTime);
    }

    if (filters?.endDate) {
      const endTime = filters.endDate.getTime();
      visits = visits.filter(v => new Date(v.timestamp).getTime() <= endTime);
    }

    if (filters?.discipline) {
      visits = visits.filter(v =>
        v.disciplines_at_visit.includes(filters.discipline!)
      );
    }

    const rows = visits
      .map(visit => {
        const userRow = userRows.find(row => row[0] === visit.user_id);
        if (!userRow) return null;

        const userName = userRow[2];
        const userEmail = userRow[1];

        if (filters?.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          if (!userName.toLowerCase().includes(term) &&
              !userEmail.toLowerCase().includes(term)) {
            return null;
          }
        }

        return [
          new Date(visit.timestamp).toLocaleString(),
          userName,
          userEmail,
          visit.disciplines_at_visit.join('; '),
          visit.reason_for_visit,
        ];
      })
      .filter(row => row !== null);

    rows.sort((a, b) =>
      new Date(b![0]).getTime() - new Date(a![0]).getTime()
    );

    const headers = ['Timestamp', 'Name', 'Email', 'Disciplines', 'Reason'];
    const csv = [
      headers.join(','),
      ...rows.map(row =>
        row!.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    return csv;
  } catch (error) {
    console.error('Error in exportToCSV:', error);
    throw new Error('Failed to export data');
  }
}
