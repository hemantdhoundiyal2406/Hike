import { randomUUID } from "node:crypto";
import type { BookingRecord } from "@/types/booking";

declare global {
  // eslint-disable-next-line no-var
  var novaforgeLocalBookings: BookingRecord[] | undefined;
}

const store = global.novaforgeLocalBookings ?? [];
global.novaforgeLocalBookings = store;

function cloneBooking(booking: BookingRecord) {
  return JSON.parse(JSON.stringify(booking)) as BookingRecord;
}

function sortByNewest(bookings: BookingRecord[]) {
  return [...bookings].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

function nowIso() {
  return new Date().toISOString();
}

export function listLocalBookings() {
  return sortByNewest(store).map(cloneBooking);
}

export function findLocalBookingById(id: string) {
  return store.find((booking) => booking._id === id) ?? null;
}

export function hasLocalBookingConflict({
  date,
  time,
  excludeId,
  statuses,
}: {
  date: string;
  time: string;
  excludeId?: string;
  statuses: BookingRecord["status"][];
}) {
  return store.some(
    (booking) =>
      booking._id !== excludeId &&
      booking.date === date &&
      booking.time === time &&
      statuses.includes(booking.status)
  );
}

export function createLocalBooking(
  booking: Omit<BookingRecord, "_id" | "createdAt" | "updatedAt">
) {
  const record: BookingRecord = {
    ...booking,
    _id: randomUUID(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  store.unshift(record);
  return cloneBooking(record);
}

export function updateLocalBooking(
  id: string,
  booking: Omit<BookingRecord, "_id" | "createdAt" | "updatedAt">
) {
  const index = store.findIndex((entry) => entry._id === id);
  if (index === -1) return null;

  const updated: BookingRecord = {
    ...booking,
    _id: id,
    createdAt: store[index].createdAt,
    updatedAt: nowIso(),
  };

  store[index] = updated;
  return cloneBooking(updated);
}

export function deleteLocalBooking(id: string) {
  const index = store.findIndex((entry) => entry._id === id);
  if (index === -1) return null;

  const [deleted] = store.splice(index, 1);
  return cloneBooking(deleted);
}
