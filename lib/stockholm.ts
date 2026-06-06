// Treats "YYYY-MM-DDTHH:MM" as Europe/Stockholm wall-clock time
// and returns the corresponding UTC instant. Used to interpret
// <input type="datetime-local"> values from the form, since
// datetime-local values carry no timezone.
export function parseStockholmDateTime(localStr: string): Date {
  const naive = new Date(`${localStr}:00Z`);
  if (Number.isNaN(naive.getTime())) {
    throw new RangeError(`invalid datetime: ${localStr}`);
  }
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Stockholm",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(naive);
  const get = (t: string) =>
    parseInt(parts.find((p) => p.type === t)!.value, 10);
  const stockholmWallUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  const offset = stockholmWallUtc - naive.getTime();
  return new Date(naive.getTime() - offset);
}

// "YYYY-MM-DD" for the Stockholm date of `d`.
export function stockholmDateStr(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${day}`;
}

// "Mon" .. "Sun" for the Stockholm weekday of `d`.
export function stockholmWeekdayShort(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Stockholm",
    weekday: "short",
  }).format(d);
}

// Swedish long date for `d` in Stockholm time — e.g. "5 juni".
// Used for human-readable subject suffixes / display contexts.
export function stockholmLongDate(d: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    day: "numeric",
    month: "long",
  }).format(d);
}

// Calendar-only date arithmetic: returns dateStr + daysOffset as
// "YYYY-MM-DD". Used to walk week boundaries via date strings so the
// downstream parseStockholmDateTime picks up DST-correct offsets per
// day. Adding/subtracting fixed milliseconds across DST transitions
// would land the wrong wall-clock day twice a year.
export function addDaysToDateStr(dateStr: string, daysOffset: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d);
  const shifted = new Date(utc + daysOffset * 86_400_000);
  return shifted.toISOString().slice(0, 10);
}
