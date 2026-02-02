/**
 * Date helpers for leave conflict, payroll month, etc.
 */

/**
 * Check if two date ranges overlap (inclusive).
 */
function dateRangesOverlap(start1, end1, start2, end2) {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();
  return s1 <= e2 && e1 >= s2;
}

/**
 * Get start and end of month for given year/month.
 */
function getMonthBounds(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Count working days between two dates (excludes weekends; optional exclude holidays).
 */
function countWorkingDays(from, to, excludeDates = []) {
  const fromD = new Date(from);
  const toD = new Date(to);
  let count = 0;
  const set = new Set(excludeDates.map((d) => new Date(d).toDateString()));
  for (let d = new Date(fromD); d <= toD; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6 && !set.has(d.toDateString())) count++;
  }
  return count;
}

/**
 * Add minutes to a date.
 */
function addMinutes(date, minutes) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

/**
 * Difference in minutes between two dates.
 */
function diffMinutes(date1, date2) {
  return Math.round((new Date(date1) - new Date(date2)) / (60 * 1000));
}

module.exports = { dateRangesOverlap, getMonthBounds, countWorkingDays, addMinutes, diffMinutes };
