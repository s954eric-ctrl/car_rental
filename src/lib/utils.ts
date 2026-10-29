export function formatCedi(amount: number): string {
  return `GH\u20B5 ${amount.toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function daysBetween(start: string | Date, end: string | Date): number {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateKeyCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function maskLicense(license: string): string {
  if (license.length < 4) return license;
  return `${license.slice(0, 4)}\u2022\u2022\u2022${license.slice(-1)}`;
}

export const PAYMENT_METHODS = [
  { id: 'mtn_momo', label: 'MTN MoMo', description: 'Pay via MTN Mobile Money', icon: 'phone' },
  { id: 'telecel_cash', label: 'Telecel Cash', description: 'Pay via Telecel Cash', icon: 'phone' },
  { id: 'at_money', label: 'AT Money', description: 'Pay via AirtelTigo Money', icon: 'phone' },
  { id: 'card', label: 'Bank Card', description: 'Visa / Mastercard (3D Secure)', icon: 'card' },
  { id: 'pay_on_pickup', label: 'Pay on Pickup', description: 'Pay at the depot on collection', icon: 'wallet' },
];

export const PICKUP_HUBS = [
  'Kotoka Airport T3 Terminal Bay',
  'East Legon Depot',
  'Residence Delivery',
];

export const RETURN_HUBS = [
  'Kotoka International Airport',
  'Kumasi Central',
  'Takoradi Depot',
];
