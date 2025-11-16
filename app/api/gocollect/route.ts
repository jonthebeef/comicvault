import { NextRequest, NextResponse } from 'next/server';

const GOCOLLECT_API_URL = 'https://api.gocollect.com/api/comic-books';
const API_KEY = process.env.GOCOLLECT_API_KEY;

interface GoCollectResponse {
  success: boolean;
  data?: {
    title?: string;
    issue?: string;
    publisher?: string;
    year?: string;
    prices?: {
      [key: string]: number; // Condition grade to price mapping
    };
    url?: string;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { barcode } = await request.json();

    if (!barcode) {
      return NextResponse.json(
        { success: false, error: 'Barcode is required' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GoCollect API key not configured' },
        { status: 500 }
      );
    }

    // Call GoCollect API with barcode
    const response = await fetch(`${GOCOLLECT_API_URL}?upc=${barcode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Try again later.' },
          { status: 429 }
        );
      }

      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Comic not found in GoCollect database' },
          { status: 404 }
        );
      }

      throw new Error(`GoCollect API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform GoCollect response to our format
    const result: GoCollectResponse = {
      success: true,
      data: {
        title: data.title || undefined,
        issue: data.issue_number?.toString() || undefined,
        publisher: data.publisher || undefined,
        year: data.publish_year?.toString() || undefined,
        prices: data.prices || {},
        url: data.url || undefined,
      },
    };

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('GoCollect API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch from GoCollect' },
      { status: 500 }
    );
  }
}
