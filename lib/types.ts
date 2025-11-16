export interface Comic {
  id: string;
  barcode: string;
  title?: string;
  issue?: string;
  year?: string;
  publisher?: string;
  condition: 'PR' | 'GD' | 'FN' | 'VF' | 'NM' | 'MT';
  usdValue?: number;
  gbpValue?: number;
  scanDate: Date;
  processed: boolean;
  goCollectUrl?: string;
  notes?: string;
  // User tracking
  scannedBy: string;          // Clerk user ID
  scannedByName: string;      // User's display name
  scannedByEmail?: string;    // User's email (optional)
}

export interface QueueItem {
  id: string;
  comic: Comic;
  status: 'pending' | 'processing' | 'completed' | 'error';
  retryCount: number;
  lastError?: string;
}

export type ConditionGrade = 'PR' | 'GD' | 'FN' | 'VF' | 'NM' | 'MT';

export const CONDITION_GRADES: { value: ConditionGrade; label: string }[] = [
  { value: 'PR', label: 'Poor (PR)' },
  { value: 'GD', label: 'Good (GD)' },
  { value: 'FN', label: 'Fine (FN)' },
  { value: 'VF', label: 'Very Fine (VF)' },
  { value: 'NM', label: 'Near Mint (NM)' },
  { value: 'MT', label: 'Mint (MT)' },
];

export interface RateLimit {
  id: string;           // Date in YYYY-MM-DD format
  count: number;        // Number of API calls made
  lastUpdated: Date;    // Last time this was updated
}
