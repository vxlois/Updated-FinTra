/**
 * Format numeric value to Philippine Peso (PHP) currency format
 */
export function formatPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Clean compact currency formatter for small badges/charts
 */
export function formatPHPCompact(amount: number): string {
  return '₱' + amount.toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Format system date to a uniform display style
 */
export function formatDate(dateString: string | Date): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) {
    return String(dateString); // fallback
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
