import { randomUUID } from "node:crypto";
const store = global.novaforgeLocalBookings ?? [];
global.novaforgeLocalBookings = store;
function cloneBooking(booking) {
    return JSON.parse(JSON.stringify(booking));
}
function sortByNewest(bookings) {
    return [...bookings].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}
function nowIso() {
    return new Date().toISOString();
}
export function listLocalBookings() {
    return sortByNewest(store).map(cloneBooking);
}
export function findLocalBookingById(id) {
    return store.find((booking) => booking._id === id) ?? null;
}
export function hasLocalBookingConflict({ date, time, excludeId, statuses, }) {
    return store.some((booking) => booking._id !== excludeId &&
        booking.date === date &&
        booking.time === time &&
        statuses.includes(booking.status));
}
export function createLocalBooking(booking) {
    const record = {
        ...booking,
        _id: randomUUID(),
        createdAt: nowIso(),
        updatedAt: nowIso(),
    };
    store.unshift(record);
    return cloneBooking(record);
}
export function updateLocalBooking(id, booking) {
    const index = store.findIndex((entry) => entry._id === id);
    if (index === -1)
        return null;
    const updated = {
        ...booking,
        _id: id,
        createdAt: store[index].createdAt,
        updatedAt: nowIso(),
    };
    store[index] = updated;
    return cloneBooking(updated);
}
export function deleteLocalBooking(id) {
    const index = store.findIndex((entry) => entry._id === id);
    if (index === -1)
        return null;
    const [deleted] = store.splice(index, 1);
    return cloneBooking(deleted);
}
