# Comic Collection Scanner PWA

A Progressive Web App for scanning comic book barcodes, fetching pricing data from GoCollect, and managing your collection in Google Sheets.

## Features

- 📷 **Barcode Scanning** - Use your device camera to scan comic book barcodes (UPC + 5-digit supplement)
- 👥 **Multi-User Support** - Clerk authentication tracks who scanned each comic
- 💾 **Offline First** - Scans saved locally, processed when online
- 📊 **Auto Pricing** - Fetches current market values from GoCollect API
- 📱 **PWA Support** - Install to home screen, works offline
- 🔄 **Google Sheets Sync** - Automatically populates your collection spreadsheet
- ⚡ **Rate Limiting** - Handles GoCollect's 100 calls/day limit gracefully
- 🎨 **Vintage Comic Aesthetic** - Bold CMYK colors, halftone patterns, newsprint texture

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Clerk (authentication)
- QuaggaJS (barcode scanning)
- next-pwa (PWA support)
- Dexie.js (IndexedDB)
- GoCollect API
- Google Sheets API

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Clerk account (free tier works)
- GoCollect API key (Pro tier)
- Google Sheets API credentials (Service Account)
- A Google Sheet to sync data to

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.local.example` to `.env.local` and fill in your API keys:

```bash
cp .env.local.example .env.local
```

4. Run the development server (must use webpack mode):

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

**Note:** The project uses webpack mode (not Turbopack) due to next-pwa compatibility requirements.

### Building for Production

```bash
npm run build
npm start
```

## Usage

### Scanning Comics

1. Navigate to the Scan page
2. Allow camera permissions
3. Point camera at comic barcode
4. Select condition grade
5. Add optional notes
6. Click "Add to Queue"

### Manual Entry

If camera scanning fails, use the Manual Entry tab to type barcodes directly.

### Processing Queue

1. Navigate to the Queue page
2. Review pending comics
3. Click "Process Queue" to:
   - Fetch metadata from GoCollect API
   - Get pricing by condition grade
   - Sync to Google Sheets automatically
4. Monitor rate limit (100 API calls/day)

Comics are queued locally and processed when you're ready, respecting the API limit.

## Project Structure

```
comic-scanner/
├── app/
│   ├── api/
│   │   ├── gocollect/route.ts    # GoCollect API integration
│   │   ├── sheets/route.ts       # Google Sheets sync
│   │   └── queue/process/route.ts # Queue processor
│   ├── queue/         # Queue management page
│   ├── scan/          # Scan page
│   ├── layout.tsx     # Root layout with Clerk
│   └── page.tsx       # Home page
├── components/
│   └── BarcodeScanner.tsx
├── lib/
│   ├── db.ts          # IndexedDB with rate limiting
│   ├── types.ts       # TypeScript interfaces
│   └── utils.ts       # Helper functions
├── middleware.ts      # Clerk authentication
└── public/
    └── manifest.json  # PWA manifest
```

## Roadmap

### Phase 1 ✅ Complete
- ✅ Barcode scanner (camera + manual)
- ✅ Manual entry
- ✅ Local queue storage (IndexedDB)
- ✅ PWA setup
- ✅ Clerk authentication
- ✅ Vintage comic book design

### Phase 2 ✅ Complete
- ✅ GoCollect API integration
- ✅ Google Sheets API integration
- ✅ Queue processor with auto-sync
- ✅ Rate limiting (100 calls/day)
- ✅ Queue management UI

### Phase 3 (Future)
- [ ] Collection view page
- [ ] Statistics dashboard
- [ ] Export features (CSV, PDF)
- [ ] Search and filter
- [ ] Bulk operations
- [ ] Price tracking over time

## Notes

- Comic barcodes include a 5-digit supplement that identifies issue number and variants
- Ensure good lighting when scanning
- The app works offline - scans are saved locally
- Only 100 comics can be processed per day (GoCollect API limit)

## License

ISC
