import { InferSchemaType, Model, models, model, Schema } from "mongoose";

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    fullDescription: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    liveUrl: { type: String, default: "", trim: true },
    techStack: [{ type: String, required: true, trim: true }],
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

projectSchema.index({ featured: -1, createdAt: -1 });

type ProjectDocument = InferSchemaType<typeof projectSchema>;

const Project =
  (models.Project as Model<ProjectDocument>) ||
  model<ProjectDocument>("Project", projectSchema);

export default Project;
