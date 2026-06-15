"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ExternalLink,
  LoaderCircle,
  Mail,
  Pencil,
  Phone,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminBookingSchema,
  bookingStatuses,
  meetingTopics,
  websiteTypes,
  type AdminBookingInput,
} from "@/lib/booking-schema";
import type { BookingRecord } from "@/types/booking";
import {
  AdminEmpty,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
  AdminSearch,
} from "@/components/admin/AdminUi";
import { useToast } from "@/components/admin/ToastProvider";

const emptyBooking: AdminBookingInput = {
  name: "",
  email: "",
  phone: "",
  brandName: "",
  meetingTopic: meetingTopics[0],
  websiteType: "Business website",
  message: "",
  date: "",
  time: "09:00",
  status: "confirmed",
  durationMinutes: 30,
  timezone: "Asia/Kolkata",
  meetingLink: "",
  internalNotes: "",
  source: "admin",
};

export function BookingManager() {
  const router = useRouter();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<BookingRecord | "new" | null>(null);
  const [deleting, setDeleting] = useState<BookingRecord | null>(null);
  const [form, setForm] = useState<AdminBookingInput>(emptyBooking);

  const loadBookings = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/bookings", { cache: "no-store" });
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = (await response.json()) as {
        success: boolean;
        message?: string;
        data: BookingRecord[];
      };
      if (!response.ok) throw new Error(data.message);
      setBookings(data.data);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to load bookings.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [router, showToast]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadBookings(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadBookings]);

  const visibleBookings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;
      const matchesQuery =
        !normalized ||
        [
          booking.name,
          booking.email,
          booking.phone,
          booking.brandName,
          booking.meetingTopic,
          booking.websiteType,
        ].some((value) => value.toLowerCase().includes(normalized));
      return matchesStatus && matchesQuery;
    });
  }, [bookings, query, statusFilter]);

  function openEdit(booking: BookingRecord) {
    const meetingTopic = meetingTopics.includes(
      booking.meetingTopic as AdminBookingInput["meetingTopic"],
    )
      ? (booking.meetingTopic as AdminBookingInput["meetingTopic"])
      : meetingTopics[0];
    const websiteType = websiteTypes.includes(
      booking.websiteType as AdminBookingInput["websiteType"],
    )
      ? (booking.websiteType as AdminBookingInput["websiteType"])
      : websiteTypes[0];

    setEditing(booking);
    setForm({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      brandName: booking.brandName,
      meetingTopic,
      websiteType,
      message: booking.message,
      date: booking.date,
      time: booking.time,
      status: booking.status,
      durationMinutes: booking.durationMinutes ?? 30,
      timezone: booking.timezone || "Asia/Kolkata",
      meetingLink: booking.meetingLink || "",
      internalNotes: booking.internalNotes || "",
      source: booking.source || "website",
    });
  }

  function openNew() {
    setForm(emptyBooking);
    setEditing("new");
  }

  function updateField<K extends keyof AdminBookingInput>(
    field: K,
    value: AdminBookingInput[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    const result = adminBookingSchema.safeParse(form);
    if (!result.success) {
      showToast(result.error.issues[0]?.message ?? "Check the form.", "error");
      return;
    }

    setSaving(true);
    try {
      const isNew = editing === "new";
      const response = await fetch(
        isNew ? "/api/admin/bookings" : `/api/admin/bookings/${editing._id}`,
        {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...result.data,
          source: isNew ? "admin" : result.data.source,
        }),
      }
      );
      const data = (await response.json()) as {
        success: boolean;
        message: string;
        data?: BookingRecord;
      };
      if (!response.ok || !data.data) throw new Error(data.message);

      setBookings((current) =>
        isNew
          ? [data.data as BookingRecord, ...current]
          : current.map((booking) =>
              booking._id === data.data?._id ? data.data : booking
            )
      );
      setEditing(null);
      showToast(data.message, data.message.includes("failed") ? "error" : "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to update booking.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteBooking() {
    if (!deleting) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/bookings/${deleting._id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as {
        success: boolean;
        message: string;
      };
      if (!response.ok) throw new Error(data.message);
      setBookings((current) =>
        current.filter((booking) => booking._id !== deleting._id)
      );
      setDeleting(null);
      showToast(data.message);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to delete booking.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Client pipeline"
        title="Booking management"
        description="Review every enquiry, update schedules and keep clients informed automatically."
        action={
          <button className="admin-primary-button" type="button" onClick={openNew}>
            <Plus size={17} />
            Schedule meeting
          </button>
        }
      />

      <div className="admin-toolbar">
        <AdminSearch
          value={query}
          onChange={setQuery}
          placeholder="Search client, email, company..."
        />
        <select
          className="admin-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter booking status"
        >
          <option value="all">All statuses</option>
          {bookingStatuses.map((status) => (
            <option key={status} value={status}>
              {status[0].toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <AdminLoading label="Loading bookings" />
      ) : visibleBookings.length === 0 ? (
        <AdminEmpty
          title="No bookings found"
          description="New website bookings and matching search results will appear here."
        />
      ) : (
        <div className="admin-booking-list">
          <AnimatePresence initial={false}>
            {visibleBookings.map((booking, index) => (
              <motion.article
                className="admin-booking-card"
                key={booking._id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: Math.min(index * 0.035, 0.25) }}
              >
                <div className="admin-booking-main">
                  <span className="admin-client-avatar">
                    {booking.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <div>
                    <div className="admin-booking-title">
                      <h2>{booking.name}</h2>
                      <span className={`admin-status ${booking.status}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p>{booking.brandName}</p>
                    <div className="admin-booking-contact">
                      <a href={`mailto:${booking.email}`}>
                        <Mail size={14} />
                        {booking.email}
                      </a>
                      <a href={`tel:${booking.phone}`}>
                        <Phone size={14} />
                        {booking.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="admin-booking-meta">
                  <span>
                    <CalendarDays size={15} />
                    {booking.date} at {booking.time}
                  </span>
                  <span>{booking.meetingTopic}</span>
                  <span>
                    {booking.durationMinutes ?? 30} min /{" "}
                    {booking.timezone || "Asia/Kolkata"}
                  </span>
                  <span>
                    {booking.websiteType} / {booking.source || "website"}
                  </span>
                  {booking.meetingLink && (
                    <a
                      href={booking.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={14} />
                      Open meeting
                    </a>
                  )}
                </div>

                <p className="admin-booking-message">{booking.message}</p>
                <div className="admin-row-actions">
                  <button type="button" onClick={() => openEdit(booking)}>
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button
                    className="danger"
                    type="button"
                    onClick={() => setDeleting(booking)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AdminModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Schedule meeting" : "Update booking"}
        description={
          editing === "new"
            ? "Create a meeting manually and email the details to the client and admin."
            : "Saving changes emails the latest details to the client and admin."
        }
        width="820px"
      >
        <form className="admin-form-grid" onSubmit={saveBooking}>
          <label className="admin-field">
            <span>Client name</span>
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
            />
          </label>
          <label className="admin-field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
            />
          </label>
          <label className="admin-field">
            <span>Phone</span>
            <input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              required
            />
          </label>
          <label className="admin-field">
            <span>Brand / company</span>
            <input
              value={form.brandName}
              onChange={(event) => updateField("brandName", event.target.value)}
              required
            />
          </label>
          <label className="admin-field">
            <span>Meeting topic</span>
            <select
              value={form.meetingTopic}
              onChange={(event) =>
                updateField(
                  "meetingTopic",
                  event.target.value as AdminBookingInput["meetingTopic"]
                )
              }
            >
              {meetingTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Website type</span>
            <select
              value={form.websiteType}
              onChange={(event) =>
                updateField(
                  "websiteType",
                  event.target.value as AdminBookingInput["websiteType"]
                )
              }
            >
              {websiteTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Status</span>
            <select
              value={form.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value as AdminBookingInput["status"]
                )
              }
            >
              {bookingStatuses.map((status) => (
                <option key={status} value={status}>
                  {status[0].toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
              required
            />
          </label>
          <label className="admin-field">
            <span>Time</span>
            <input
              type="time"
              value={form.time}
              onChange={(event) => updateField("time", event.target.value)}
              required
            />
          </label>
          <label className="admin-field">
            <span>Duration</span>
            <select
              value={form.durationMinutes}
              onChange={(event) =>
                updateField("durationMinutes", Number(event.target.value))
              }
            >
              {[15, 30, 45, 60, 90, 120, 180, 240].map((duration) => (
                <option key={duration} value={duration}>
                  {duration} minutes
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Timezone</span>
            <input
              value={form.timezone}
              onChange={(event) => updateField("timezone", event.target.value)}
              placeholder="Asia/Kolkata"
              required
            />
          </label>
          <label className="admin-field admin-field-full">
            <span>Meeting link</span>
            <input
              type="url"
              value={form.meetingLink}
              onChange={(event) =>
                updateField("meetingLink", event.target.value)
              }
              placeholder="https://meet.google.com/... or Zoom link"
            />
          </label>
          <label className="admin-field admin-field-full">
            <span>Client-facing agenda / message</span>
            <textarea
              rows={5}
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              required
            />
          </label>
          <label className="admin-field admin-field-full">
            <span>Internal admin notes</span>
            <textarea
              rows={3}
              value={form.internalNotes}
              onChange={(event) =>
                updateField("internalNotes", event.target.value)
              }
              placeholder="Budget, preparation notes, follow-up context..."
            />
          </label>
          <div className="admin-form-actions admin-field-full">
            <button
              className="admin-secondary-button"
              type="button"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
            <button
              className="admin-primary-button"
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : (
                <Save size={17} />
              )}
              {editing === "new" ? "Schedule and notify" : "Save and notify"}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete booking?"
        description="This permanently removes the booking from the dashboard."
        width="480px"
      >
        <div className="admin-confirm">
          <p>
            Delete the booking from <strong>{deleting?.name}</strong> at{" "}
            <strong>{deleting?.brandName}</strong>?
          </p>
          <div className="admin-form-actions">
            <button
              className="admin-secondary-button"
              type="button"
              onClick={() => setDeleting(null)}
            >
              Keep booking
            </button>
            <button
              className="admin-danger-button"
              type="button"
              onClick={deleteBooking}
              disabled={saving}
            >
              {saving ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : (
                <Trash2 size={17} />
              )}
              Delete booking
            </button>
          </div>
        </div>
      </AdminModal>
    </>
  );
}
