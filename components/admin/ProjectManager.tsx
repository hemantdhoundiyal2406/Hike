"use client";

import { motion } from "framer-motion";
import {
  ExternalLink,
  ImageIcon,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { projectSchema, type ProjectInput } from "@/lib/project-schema";
import type { ProjectRecord } from "@/types/content";
import {
  AdminEmpty,
  AdminLoading,
  AdminModal,
  AdminPageHeader,
  AdminSearch,
} from "@/components/admin/AdminUi";
import { useToast } from "@/components/admin/ToastProvider";

const emptyProject: ProjectInput = {
  title: "",
  category: "",
  shortDescription: "",
  fullDescription: "",
  image: "",
  liveUrl: "",
  techStack: [],
  featured: false,
};

export function ProjectManager() {
  const router = useRouter();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ProjectRecord | "new" | null>(null);
  const [deleting, setDeleting] = useState<ProjectRecord | null>(null);
  const [form, setForm] = useState<ProjectInput>(emptyProject);
  const [techStack, setTechStack] = useState("");

  const loadProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/projects", { cache: "no-store" });
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = (await response.json()) as {
        message?: string;
        data: ProjectRecord[];
      };
      if (!response.ok) throw new Error(data.message);
      setProjects(data.data);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to load projects.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [router, showToast]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadProjects(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadProjects]);

  const visibleProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return projects;
    return projects.filter((project) =>
      [project.title, project.category, ...project.techStack].some((value) =>
        value.toLowerCase().includes(normalized)
      )
    );
  }, [projects, query]);

  function openNew() {
    setForm(emptyProject);
    setTechStack("");
    setEditing("new");
  }

  function openEdit(project: ProjectRecord) {
    setForm({
      title: project.title,
      category: project.category,
      shortDescription: project.shortDescription,
      fullDescription: project.fullDescription,
      image: project.image,
      liveUrl: project.liveUrl,
      techStack: project.techStack,
      featured: project.featured,
    });
    setTechStack(project.techStack.join(", "));
    setEditing(project);
  }

  function updateField<K extends keyof ProjectInput>(
    field: K,
    value: ProjectInput[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    const payload = {
      ...form,
      techStack: techStack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    const result = projectSchema.safeParse(payload);
    if (!result.success) {
      showToast(result.error.issues[0]?.message ?? "Check the form.", "error");
      return;
    }

    setSaving(true);
    try {
      const isNew = editing === "new";
      const response = await fetch(
        isNew ? "/api/admin/projects" : `/api/admin/projects/${editing._id}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result.data),
        }
      );
      const data = (await response.json()) as {
        message: string;
        data?: ProjectRecord;
      };
      if (!response.ok || !data.data) throw new Error(data.message);

      setProjects((current) =>
        isNew
          ? [data.data as ProjectRecord, ...current]
          : current.map((project) =>
              project._id === data.data?._id ? (data.data as ProjectRecord) : project
            )
      );
      setEditing(null);
      showToast(data.message);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to save project.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject() {
    if (!deleting) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/projects/${deleting._id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { message: string };
      if (!response.ok) throw new Error(data.message);
      setProjects((current) =>
        current.filter((project) => project._id !== deleting._id)
      );
      setDeleting(null);
      showToast(data.message);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to delete project.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Portfolio CMS"
        title="Project management"
        description="Publish polished case studies and control which work receives featured placement."
        action={
          <button className="admin-primary-button" type="button" onClick={openNew}>
            <Plus size={17} />
            Add project
          </button>
        }
      />

      <div className="admin-toolbar">
        <AdminSearch
          value={query}
          onChange={setQuery}
          placeholder="Search title, category or technology..."
        />
      </div>

      {loading ? (
        <AdminLoading label="Loading projects" />
      ) : visibleProjects.length === 0 ? (
        <AdminEmpty
          title="No projects found"
          description="Add your first portfolio project or adjust the current search."
        />
      ) : (
        <div className="admin-project-grid">
          {visibleProjects.map((project, index) => (
            <motion.article
              className="admin-project-card"
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.3) }}
            >
              <div
                className="admin-project-image"
                style={{ backgroundImage: `url("${project.image}")` }}
                role="img"
                aria-label={`${project.title} preview`}
              >
                {project.featured && (
                  <span>
                    <Sparkles size={14} />
                    Featured
                  </span>
                )}
              </div>
              <div className="admin-project-copy">
                <p>{project.category}</p>
                <h2>{project.title}</h2>
                <span>{project.shortDescription}</span>
                <div className="admin-tag-list">
                  {project.techStack.slice(0, 4).map((tech) => (
                    <i key={tech}>{tech}</i>
                  ))}
                </div>
              </div>
              <div className="admin-row-actions">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer">
                    <ExternalLink size={16} />
                    Live
                  </a>
                )}
                <button type="button" onClick={() => openEdit(project)}>
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  className="danger"
                  type="button"
                  onClick={() => setDeleting(project)}
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
        title={editing === "new" ? "Add project" : "Edit project"}
        description="This content appears automatically in the website work section."
        width="860px"
      >
        <form className="admin-form-grid" onSubmit={saveProject}>
          <label className="admin-field">
            <span>Project title</span>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Nexora"
              required
            />
          </label>
          <label className="admin-field">
            <span>Category</span>
            <input
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              placeholder="Digital brand platform"
              required
            />
          </label>
          <label className="admin-field admin-field-full">
            <span>Short description</span>
            <textarea
              rows={2}
              value={form.shortDescription}
              onChange={(event) =>
                updateField("shortDescription", event.target.value)
              }
              required
            />
          </label>
          <label className="admin-field admin-field-full">
            <span>Full description</span>
            <textarea
              rows={5}
              value={form.fullDescription}
              onChange={(event) =>
                updateField("fullDescription", event.target.value)
              }
              required
            />
          </label>
          <label className="admin-field">
            <span>Image URL or /public path</span>
            <div className="admin-input-icon">
              <ImageIcon size={16} />
              <input
                value={form.image}
                onChange={(event) => updateField("image", event.target.value)}
                placeholder="/images/project.png"
                required
              />
            </div>
          </label>
          <label className="admin-field">
            <span>Live URL</span>
            <input
              type="url"
              value={form.liveUrl}
              onChange={(event) => updateField("liveUrl", event.target.value)}
              placeholder="https://example.com"
            />
          </label>
          <label className="admin-field admin-field-full">
            <span>Tech stack (comma separated)</span>
            <input
              value={techStack}
              onChange={(event) => setTechStack(event.target.value)}
              placeholder="Next.js, TypeScript, MongoDB"
              required
            />
          </label>
          <label className="admin-toggle admin-field-full">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => updateField("featured", event.target.checked)}
            />
            <span>
              <strong>Featured project</strong>
              Prioritize this project on the public website.
            </span>
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
              Save project
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete project?"
        description="The project will disappear from the website immediately."
        width="480px"
      >
        <div className="admin-confirm">
          <p>
            Permanently delete <strong>{deleting?.title}</strong>?
          </p>
          <div className="admin-form-actions">
            <button
              className="admin-secondary-button"
              type="button"
              onClick={() => setDeleting(null)}
            >
              Keep project
            </button>
            <button
              className="admin-danger-button"
              type="button"
              onClick={deleteProject}
              disabled={saving}
            >
              <Trash2 size={17} />
              Delete project
            </button>
          </div>
        </div>
      </AdminModal>
    </>
  );
}
