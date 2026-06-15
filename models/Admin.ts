import { InferSchemaType, Model, models, model, Schema } from "mongoose";

const adminSchema = new Schema(
  {
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
  },
  { timestamps: true }
);

type AdminDocument = InferSchemaType<typeof adminSchema>;

const Admin =
  (models.Admin as Model<AdminDocument>) ||
  model<AdminDocument>("Admin", adminSchema);

export default Admin;
