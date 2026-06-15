"use client";

import { motion } from "framer-motion";
import {
  LoaderCircle,
  Pencil,
  Plus,
  Quote,
  Save,
  Star,
  Trash2,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  testimonialSchema,
  type TestimonialInput,
} from "@/lib/testimonial-schema";
import type { TestimonialRecord } from "@/types/content";
import {
  AdminEmpty,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
  AdminSearch,
} from "@/components/admin/AdminUi";
import { useToast } from "@/components/admin/ToastProvider";

const emptyTestimonial: TestimonialInput = {
  clientName: "",
  designation: "",
  review: "",
  rating: 5,
  image: "",
};

export function TestimonialManager() {
  const router = useRouter();
  const { showToast } = useToast();
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<TestimonialRecord | "new" | null>(null);
  const [deleting, setDeleting] = useState<TestimonialRecord | null>(null);
  const [form, setForm] = useState<TestimonialInput>(emptyTestimonial);

  const loadTestimonials = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/testimonials", {
        cache: "no-store",
      });
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = (await response.json()) as {
        message?: string;
        data: TestimonialRecord[];
      };
      if (!response.ok) throw new Error(data.message);
      setTestimonials(data.data);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to load testimonials.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [router, showToast]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadTestimonials(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadTestimonials]);

  const visibleTestimonials = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return testimonials;
    return testimonials.filter((testimonial) =>
      [testimonial.clientName, testimonial.designation, testimonial.review].some(
        (value) => value.toLowerCase().includes(normalized)
      )
    );
  }, [query, testimonials]);

  function openNew() {
    setForm(emptyTestimonial);
    setEditing("new");
  }

  function openEdit(testimonial: TestimonialRecord) {
    setForm({
      clientName: testimonial.clientName,
      designation: testimonial.designation,
      review: testimonial.review,
      rating: testimonial.rating,
      image: testimonial.image,
    });
    setEditing(testimonial);
  }

  function updateField<K extends keyof TestimonialInput>(
    field: K,
    value: TestimonialInput[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveTestimonial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    const result = testimonialSchema.safeParse(form);
    if (!result.success) {
      showToast(result.error.issues[0]?.message ?? "Check the form.", "error");
      return;
    }

    setSaving(true);
    try {
      const isNew = editing === "new";
      const response = await fetch(
        isNew
          ? "/api/admin/testimonials"
          : `/api/admin/testimonials/${editing._id}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result.data),
        }
      );
      const data = (await response.json()) as {
        message: string;
        data?: TestimonialRecord;
      };
      if (!response.ok || !data.data) throw new Error(data.message);

      setTestimonials((current) =>
        isNew
          ? [data.data as TestimonialRecord, ...current]
          : current.map((testimonial) =>
              testimonial._id === data.data?._id
                ? (data.data as TestimonialRecord)
                : testimonial
            )
      );
      setEditing(null);
      showToast(data.message);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to save testimonial.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteTestimonial() {
    if (!deleting) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/testimonials/${deleting._id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { message: string };
      if (!response.ok) throw new Error(data.message);
      setTestimonials((current) =>
        current.filter((testimonial) => testimonial._id !== deleting._id)
      );
      setDeleting(null);
      showToast(data.message);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to delete testimonial.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Social proof"
        title="Testimonial management"
        description="Keep client feedback fresh, credible and beautifully presented on the website."
        action={
          <button className="admin-primary-button" type="button" onClick={openNew}>
            <Plus size={17} />
            Add testimonial
          </button>
        }
      />

      <div className="admin-toolbar">
        <AdminSearch
          value={query}
          onChange={setQuery}
          placeholder="Search client, company or review..."
        />
      </div>

      {loading ? (
        <AdminLoading label="Loading testimonials" />
      ) : visibleTestimonials.length === 0 ? (
        <AdminEmpty
          title="No testimonials found"
          description="Add a client review or adjust the current search."
        />
      ) : (
        <div className="admin-testimonial-grid">
          {visibleTestimonials.map((testimonial, index) => (
            <motion.article
              className="admin-testimonial-card"
              key={testimonial._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.3) }}
            >
              <div className="admin-testimonial-top">
                <div>
                  {Array.from({ length: testimonial.rating }).map((_, star) => (
                    <Star key={star} size={15} fill="currentColor" />
                  ))}
                </div>
                <Quote size={34} />
              </div>
              <blockquote>{testimonial.review}</blockquote>
              <footer>
                <span
                  className="admin-client-avatar"
                  style={
                    testimonial.image
                      ? { backgroundImage: `url("${testimonial.image}")` }
                      : undefined
                  }
                >
                  {!testimonial.image &&
                    testimonial.clientName
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                </span>
                <div>
                  <strong>{testimonial.clientName}</strong>
                  <small>{testimonial.designation}</small>
                </div>
              </footer>
              <div className="admin-row-actions">
                <button type="button" onClick={() => openEdit(testimonial)}>
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  className="danger"
                  type="button"
                  onClick={() => setDeleting(testimonial)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <AdminModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add testimonial" : "Edit testimonial"}
        description="Saved reviews update the public testimonial carousel automatically."
        width="760px"
      >
        <form className="admin-form-grid" onSubmit={saveTestimonial}>
          <label className="admin-field">
            <span>Client name</span>
            <input
              value={form.clientName}
              onChange={(event) =>
                updateField("clientName", event.target.value)
              }
              required
            />
          </label>
          <label className="admin-field">
            <span>Designation / company</span>
            <input
              value={form.designation}
              onChange={(event) =>
                updateField("designation", event.target.value)
              }
              required
            />
          </label>
          <label className="admin-field admin-field-full">
            <span>Review</span>
            <textarea
              rows={6}
              value={form.review}
              onChange={(event) => updateField("review", event.target.value)}
              required
            />
          </label>
          <label className="admin-field">
            <span>Rating</span>
            <select
              value={form.rating}
              onChange={(event) =>
                updateField("rating", Number(event.target.value))
              }
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} star{rating === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Image URL (optional)</span>
            <input
              value={form.image}
              onChange={(event) => updateField("image", event.target.value)}
              placeholder="https://..."
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
              Save testimonial
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete testimonial?"
        description="This review will be removed from the website."
        width="480px"
      >
        <div className="admin-confirm">
          <p>
            Permanently delete the review from{" "}
            <strong>{deleting?.clientName}</strong>?
          </p>
          <div className="admin-form-actions">
            <button
              className="admin-secondary-button"
              type="button"
              onClick={() => setDeleting(null)}
            >
              Keep review
            </button>
            <button
              className="admin-danger-button"
              type="button"
              onClick={deleteTestimonial}
              disabled={saving}
            >
              <Trash2 size={17} />
              Delete review
            </button>
          </div>
        </div>
      </AdminModal>
    </>
  );
}
