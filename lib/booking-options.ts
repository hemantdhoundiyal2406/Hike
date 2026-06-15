export const meetingTopics = [
  "Discovery call",
  "Website redesign",
  "E-commerce growth",
  "Brand strategy",
  "Retainer support",
  "Launch planning",
] as const;

export const weekdayAvailability = {
  1: ["09:30", "11:00", "14:00", "16:00"],
  2: ["10:00", "12:00", "15:00"],
  3: ["09:30", "11:30", "14:30", "16:30"],
  4: ["10:00", "13:00", "15:30"],
  5: ["09:30", "11:00", "13:30"],
} as const;

export const bookingWindow = {
  minDateOffsetDays: 0,
  maxMonthsAhead: 3,
  timezone: "Asia/Kolkata",
} as const;

export const availableTimeSlots = Array.from(
  new Set(Object.values(weekdayAvailability).flat())
).sort();

export function getAllowedTimeSlots(date: Date): readonly string[] {
  return weekdayAvailability[date.getDay() as keyof typeof weekdayAvailability] ?? [];
}

export function isBookableDate(date: Date, today = new Date()) {
  const candidate = new Date(date);
  const baseline = new Date(today);
  baseline.setHours(0, 0, 0, 0);
  candidate.setHours(0, 0, 0, 0);

  if (candidate < baseline) return false;
  if ([0, 6].includes(candidate.getDay())) return false;

  const maxDate = new Date(baseline);
  maxDate.setMonth(maxDate.getMonth() + bookingWindow.maxMonthsAhead);
  maxDate.setHours(23, 59, 59, 999);

  return candidate <= maxDate;
}
