import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatCurrency(value: number, currency: 'USD' | 'GBP'): string {
  const symbol = currency === 'USD' ? '$' : '£';
  return `${symbol}${value.toFixed(2)}`;
}
