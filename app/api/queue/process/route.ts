import { NextRequest, NextResponse } from 'next/server';

const MAX_CALLS_PER_DAY = 100;

interface ProcessResult {
  success: boolean;
  processed: number;
  failed: number;
  rateLimitReached: boolean;
  remainingCalls: number;
  errors: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { queueItems } = await request.json();

    if (!queueItems || !Array.isArray(queueItems)) {
      return NextResponse.json(
        { success: false, error: 'Queue items array is required' },
        { status: 400 }
      );
    }

    const result: ProcessResult = {
      success: true,
      processed: 0,
      failed: 0,
      rateLimitReached: false,
      remainingCalls: MAX_CALLS_PER_DAY,
      errors: [],
    };

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Get current rate limit count from request body (passed from client)
    const { currentRateLimit = 0 } = await request.json();
    let apiCallsToday = currentRateLimit;

    // Process each queue item
    for (const item of queueItems) {
      // Check if we've hit the rate limit
      if (apiCallsToday >= MAX_CALLS_PER_DAY) {
        result.rateLimitReached = true;
        result.remainingCalls = 0;
        break;
      }

      try {
        // Call GoCollect API
        const goCollectResponse = await fetch(`${request.nextUrl.origin}/api/gocollect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcode: item.comic.barcode }),
        });

        if (goCollectResponse.ok) {
          const goCollectData = await goCollectResponse.json();

          if (goCollectData.success && goCollectData.data) {
            // Update comic with GoCollect data
            item.comic.title = goCollectData.data.title;
            item.comic.issue = goCollectData.data.issue;
            item.comic.publisher = goCollectData.data.publisher;
            item.comic.year = goCollectData.data.year;
            item.comic.goCollectUrl = goCollectData.data.url;

            // Get price for the comic's condition
            const prices = goCollectData.data.prices || {};
            item.comic.usdValue = prices[item.comic.condition];

            // Convert USD to GBP (approximate - you may want to use a real exchange rate API)
            if (item.comic.usdValue) {
              item.comic.gbpValue = item.comic.usdValue * 0.79; // Rough conversion
            }

            apiCallsToday++;

            // Call Google Sheets API
            const sheetsResponse = await fetch(`${request.nextUrl.origin}/api/sheets`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ comic: item.comic }),
            });

            if (sheetsResponse.ok) {
              item.comic.processed = true;
              item.status = 'completed';
              result.processed++;
            } else {
              throw new Error('Failed to add to Google Sheets');
            }
          } else {
            throw new Error(goCollectData.error || 'GoCollect returned no data');
          }
        } else if (goCollectResponse.status === 429) {
          result.rateLimitReached = true;
          result.remainingCalls = 0;
          break;
        } else {
          throw new Error(`GoCollect API error: ${goCollectResponse.status}`);
        }
      } catch (error: any) {
        item.status = 'error';
        item.lastError = error.message;
        item.retryCount++;
        result.failed++;
        result.errors.push(`${item.comic.barcode}: ${error.message}`);
      }
    }

    result.remainingCalls = MAX_CALLS_PER_DAY - apiCallsToday;

    return NextResponse.json({
      success: true,
      result,
      updatedItems: queueItems,
      rateLimit: {
        id: today,
        count: apiCallsToday,
        lastUpdated: new Date(),
      },
    });

  } catch (error: any) {
    console.error('Queue processor error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process queue' },
      { status: 500 }
    );
  }
}
