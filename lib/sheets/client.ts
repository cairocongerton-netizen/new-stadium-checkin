/**
 * Google Sheets API client configuration
 */

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';

export const SHEETS = {
  USERS: 'Users',
  VISITS: 'Visits',
} as const;

export const USER_COLUMNS = ['ID', 'EMAIL', 'NAME', 'DISCIPLINES', 'CREATED_AT', 'UPDATED_AT', 'PIN_HASH'];
export const VISIT_COLUMNS = ['ID', 'USER_ID', 'TIMESTAMP', 'REASON', 'DISCIPLINES'];

let sheetsClient: any = null;
let auth: any = null;

/**
 * Get authenticated Google Sheets client
 */
export async function getGoogleSheetsClient() {
  if (sheetsClient && auth) {
    return { sheets: sheetsClient, spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID!, auth };
  }

  try {
    // Load credentials from file in production, or use environment variable
    let credentials;

    if (process.env.NODE_ENV === 'production' || !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      // In production, read from credentials.json file
      const credentialsPath = join(process.cwd(), 'credentials.json');
      credentials = JSON.parse(readFileSync(credentialsPath, 'utf8'));
    } else {
      // In development, use environment variable
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    }

    // Create JWT auth client
    auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Authorize
    await auth.authorize();

    // Create Sheets API client
    sheetsClient = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID not set');
    }

    return { sheets: sheetsClient, spreadsheetId, auth };
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw new Error('Failed to initialize Google Sheets client');
  }
}
