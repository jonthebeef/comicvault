import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <div className="mb-12 animate-slide-in">
        <div className="relative inline-block mb-4">
          <h2
            className="text-7xl font-black uppercase tracking-tight relative z-10"
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              color: 'var(--comic-black)',
              textShadow: '4px 4px 0 var(--comic-cyan), 8px 8px 0 var(--comic-magenta)'
            }}
          >
            Your Collection,
            <br />
            Catalogued
          </h2>
        </div>
        <p className="text-lg max-w-2xl font-bold uppercase tracking-wide" style={{color: 'var(--ink)'}}>
          Scan barcodes → Get prices → Track value
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Main CTA */}
        <Link
          href="/scan"
          className="relative border-4 border-black p-8 transition-all hover:translate-x-1 hover:translate-y-1 group overflow-hidden"
          style={{
            backgroundColor: 'var(--comic-magenta)',
            boxShadow: '8px 8px 0 var(--comic-black)',
            animation: 'slideIn 0.4s ease-out'
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 halftone-bg"></div>
          <div className="relative">
            <h3 className="text-4xl font-black uppercase mb-2 text-white" style={{fontFamily: 'Bebas Neue, sans-serif'}}>
              Start Scanning
            </h3>
            <p className="text-white font-bold uppercase text-sm tracking-wide mb-4">
              Camera or manual entry
            </p>
            <div className="inline-block px-4 py-2 bg-white border-2 border-black font-black uppercase" style={{fontFamily: 'Bebas Neue, sans-serif'}}>
              Begin →
            </div>
          </div>
        </Link>

        {/* Secondary cards */}
        <div className="space-y-4" style={{animation: 'slideIn 0.4s ease-out 0.1s backwards'}}>
          <div className="border-4 border-black p-6 bg-white">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-black flex items-center justify-center">
                <span className="text-white text-xl">📋</span>
              </div>
              <div>
                <h3 className="font-black uppercase text-lg mb-1" style={{fontFamily: 'Bebas Neue, sans-serif'}}>Queue</h3>
                <p className="text-sm">Pending scans waiting for sync</p>
              </div>
            </div>
          </div>

          <div className="border-4 border-black p-6 bg-white">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-black flex items-center justify-center">
                <span className="text-white text-xl">📚</span>
              </div>
              <div>
                <h3 className="font-black uppercase text-lg mb-1" style={{fontFamily: 'Bebas Neue, sans-serif'}}>Collection</h3>
                <p className="text-sm">Browse your valued comics</p>
              </div>
            </div>
          </div>

          <div className="border-4 border-black p-6 bg-white">
            <div className="w-8 h-8 bg-black flex items-center justify-center mb-2">
              <span className="text-white text-xl">📊</span>
            </div>
            <h3 className="font-black uppercase text-lg mb-1" style={{fontFamily: 'Bebas Neue, sans-serif'}}>Stats</h3>
            <p className="text-sm">Portfolio insights</p>
          </div>
        </div>
      </div>

      {/* Info panel */}
      <div
        className="border-4 border-black p-8 relative overflow-hidden"
        style={{
          backgroundColor: 'var(--comic-cyan)',
          animation: 'slideIn 0.4s ease-out 0.2s backwards'
        }}
      >
        <div className="absolute bottom-0 left-0 w-full h-24 halftone-bg"></div>
        <h3 className="text-3xl font-black uppercase mb-4" style={{fontFamily: 'Bebas Neue, sans-serif'}}>
          How It Works
        </h3>
        <div className="grid md:grid-cols-3 gap-6 relative">
          <div>
            <div className="text-6xl font-black mb-2" style={{fontFamily: 'Bebas Neue, sans-serif', color: 'var(--comic-black)'}}>01</div>
            <p className="font-bold">Scan UPC barcodes with your camera or type them in</p>
          </div>
          <div>
            <div className="text-6xl font-black mb-2" style={{fontFamily: 'Bebas Neue, sans-serif', color: 'var(--comic-black)'}}>02</div>
            <p className="font-bold">Set condition grade (PR through MT)</p>
          </div>
          <div>
            <div className="text-6xl font-black mb-2" style={{fontFamily: 'Bebas Neue, sans-serif', color: 'var(--comic-black)'}}>03</div>
            <p className="font-bold">Auto-sync pricing from GoCollect to Google Sheets</p>
          </div>
        </div>
      </div>
    </div>
  );
}
