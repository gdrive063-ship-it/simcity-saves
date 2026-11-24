// format.js - Formats numbers, dates, and Vij delta currency values

export function formatNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return '0';
  }
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatCurrency(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return '∆0';
  }
  const absFormatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Math.abs(num));
  return num < 0 ? `-∆${absFormatted}` : `∆${absFormatted}`;
}

export function formatDate(value) {
  if (!value) {
    return 'Unknown date';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown date';
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsed);
}

export function formatDownloads(count) {
  const num = Number.isFinite(Number(count)) ? Math.max(0, Number(count)) : 0;
  const formatted = formatNumber(num);
  return num === 1 ? `${formatted} download` : `${formatted} downloads`;
}
