'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { QueueItem } from '@/lib/types';

export default function QueuePage() {
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<any>(null);
  const [rateLimit, setRateLimit] = useState<{ count: number; max: number }>({ count: 0, max: 100 });

  // Load queue items from IndexedDB
  const queueItems = useLiveQuery(() => db.queue.toArray()) || [];

  // Count by status
  const pendingCount = queueItems.filter(item => item.status === 'pending').length;
  const processingCount = queueItems.filter(item => item.status === 'processing').length;
  const completedCount = queueItems.filter(item => item.status === 'completed').length;
  const errorCount = queueItems.filter(item => item.status === 'error').length;

  // Load today's rate limit
  useEffect(() => {
    const loadRateLimit = async () => {
      const today = new Date().toISOString().split('T')[0];
      const limit = await db.rateLimits.get(today);
      if (limit) {
        setRateLimit({ count: limit.count, max: 100 });
      }
    };
    loadRateLimit();
  }, []);

  const processQueue = async () => {
    setProcessing(true);
    setProcessResult(null);

    try {
      // Get pending items
      const pending = await db.queue.where('status').equals('pending').toArray();

      if (pending.length === 0) {
        setProcessResult({ success: true, message: 'No pending items to process' });
        setProcessing(false);
        return;
      }

      // Call the process API
      const response = await fetch('/api/queue/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queueItems: pending,
          currentRateLimit: rateLimit.count
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update queue items in IndexedDB
        for (const item of data.updatedItems) {
          await db.queue.put(item);
        }

        // Update rate limit
        if (data.rateLimit) {
          await db.rateLimits.put(data.rateLimit);
          setRateLimit({ count: data.rateLimit.count, max: 100 });
        }

        setProcessResult(data.result);
      } else {
        setProcessResult({ success: false, error: data.error });
      }
    } catch (error: any) {
      setProcessResult({ success: false, error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  const clearCompleted = async () => {
    const completed = await db.queue.where('status').equals('completed').toArray();
    for (const item of completed) {
      await db.queue.delete(item.id);
    }
  };

  const retryErrors = async () => {
    const errors = await db.queue.where('status').equals('error').toArray();
    for (const item of errors) {
      item.status = 'pending';
      item.lastError = undefined;
      await db.queue.put(item);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-in">
        <h2
          className="text-5xl font-black uppercase mb-2"
          style={{
            fontFamily: 'Bebas Neue, sans-serif',
            color: 'var(--comic-black)',
            textShadow: '3px 3px 0 var(--comic-cyan)'
          }}
        >
          Queue Manager
        </h2>
        <p className="font-bold uppercase tracking-wide">
          Process your scanned comics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="border-4 border-black p-4 bg-white">
          <div className="text-3xl font-black" style={{ fontFamily: 'Bebas Neue, sans-serif', color: 'var(--comic-yellow)' }}>
            {pendingCount}
          </div>
          <div className="text-sm font-bold uppercase">Pending</div>
        </div>
        <div className="border-4 border-black p-4 bg-white">
          <div className="text-3xl font-black" style={{ fontFamily: 'Bebas Neue, sans-serif', color: 'var(--comic-cyan)' }}>
            {processingCount}
          </div>
          <div className="text-sm font-bold uppercase">Processing</div>
        </div>
        <div className="border-4 border-black p-4 bg-white">
          <div className="text-3xl font-black" style={{ fontFamily: 'Bebas Neue, sans-serif', color: 'var(--comic-magenta)' }}>
            {completedCount}
          </div>
          <div className="text-sm font-bold uppercase">Completed</div>
        </div>
        <div className="border-4 border-black p-4 bg-white">
          <div className="text-3xl font-black" style={{ fontFamily: 'Bebas Neue, sans-serif', color: 'var(--comic-black)' }}>
            {errorCount}
          </div>
          <div className="text-sm font-bold uppercase">Errors</div>
        </div>
      </div>

      {/* Rate Limit */}
      <div className="border-4 border-black p-5 mb-6" style={{ backgroundColor: 'var(--comic-yellow)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              API Rate Limit
            </h3>
            <p className="font-bold text-sm uppercase">
              {rateLimit.count} / {rateLimit.max} calls used today
            </p>
          </div>
          <div className="text-5xl font-black" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            {rateLimit.max - rateLimit.count}
          </div>
        </div>
        <div className="w-full bg-black h-4 mt-3 border-2 border-black">
          <div
            className="h-full transition-all"
            style={{
              width: `${(rateLimit.count / rateLimit.max) * 100}%`,
              backgroundColor: rateLimit.count >= rateLimit.max ? 'var(--comic-magenta)' : 'var(--comic-cyan)'
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={processQueue}
          disabled={processing || pendingCount === 0}
          className="flex-1 py-4 bg-black text-white font-black uppercase border-4 border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:translate-x-1 hover:translate-y-1"
          style={{
            fontFamily: 'Bebas Neue, sans-serif',
            boxShadow: processing ? '0 0 0 var(--comic-black)' : '6px 6px 0 var(--comic-magenta)',
            fontSize: '1.25rem'
          }}
        >
          {processing ? '⏳ Processing...' : '▶️ Process Queue'}
        </button>
        <button
          onClick={clearCompleted}
          disabled={completedCount === 0}
          className="px-6 py-4 bg-white font-black uppercase border-4 border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:translate-x-1 hover:translate-y-1"
          style={{
            fontFamily: 'Bebas Neue, sans-serif',
            boxShadow: '4px 4px 0 var(--comic-cyan)'
          }}
        >
          🗑️ Clear
        </button>
        <button
          onClick={retryErrors}
          disabled={errorCount === 0}
          className="px-6 py-4 bg-white font-black uppercase border-4 border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:translate-x-1 hover:translate-y-1"
          style={{
            fontFamily: 'Bebas Neue, sans-serif',
            boxShadow: '4px 4px 0 var(--comic-yellow)'
          }}
        >
          🔄 Retry
        </button>
      </div>

      {/* Process Result */}
      {processResult && (
        <div className={`border-4 border-black p-5 mb-6 ${processResult.success ? 'bg-white' : ''}`}
             style={processResult.success ? { backgroundColor: 'var(--comic-cyan)' } : { backgroundColor: 'var(--comic-magenta)' }}>
          <h3 className="text-2xl font-black uppercase mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            {processResult.success ? '✓ Processing Complete' : '⚠️ Error'}
          </h3>
          {processResult.message && (
            <p className="font-bold">{processResult.message}</p>
          )}
          {processResult.processed !== undefined && (
            <div className="space-y-1 font-bold text-sm">
              <p>✓ Processed: {processResult.processed}</p>
              <p>✗ Failed: {processResult.failed}</p>
              <p>📊 Remaining API calls: {processResult.remainingCalls}</p>
              {processResult.rateLimitReached && (
                <p className="text-white bg-black px-2 py-1 inline-block mt-2">⚠️ Rate limit reached!</p>
              )}
            </div>
          )}
          {processResult.error && (
            <p className="font-bold text-white">{processResult.error}</p>
          )}
          {processResult.errors && processResult.errors.length > 0 && (
            <div className="mt-3">
              <p className="font-black uppercase mb-2">Errors:</p>
              <ul className="space-y-1 text-sm font-bold">
                {processResult.errors.map((err: string, i: number) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Queue Items List */}
      <div className="border-4 border-black bg-white">
        <div className="p-5 border-b-4 border-black" style={{ backgroundColor: 'var(--comic-cyan)' }}>
          <h3 className="text-2xl font-black uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            Queue Items ({queueItems.length})
          </h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {queueItems.length === 0 ? (
            <div className="p-8 text-center font-bold uppercase">
              No items in queue. Start scanning!
            </div>
          ) : (
            <div className="divide-y-4 divide-black">
              {queueItems.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-black text-lg" style={{ fontFamily: 'Courier Prime, monospace' }}>
                        {item.comic.barcode}
                      </div>
                      <div className="text-sm font-bold mt-1">
                        {item.comic.title && <div>Title: {item.comic.title}</div>}
                        <div>Condition: {item.comic.condition}</div>
                        <div className="text-xs opacity-70">
                          Scanned by {item.comic.scannedByName} on {new Date(item.comic.scanDate).toLocaleDateString()}
                        </div>
                      </div>
                      {item.lastError && (
                        <div className="text-xs mt-2 p-2 border-2 border-black" style={{ backgroundColor: 'var(--comic-magenta)', color: 'white' }}>
                          Error: {item.lastError}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className={`px-3 py-1 border-2 border-black font-black text-xs uppercase`}
                            style={{
                              backgroundColor:
                                item.status === 'completed' ? 'var(--comic-cyan)' :
                                item.status === 'error' ? 'var(--comic-magenta)' :
                                item.status === 'processing' ? 'var(--comic-yellow)' : 'white'
                            }}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
