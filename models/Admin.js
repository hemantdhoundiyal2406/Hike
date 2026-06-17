import { models, model, Schema } from "mongoose";
const adminSchema = new Schema({
    name: { type: String, required: true, trim: true, default: "Administrator" },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
    lastLoginAt: { type: Date },
}, { timestamps: true });
const Admin = models.Admin ||
    model("Admin", adminSchema);
export default Admin;
