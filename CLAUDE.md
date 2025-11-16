# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Comic Collection Scanner PWA - A Next.js app for cataloging comic books by scanning UPC barcodes, fetching pricing from GoCollect API, and syncing to Google Sheets. Multi-user support via Clerk for tracking who scanned each comic.

## Development Commands

```bash
# Development (must use --webpack due to next-pwa)
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

**Important:** Always use `npm run dev` which includes the `--webpack` flag. Turbopack is NOT compatible with next-pwa.

## Architecture

### Data Flow

1. **Scan → Queue → API → Sheet**
   - User scans barcode (QuaggaJS) or enters manually
   - Comic saved to IndexedDB queue (Dexie) with user info from Clerk
   - Queue processor calls GoCollect API (rate limited: 100/day)
   - Results written to Google Sheets

2. **Offline-First Design**
   - All scans save to IndexedDB immediately
   - Processing happens when online
   - PWA enables offline capability

### Key Technical Decisions

**Comic Book Barcodes:**
- Format: UPC-A (12 digits) + 5-digit supplement
- Supplement encodes: Issue number (2) + Variant/printing (3)
- Example: `76194134182400111` = DC Comics, Issue #1, Direct Market
- QuaggaJS configured for UPC-A, EAN, UPC-E formats

**Authentication & Multi-User:**
- Clerk tracks who scanned each comic
- Every Comic record includes: `scannedBy`, `scannedByName`, `scannedByEmail`
- Google Sheet has "Scanned By" column for attribution

**Rate Limiting:**
- GoCollect Pro: 100 API calls/day limit
- Queue processor must track daily quota in IndexedDB
- Should process oldest items first, respecting limit

**Google Sheets Integration:**
- Service Account authentication (not OAuth)
- Sheet columns: Title, Issue, Year, Publisher, Condition, USD Value, GBP Value, Scan Date, GoCollect Link, Scanned By, Notes
- Service account email must have Editor access to target sheet

### Design System

**Unique Aesthetic - Vintage Comic Book / Newsprint:**
- Color palette: CMYK printing colors (cyan: #00D4FF, magenta: #FF006E, yellow: #FFD93D, black: #1a1a1a)
- Background: Cream newsprint (#F5F1E8) with grid texture
- Fonts:
  - Bebas Neue (all-caps headlines, comic book style)
  - Courier Prime (monospace for data/forms)
- Visual style: Heavy 4px black borders, halftone dot patterns, hard box shadows (no gradients)
- Interaction: Translation on hover (not scale/fade), flatten effect on press

**DO NOT revert to generic design patterns:**
- Avoid Inter/Roboto/system fonts
- Avoid subtle rounded corners and soft shadows
- Keep bold borders and flat colors
- Maintain comic book aesthetic throughout

### Environment Variables

Required in `.env.local`:
```
GOCOLLECT_API_KEY=           # GoCollect Pro API key
GOOGLE_SHEETS_CLIENT_ID=     # From service account JSON
GOOGLE_SHEETS_CLIENT_SECRET= # Private key from service account JSON (includes BEGIN/END markers)
GOOGLE_SHEET_ID=             # From spreadsheet URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### TypeScript Types

Core interfaces in `lib/types.ts`:

- **Comic**: Full comic metadata including user tracking fields
- **QueueItem**: Wraps Comic with processing status
- **ConditionGrade**: Union type for comic conditions (PR | GD | FN | VF | NM | MT)

### Database (IndexedDB via Dexie)

Schema in `lib/db.ts`:
- `queue` table: Stores QueueItem objects indexed by id, barcode, status, scanDate
- Client-side only, no backend database

### API Routes (To Be Implemented)

**1. `/api/gocollect/route.ts`**
- POST endpoint
- Input: `{ barcode: string }`
- Calls GoCollect API: `https://api.gocollect.com/v1/collectibles`
- Auth: Bearer token from `GOCOLLECT_API_KEY`
- Returns: Comic metadata (title, issue, publisher, year) + pricing by condition grade
- Error handling: Invalid barcode, API errors, rate limits

**2. `/api/sheets/route.ts`**
- POST endpoint
- Input: Comic object with all fields populated
- Uses `google-spreadsheet` npm package (needs to be installed)
- Service Account auth with `GOOGLE_SHEETS_CLIENT_ID` and `GOOGLE_SHEETS_CLIENT_SECRET`
- Appends row to sheet: [Title, Issue, Year, Publisher, Condition, USD, GBP, Date, URL, Scanned By, Notes]
- Must use `auth.protect()` from Clerk to ensure authenticated

**3. `/api/queue/process/route.ts`**
- POST endpoint
- Protected with Clerk auth
- Fetches all `pending` items from IndexedDB queue
- Checks rate limit: Query/store daily API call count in IndexedDB (max 100)
- For each pending item (up to remaining quota):
  - Call `/api/gocollect` with barcode
  - Extract price for item's condition grade
  - Call `/api/sheets` to write row
  - Update QueueItem status to 'completed' or 'error'
- Returns: { processed: number, remaining: number, errors: string[] }

### Current Implementation Status

**Phase 1 Complete:**
- ✅ Barcode scanner (QuaggaJS integration)
- ✅ Manual entry fallback
- ✅ IndexedDB queue storage
- ✅ PWA manifest and config
- ✅ Clerk authentication
- ✅ User tracking in Comic data

**Phase 2 In Progress:**
- ⏳ Install `google-spreadsheet` package
- ⏳ Build `/api/gocollect/route.ts` (test with sample barcode first)
- ⏳ Build `/api/sheets/route.ts` (test writing one row)
- ⏳ Build `/api/queue/process/route.ts` (ties everything together)
- ⏳ Add rate limit tracking table to IndexedDB schema
- ⏳ Build queue management page at `/app/queue/page.tsx`
- ⏳ Add "Process Queue" button with status display
- ⏳ Show rate limit info (X/100 remaining today)

**Phase 3 Planned:**
- Collection browser
- Statistics dashboard
- Export features

## Important Notes

- QuaggaJS can be finicky with camera permissions on iOS - test thoroughly
- Comic barcodes are small and need good lighting
- The 5-digit supplement is critical for identifying specific issues/variants
- PWA requires HTTPS in production (localhost works for development)
- Service worker files are auto-generated by next-pwa in `/public`
