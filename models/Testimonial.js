import { models, model, Schema } from "mongoose";
const testimonialSchema = new Schema({
    clientName: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    review: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    image: { type: String, default: "", trim: true },
}, { timestamps: true });
testimonialSchema.index({ createdAt: -1 });
const Testimonial = models.Testimonial ||
    model("Testimonial", testimonialSchema);
export default Testimonial;
