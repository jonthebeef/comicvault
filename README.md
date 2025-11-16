# Comic Collection Scanner PWA

A Progressive Web App for scanning comic book barcodes, fetching pricing data from GoCollect, and managing your collection in Google Sheets.

## Features

- 📷 **Barcode Scanning** - Use your device camera to scan comic book barcodes (UPC + 5-digit supplement)
- 💾 **Offline First** - Scans saved locally, processed when online
- 📊 **Auto Pricing** - Fetches current market values from GoCollect API
- 📱 **PWA Support** - Install to home screen, works offline
- 🔄 **Google Sheets Sync** - Automatically populates your collection spreadsheet
- ⚡ **Rate Limiting** - Handles GoCollect's 100 calls/day limit gracefully

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- QuaggaJS (barcode scanning)
- next-pwa (PWA support)
- Dexie.js (IndexedDB)
- GoCollect API
- Google Sheets API

## Getting Started

### Prerequisites

- Node.js 18+ installed
- GoCollect API key (Pro tier)
- Google Sheets API credentials
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

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

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

Comics are queued locally and processed automatically when online, respecting the 100/day API limit.

## Project Structure

```
comic-scanner/
├── app/
│   ├── api/           # API routes (coming soon)
│   ├── scan/          # Scan page
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page
├── components/
│   └── BarcodeScanner.tsx
├── lib/
│   ├── db.ts          # IndexedDB setup
│   ├── types.ts       # TypeScript interfaces
│   └── utils.ts       # Helper functions
└── public/
    └── manifest.json  # PWA manifest
```

## Roadmap

### Phase 1 (Current)
- ✅ Barcode scanner
- ✅ Manual entry
- ✅ Local queue storage
- ✅ PWA setup

### Phase 2 (Next)
- [ ] GoCollect API integration
- [ ] Google Sheets API integration
- [ ] Queue processor
- [ ] Rate limiting

### Phase 3 (Future)
- [ ] Collection view
- [ ] Statistics dashboard
- [ ] Export features
- [ ] Offline improvements

## Notes

- Comic barcodes include a 5-digit supplement that identifies issue number and variants
- Ensure good lighting when scanning
- The app works offline - scans are saved locally
- Only 100 comics can be processed per day (GoCollect API limit)

## License

ISC
