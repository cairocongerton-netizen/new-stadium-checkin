const { google } = require('googleapis');
const fs = require('fs');

async function clearSheets() {
  try {
    // Load credentials
    const credentials = JSON.parse(fs.readFileSync('./credentials.json', 'utf8'));

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    await auth.authorize();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    console.log('Clearing Google Sheets data...');

    // Clear Users sheet (keep headers)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Users!A2:Z',
    });
    console.log('✅ Users sheet cleared');

    // Clear Visits sheet (keep headers)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Visits!A2:Z',
    });
    console.log('✅ Visits sheet cleared');

    console.log('\n🎉 All data cleared successfully! Fresh start ready.');
  } catch (error) {
    console.error('Error clearing sheets:', error);
  }
}

clearSheets();
