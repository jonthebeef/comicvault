import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: "Comic Collection Scanner",
  description: "Scan and value your comic collection",
  manifest: "/manifest.json",
  themeColor: "#DC2626",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ComicScan",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased min-h-screen">
        <header className="border-b-4 border-black relative overflow-hidden" style={{backgroundColor: 'var(--comic-yellow)'}}>
          <div className="absolute inset-0 halftone-bg"></div>
          <div className="container mx-auto px-4 py-4 relative">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-black rotate-3 transition-transform group-hover:rotate-6"></div>
                  <div className="absolute inset-0 w-12 h-12 border-4 border-black -rotate-3 flex items-center justify-center transition-transform group-hover:-rotate-6" style={{backgroundColor: 'var(--comic-magenta)'}}>
                    <span className="text-2xl font-black text-white" style={{fontFamily: 'Bebas Neue, sans-serif'}}>C</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight" style={{fontFamily: 'Bebas Neue, sans-serif', color: 'var(--comic-black)'}}>
                    COMIC VAULT
                  </h1>
                  <p className="text-xs uppercase tracking-widest" style={{color: 'var(--comic-black)'}}>
                    Issue #001
                  </p>
                </div>
              </Link>
              <nav className="flex items-center gap-3">
                <Link
                  href="/scan"
                  className="px-4 py-2 bg-black text-white font-bold uppercase text-sm border-2 border-black transition-all hover:translate-x-0.5 hover:translate-y-0.5"
                  style={{fontFamily: 'Bebas Neue, sans-serif', boxShadow: '4px 4px 0 var(--comic-cyan)'}}
                >
                  Scan
                </Link>
                <Link
                  href="/queue"
                  className="px-4 py-2 bg-white font-bold uppercase text-sm border-2 border-black transition-all hover:translate-x-0.5 hover:translate-y-0.5"
                  style={{fontFamily: 'Bebas Neue, sans-serif', boxShadow: '4px 4px 0 var(--comic-magenta)'}}
                >
                  Queue
                </Link>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button
                      className="px-4 py-2 bg-white border-4 border-black font-bold uppercase text-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5"
                      style={{fontFamily: 'Bebas Neue, sans-serif', boxShadow: '4px 4px 0 var(--comic-magenta)'}}
                    >
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 border-4 border-black"
                      }
                    }}
                  />
                </SignedIn>
              </nav>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
