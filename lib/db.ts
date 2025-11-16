import Dexie, { Table } from 'dexie';
import { QueueItem, RateLimit } from './types';

export class ComicDatabase extends Dexie {
  queue!: Table<QueueItem, string>;
  rateLimits!: Table<RateLimit, string>;

  constructor() {
    super('ComicScannerDB');
    this.version(1).stores({
      queue: 'id, comic.barcode, status, comic.scanDate'
    });
    // Add rate limits table in version 2
    this.version(2).stores({
      queue: 'id, comic.barcode, status, comic.scanDate',
      rateLimits: 'id, lastUpdated'
    });
  }
}

export const db = new ComicDatabase();
