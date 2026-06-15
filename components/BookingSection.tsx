"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfToday,
  startOfWeek,
  subMonths,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LoaderCircle,
  Mail,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  bookingSchema,
  meetingTopics,
  websiteTypes,
} from "@/lib/booking-schema";
import {
  getAllowedTimeSlots,
  isBookableDate,
} from "@/lib/booking-options";
import type { BookingFormData, BookingResponse } from "@/types/booking";

type BookingOptions = {
  meetingTopics: readonly string[];
  availableTimeSlots: readonly string[];
  weekdayAvailability: Record<string, readonly string[]>;
  bookingWindow: {
    maxMonthsAhead: number;
    timezone: string;
    minDateOffsetDays: number;
  };
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const emptyForm: BookingFormData = {
  name: "",
  email: "",
  phone: "",
  brandName: "",
  meetingTopic: "",
  websiteType: "",
  message: "",
  date: "",
  time: "",
};

function Progress({ step }: { step: number }) {
  return (
    <div className="booking-progress">
      {["Date", "Time", "Details"].map((label, index) => {
        const number = index + 1;
        return (
          <div className="booking-progress-item" key={label}>
            <span className={number <= step ? "active" : ""}>
              {number < step ? <Check size={14} /> : number}
            </span>
            <small className={number <= step ? "text-white" : ""}>{label}</small>
          </div>
        );
      })}
    </div>
  );
}

export function BookingSection() {
  const today = startOfToday();
  const [month, setMonth] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [options, setOptions] = useState<BookingOptions | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const response = await fetch("/api/bookings/options", {
          cache: "no-store",
        });
        const data = (await response.json()) as {
          success: boolean;
          data?: BookingOptions;
        };

        if (active && response.ok && data.data) {
          setOptions(data.data);
        }
      } catch {
        if (active) {
          setOptions(null);
        }
      }
    }

    void loadOptions();

    return () => {
      active = false;
    };
  }, []);

  const calendarDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month)),
        end: endOfWeek(endOfMonth(month)),
      }),
    [month]
  );

  const selectedDateSlots = useMemo(() => {
    if (!selectedDate) return [];
    const slotSource = options?.weekdayAvailability?.[
      String(selectedDate.getDay())
    ];
    return (slotSource ?? getAllowedTimeSlots(selectedDate)).slice();
  }, [options, selectedDate]);

  function selectDate(day: Date) {
    if (!isBookableDate(day, today) || !isSameMonth(day, month)) return;
    setSelectedDate(day);
    setSelectedTime("");
    setStep(2);
  }

  function selectTime(time: string) {
    setSelectedTime(time);
    setStep(3);
    setForm((current) => ({
      ...current,
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      time,
    }));
  }

  function updateField(
    field: keyof BookingFormData,
    value: string
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const result = bookingSchema.safeParse(form);
    if (!result.success) {
      setStatus("error");
      setMessage(result.error.issues[0]?.message ?? "Please check your details.");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const data = (await response.json()) as BookingResponse;

      if (!response.ok) {
        throw new Error(data.message);
      }

      setStatus("success");
      setMessage(data.message);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  }

  function resetBooking() {
    setSelectedDate(null);
    setSelectedTime("");
    setStep(1);
    setForm(emptyForm);
    setStatus("idle");
    setMessage("");
  }

  return (
    <section id="contact" className="section-shell booking-section">
      <div className="world-grid" />
      <div className="relative z-10">
        <div className="grid gap-7 xl:grid-cols-[1.45fr_0.75fr]">
          <div>
            <p className="eyebrow justify-start">
              <span />
              Get in touch
            </p>
            <h2 className="section-title">
              Let&apos;s work
              <br />
              <span>together.</span>
            </h2>
            <p className="section-description max-w-lg">
              Tell us where you want to go. Pick a time and we&apos;ll bring the
              useful questions.
            </p>
          </div>
          <div className="hidden items-end xl:flex">
            <p className="max-w-sm text-sm leading-7 text-white/42">
              Discovery calls are 30 minutes, relaxed and useful. No hard sell,
              just a clear conversation about fit, scope and next steps.
            </p>
          </div>
        </div>

        <div className="mt-9 grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
          <div className="booking-card">
            <Progress step={step} />

            {status === "success" ? (
              <motion.div
                className="grid min-h-[420px] place-items-center text-center"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="max-w-md">
                  <span className="mx-auto grid size-20 place-items-center rounded-full border border-violet-400/35 bg-violet-500/12 text-violet-300">
                    <CalendarCheck2 size={34} />
                  </span>
                  <h3 className="mt-6 font-[family-name:var(--font-manrope)] text-3xl font-semibold">
                    Request received.
                  </h3>
                  <p className="mt-3 leading-7 text-white/55">{message}</p>
                  <button
                    type="button"
                    onClick={resetBooking}
                    className="outline-button mt-7"
                  >
                    Book another time
                  </button>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="date"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.32 }}
                  >
                    <div className="calendar-header">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-violet-400">
                          Step one
                        </p>
                        <h3>Select a date</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setMonth(subMonths(month, 1))}
                          disabled={isSameMonth(month, today)}
                          className="calendar-arrow"
                          aria-label="Previous month"
                        >
                          <ChevronLeft size={19} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setMonth(addMonths(month, 1))}
                          className="calendar-arrow"
                          aria-label="Next month"
                        >
                          <ChevronRight size={19} />
                        </button>
                      </div>
                    </div>

                    <p className="mb-6 text-center font-medium text-white/78">
                      {format(month, "MMMM yyyy")}
                    </p>
                    <div className="calendar-grid">
                      {weekDays.map((day) => (
                        <span className="calendar-weekday" key={day}>
                          {day}
                        </span>
                      ))}
                      {calendarDays.map((day) => {
                        const disabled =
                          !isBookableDate(day, today) || !isSameMonth(day, month);
                        const selected =
                          selectedDate && isSameDay(day, selectedDate);

                        return (
                          <button
                            type="button"
                            key={day.toISOString()}
                            disabled={disabled}
                            onClick={() => selectDate(day)}
                            className={`calendar-day ${
                              selected ? "selected" : ""
                            } ${!isSameMonth(day, month) ? "outside" : ""}`}
                            aria-label={format(day, "MMMM d, yyyy")}
                          >
                            {format(day, "d")}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-5 text-xs text-white/32">
                      Bookable weekdays and times are controlled from the backend.
                    </p>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="time"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.32 }}
                  >
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="back-button"
                    >
                      <ArrowLeft size={16} /> Change date
                    </button>
                    <div className="mt-7 flex items-center gap-4">
                      <span className="icon-orb">
                        <CalendarCheck2 size={25} />
                      </span>
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-violet-400">
                          Your date
                        </p>
                        <h3 className="mt-1 text-xl font-semibold">
                          {selectedDate && format(selectedDate, "EEEE, MMMM d")}
                        </h3>
                      </div>
                    </div>
                    <p className="mt-8 text-sm text-white/50">
                      Select an available slot for this date.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {selectedDateSlots.map((time) => (
                        <button
                          type="button"
                          key={time}
                          onClick={() => selectTime(time)}
                          className={`time-slot ${
                            selectedTime === time ? "selected" : ""
                          }`}
                        >
                          <Clock3 size={17} />
                          {format(
                            new Date(`2020-01-01T${time}:00`),
                            "h:mm a"
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.form
                    key="details"
                    onSubmit={submitBooking}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.32 }}
                    noValidate
                  >
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="back-button"
                    >
                      <ArrowLeft size={16} /> Change time
                    </button>

                    <div className="mb-7 mt-6 flex flex-wrap gap-3 text-xs text-white/52">
                      <span className="booking-summary">
                        <CalendarCheck2 size={14} />
                        {selectedDate && format(selectedDate, "MMM d, yyyy")}
                      </span>
                      <span className="booking-summary">
                        <Clock3 size={14} />
                        {format(
                          new Date(`2020-01-01T${selectedTime}:00`),
                          "h:mm a"
                        )}
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="form-field">
                        <span>Name</span>
                        <input
                          value={form.name}
                          onChange={(event) =>
                            updateField("name", event.target.value)
                          }
                          placeholder="Your name"
                          autoComplete="name"
                          required
                        />
                      </label>
                      <label className="form-field">
                        <span>Email</span>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(event) =>
                            updateField("email", event.target.value)
                          }
                          placeholder="you@company.com"
                          autoComplete="email"
                          required
                        />
                      </label>
                      <label className="form-field">
                        <span>Phone</span>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(event) =>
                            updateField("phone", event.target.value)
                          }
                          placeholder="+91 98765 43210"
                          autoComplete="tel"
                          required
                        />
                      </label>
                      <label className="form-field">
                        <span>Brand name</span>
                        <input
                          value={form.brandName}
                          onChange={(event) =>
                            updateField("brandName", event.target.value)
                          }
                          placeholder="Your brand"
                          autoComplete="organization"
                          required
                        />
                      </label>
                      <label className="form-field">
                        <span>Meeting topic</span>
                        <select
                          value={form.meetingTopic}
                          onChange={(event) =>
                            updateField("meetingTopic", event.target.value)
                          }
                          required
                        >
                          <option value="">Choose a topic</option>
                          {(options?.meetingTopics ?? meetingTopics).map(
                            (topic) => (
                              <option value={topic} key={topic}>
                                {topic}
                              </option>
                            )
                          )}
                        </select>
                      </label>
                      <label className="form-field">
                        <span>Website type</span>
                        <select
                          value={form.websiteType}
                          onChange={(event) =>
                            updateField("websiteType", event.target.value)
                          }
                          required
                        >
                          <option value="">Select one</option>
                          {websiteTypes.map((type) => (
                            <option value={type} key={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="form-field sm:col-span-2">
                        <span>Project message</span>
                        <textarea
                          value={form.message}
                          onChange={(event) =>
                            updateField("message", event.target.value)
                          }
                          placeholder="What are you hoping to create or improve?"
                          rows={4}
                          required
                        />
                      </label>
                    </div>

                    {message && status === "error" && (
                      <p role="alert" className="mt-4 text-sm text-rose-300">
                        {message}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="primary-button mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === "loading" ? (
                        <>
                          <LoaderCircle className="animate-spin" size={18} />
                          Sending request
                        </>
                      ) : (
                        <>
                          Submit booking <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            )}
          </div>

          <aside className="grid content-start gap-4">
            <h3 className="mb-1 font-[family-name:var(--font-manrope)] text-xl font-semibold">
              Other ways to connect
            </h3>
            <ContactCard
              icon={Mail}
              title="Email us"
              lines={["hello@hikeagency.com", "Replies within one workday"]}
            />
            <ContactCard
              icon={MapPin}
              title="Studio"
              lines={["Working globally", "Based in New Delhi, India"]}
            />
            <ContactCard
              icon={Sparkles}
              title="Best fit"
              lines={["Websites, commerce & brand", "Typical engagements: 6-14 weeks"]}
            />
          </aside>
        </div>
      </div>
      <AnimatePresence>
        {message && status !== "idle" && status !== "loading" && (
          <motion.div
            className={`site-toast ${status}`}
            role={status === "error" ? "alert" : "status"}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96 }}
          >
            <span>{message}</span>
            <button
              type="button"
              onClick={() => {
                if (status === "error") setStatus("idle");
                setMessage("");
              }}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ContactCard({
  icon: Icon,
  title,
  lines,
}: {
  icon: typeof Mail;
  title: string;
  lines: string[];
}) {
  return (
    <div className="contact-card">
      <span className="contact-icon">
        <Icon size={23} strokeWidth={1.6} />
      </span>
      <span>
        <strong>{title}</strong>
        {lines.map((line) => (
          <small key={line}>{line}</small>
        ))}
      </span>
    </div>
  );
}
