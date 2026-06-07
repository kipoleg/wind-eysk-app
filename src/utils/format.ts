import type { WindUnit } from '../types/weather';

export function formatTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatNumber(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: digits,
    minimumFractionDigits: value % 1 === 0 ? 0 : Math.min(1, digits)
  }).format(value);
}

export function convertWind(value: number | null | undefined, unit: WindUnit): number | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  if (unit === 'kmh') return value * 3.6;
  if (unit === 'knots') return value * 1.94384;
  return value;
}

export function windUnitLabel(unit: WindUnit): string {
  if (unit === 'kmh') return 'км/ч';
  if (unit === 'knots') return 'уз';
  return 'м/с';
}

export function formatWind(value: number | null | undefined, unit: WindUnit): string {
  return `${formatNumber(convertWind(value, unit), 1)} ${windUnitLabel(unit)}`;
}

export function formatTemp(value: number | null | undefined): string {
  return value === null || value === undefined || Number.isNaN(value)
    ? '—'
    : `${Math.round(value)}°`;
}
