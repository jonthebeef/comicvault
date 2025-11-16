'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import BarcodeScanner from '@/components/BarcodeScanner';
import { db } from '@/lib/db';
import { Comic, QueueItem, CONDITION_GRADES, ConditionGrade } from '@/lib/types';
import { generateId } from '@/lib/utils';

export default function ScanPage() {
  const { user, isLoaded } = useUser();
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [condition, setCondition] = useState<ConditionGrade>('VF');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  const handleBarcodeDetected = (barcode: string) => {
    setScannedBarcode(barcode);
    setError('');
    setSuccess(`Barcode detected: ${barcode}`);
  };

  const handleScanError = (errorMsg: string) => {
    setError(errorMsg);
    setSuccess('');
  };

  const saveToQueue = async () => {
    const barcodeToSave = isManualEntry ? manualBarcode : scannedBarcode;

    if (!barcodeToSave) {
      setError('No barcode to save');
      return;
    }

    if (!user) {
      setError('You must be signed in to save comics');
      return;
    }

    try {
      const comic: Comic = {
        id: generateId(),
        barcode: barcodeToSave,
        condition,
        scanDate: new Date(),
        processed: false,
        notes: notes || undefined,
        scannedBy: user.id,
        scannedByName: user.fullName || user.username || 'Unknown',
        scannedByEmail: user.primaryEmailAddress?.emailAddress,
      };

      const queueItem: QueueItem = {
        id: generateId(),
        comic,
        status: 'pending',
        retryCount: 0,
      };

      await db.queue.add(queueItem);

      setSuccess(`Comic added to queue! Barcode: ${barcodeToSave}`);
      setScannedBarcode('');
      setManualBarcode('');
      setNotes('');
      setError('');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(`Failed to save: ${err.message}`);
      setSuccess('');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      setScannedBarcode(manualBarcode);
      setSuccess(`Manual barcode entered: ${manualBarcode}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-in">
        <h2
          className="text-5xl font-black uppercase mb-2"
          style={{
            fontFamily: 'Bebas Neue, sans-serif',
            color: 'var(--comic-black)',
            textShadow: '3px 3px 0 var(--comic-yellow)'
          }}
        >
          Scan Mode
        </h2>
        {user && (
          <p className="font-bold uppercase tracking-wide">
            Scanning as: <span style={{color: 'var(--comic-magenta)'}}>{user.fullName || user.username}</span>
          </p>
        )}
        {!user && isLoaded && (
          <p className="font-bold uppercase tracking-wide" style={{color: 'var(--comic-magenta)'}}>
            Sign in to start scanning
          </p>
        )}
      </div>

      {/* Toggle */}
      <div className="flex gap-3 mb-6" style={{animation: 'slideIn 0.4s ease-out 0.1s backwards'}}>
        <button
          onClick={() => setIsManualEntry(false)}
          className={`flex-1 py-3 px-6 font-black uppercase border-4 border-black transition-all ${
            !isManualEntry
              ? 'translate-x-0 translate-y-0'
              : 'hover:translate-x-0.5 hover:translate-y-0.5'
          }`}
          style={{
            fontFamily: 'Bebas Neue, sans-serif',
            backgroundColor: !isManualEntry ? 'var(--comic-magenta)' : 'white',
            color: !isManualEntry ? 'white' : 'var(--comic-black)',
            boxShadow: !isManualEntry ? '0 0 0 var(--comic-black)' : '4px 4px 0 var(--comic-black)'
          }}
        >
          📷 Camera
        </button>
        <button
          onClick={() => setIsManualEntry(true)}
          className={`flex-1 py-3 px-6 font-black uppercase border-4 border-black transition-all ${
            isManualEntry
              ? 'translate-x-0 translate-y-0'
              : 'hover:translate-x-0.5 hover:translate-y-0.5'
          }`}
          style={{
            fontFamily: 'Bebas Neue, sans-serif',
            backgroundColor: isManualEntry ? 'var(--comic-magenta)' : 'white',
            color: isManualEntry ? 'white' : 'var(--comic-black)',
            boxShadow: isManualEntry ? '0 0 0 var(--comic-black)' : '4px 4px 0 var(--comic-black)'
          }}
        >
          ⌨️ Manual
        </button>
      </div>

      {/* Scanner or Manual Entry */}
      <div className="mb-6">
        {!isManualEntry ? (
          <BarcodeScanner onDetected={handleBarcodeDetected} onError={handleScanError} />
        ) : (
          <div className="border-4 border-black p-6 bg-white">
            <form onSubmit={handleManualSubmit}>
              <label htmlFor="manualBarcode" className="block font-black uppercase mb-3 text-lg" style={{fontFamily: 'Bebas Neue, sans-serif'}}>
                Enter Barcode
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  id="manualBarcode"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="76194134182400111"
                  className="flex-1 border-4 border-black px-4 py-3 font-bold focus:outline-none"
                  style={{fontFamily: 'Courier Prime, monospace'}}
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-black text-white font-black uppercase border-4 border-black transition-all hover:translate-x-0.5 hover:translate-y-0.5"
                  style={{
                    fontFamily: 'Bebas Neue, sans-serif',
                    boxShadow: '4px 4px 0 var(--comic-yellow)'
                  }}
                >
                  Add
                </button>
              </div>
              <p className="text-xs uppercase mt-3 font-bold tracking-wide">
                UPC + 5-digit supplement required
              </p>
            </form>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 border-4 border-black p-4 bg-white">
          <p className="font-bold uppercase text-sm" style={{color: 'var(--comic-magenta)'}}>⚠️ {error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 border-4 border-black p-4" style={{backgroundColor: 'var(--comic-yellow)'}}>
          <p className="font-bold uppercase text-sm">✓ {success}</p>
        </div>
      )}

      {/* Comic Details Form */}
      {scannedBarcode && (
        <div className="border-4 border-black p-6 mb-6 relative overflow-hidden" style={{backgroundColor: 'var(--comic-cyan)'}}>
          <div className="absolute top-0 right-0 w-32 h-32 halftone-bg"></div>
          <h3 className="text-3xl font-black uppercase mb-4 relative" style={{fontFamily: 'Bebas Neue, sans-serif'}}>
            Comic Details
          </h3>

          <div className="space-y-4 relative">
            <div>
              <label htmlFor="condition" className="block font-black uppercase mb-2" style={{fontFamily: 'Bebas Neue, sans-serif'}}>
                Condition Grade
              </label>
              <select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value as ConditionGrade)}
                className="w-full border-4 border-black px-4 py-3 font-bold bg-white focus:outline-none"
                style={{fontFamily: 'Courier Prime, monospace'}}
              >
                {CONDITION_GRADES.map((grade) => (
                  <option key={grade.value} value={grade.value}>
                    {grade.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block font-black uppercase mb-2" style={{fontFamily: 'Bebas Neue, sans-serif'}}>
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
                className="w-full border-4 border-black px-4 py-3 font-bold bg-white focus:outline-none resize-none"
                style={{fontFamily: 'Courier Prime, monospace'}}
              />
            </div>

            <button
              onClick={saveToQueue}
              className="w-full py-4 bg-black text-white font-black uppercase border-4 border-black transition-all hover:translate-x-1 hover:translate-y-1"
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                boxShadow: '6px 6px 0 var(--comic-magenta)',
                fontSize: '1.25rem'
              }}
            >
              💾 Save to Queue
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="border-4 border-black p-5 bg-white">
        <h3 className="font-black uppercase mb-3" style={{fontFamily: 'Bebas Neue, sans-serif'}}>Pro Tips</h3>
        <ul className="space-y-2 text-sm font-bold">
          <li className="flex gap-2">
            <span>💡</span>
            <span>Good lighting = better scans</span>
          </li>
          <li className="flex gap-2">
            <span>🔢</span>
            <span>UPC + 5-digit supplement required</span>
          </li>
          <li className="flex gap-2">
            <span>📱</span>
            <span>Works offline, syncs when connected</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
