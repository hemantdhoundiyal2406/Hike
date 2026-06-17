import { models, model, Schema } from "mongoose";
const bookingSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    brandName: { type: String, required: true, trim: true },
    meetingTopic: { type: String, required: true, trim: true },
    websiteType: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    durationMinutes: { type: Number, required: true, default: 30, min: 15, max: 240 },
    timezone: { type: String, required: true, default: "Asia/Kolkata", trim: true },
    meetingLink: { type: String, default: "", trim: true },
    internalNotes: { type: String, default: "", trim: true },
    source: {
        type: String,
        enum: ["website", "admin"],
        default: "website",
    },
    status: {
        type: String,
        enum: [
            "pending",
            "confirmed",
            "rescheduled",
            "completed",
            "cancelled",
        ],
        default: "pending",
    },
}, { timestamps: true });
bookingSchema.index({ date: 1, time: 1 });
bookingSchema.index({ email: 1, createdAt: -1 });
const Booking = models.Booking ||
    model("Booking", bookingSchema);
export default Booking;
