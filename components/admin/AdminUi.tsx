"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, Search, X } from "lucide-react";
import { ReactNode } from "react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-page-header">
      <div>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span>{description}</span>
      </div>
      {action}
    </div>
  );
}

export function AdminModal({
  open,
  title,
  description,
  children,
  onClose,
  width = "720px",
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  width?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="admin-modal-layer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="admin-modal-backdrop"
            onClick={onClose}
            aria-label="Close dialog"
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="admin-modal"
            style={{ maxWidth: width }}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.24 }}
          >
            <header>
              <div>
                <h2>{title}</h2>
                {description && <p>{description}</p>}
              </div>
              <button type="button" onClick={onClose} aria-label="Close dialog">
                <X size={19} />
              </button>
            </header>
            <div className="admin-modal-body">{children}</div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AdminSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="admin-search">
      <Search size={17} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function AdminLoading({ label = "Loading data" }: { label?: string }) {
  return (
    <div className="admin-state-card">
      <LoaderCircle className="animate-spin" size={25} />
      <p>{label}</p>
    </div>
  );
}

export function AdminEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="admin-state-card">
      <span className="admin-empty-dot" />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
