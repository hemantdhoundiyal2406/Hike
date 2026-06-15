import type { BookingStatus } from "@/lib/booking-schema";

export type BookingFormData = {
  name: string;
  email: string;
  phone: string;
  brandName: string;
  meetingTopic: string;
  websiteType: string;
  message: string;
  date: string;
  time: string;
};

export type BookingRecord = BookingFormData & {
  _id: string;
  status: BookingStatus;
  durationMinutes: number;
  timezone: string;
  meetingLink: string;
  internalNotes: string;
  source: "website" | "admin";
  createdAt: string;
  updatedAt: string;
};

export type BookingResponse = {
  success: boolean;
  message: string;
  emailSent?: boolean;
};
