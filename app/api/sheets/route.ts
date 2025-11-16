import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { Comic } from '@/lib/types';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_ID;
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_CLIENT_SECRET?.replace(/\\n/g, '\n');

interface SheetRow {
  Title: string;
  Issue: string;
  Year: string;
  Publisher: string;
  Condition: string;
  'USD Value': string;
  'GBP Value': string;
  'Scan Date': string;
  'GoCollect Link': string;
  'Scanned By': string;
  Notes: string;
}

export async function POST(request: NextRequest) {
  try {
    const { comic }: { comic: Comic } = await request.json();

    if (!comic) {
      return NextResponse.json(
        { success: false, error: 'Comic data is required' },
        { status: 400 }
      );
    }

    if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
      return NextResponse.json(
        { success: false, error: 'Google Sheets credentials not configured' },
        { status: 500 }
      );
    }

    // Initialize Google Sheets authentication
    const serviceAccountAuth = new JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Load the spreadsheet
    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    // Get the first sheet (assuming comics are in the first sheet)
    const sheet = doc.sheetsByIndex[0];

    if (!sheet) {
      return NextResponse.json(
        { success: false, error: 'No sheets found in the document' },
        { status: 500 }
      );
    }

    // Format the row data to match the Google Sheet columns
    const rowData: Partial<SheetRow> = {
      'Title': comic.title || '',
      'Issue': comic.issue || '',
      'Year': comic.year || '',
      'Publisher': comic.publisher || '',
      'Condition': comic.condition,
      'USD Value': comic.usdValue?.toFixed(2) || '',
      'GBP Value': comic.gbpValue?.toFixed(2) || '',
      'Scan Date': comic.scanDate.toISOString().split('T')[0], // YYYY-MM-DD format
      'GoCollect Link': comic.goCollectUrl || '',
      'Scanned By': comic.scannedByName,
      'Notes': comic.notes || '',
    };

    // Add the row to the sheet
    await sheet.addRow(rowData);

    return NextResponse.json({
      success: true,
      message: 'Comic added to Google Sheet successfully',
    });

  } catch (error: any) {
    console.error('Google Sheets API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update Google Sheet' },
      { status: 500 }
    );
  }
}
