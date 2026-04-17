/**
 * Generates an ordered array of month labels (e.g. "Apr-24") covering the
 * organisation's reporting period.
 *
 * @param {string|Date} from  - Period start date  (e.g. "2024-04-01")
 * @param {string|Date} to    - Period end date    (e.g. "2025-03-31")
 * @returns {string[]}  e.g. ["Apr-24","May-24", … ,"Mar-25"]
 */
export function getReportingMonths(from, to) {
  const start = new Date(from);
  const end = new Date(to);

  const months = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  while (cursor <= end) {
    const label = cursor.toLocaleString('en-GB', { month: 'short' });
    const year = String(cursor.getFullYear()).slice(-2);
    months.push(`${label}-${year}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

/**
 * Fallback: current financial year (April → March).
 * Used when the org's reporting period hasn't loaded yet.
 */
export function getCurrentFinancialYearMonths() {
  const now = new Date();
  // Financial year starts April — if current month < April, go back a year
  const startYear = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  const from = new Date(startYear, 3, 1);       // April 1
  const to = new Date(startYear + 1, 2, 31);    // March 31 next year
  return getReportingMonths(from, to);
}
