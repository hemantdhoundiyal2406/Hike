"use client";

import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as {
        success: boolean;
        message: string;
      };

      if (!response.ok) throw new Error(data.message);
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login">
      <div className="admin-orb admin-orb-one" />
      <div className="admin-orb admin-orb-two" />
      <motion.section
        className="admin-login-card"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="admin-login-brand">
          <Logo />
          <span className="admin-secure-chip">
            <LockKeyhole size={14} />
            Secure admin
          </span>
        </div>
        <div className="admin-login-copy">
          <p>hike agency operations</p>
          <h1>Welcome back.</h1>
          <span>
            Manage bookings, portfolio projects and client stories from one
            focused workspace.
          </span>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label>
            <span>Email address</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@novaforge.studio"
              autoComplete="email"
              required
            />
          </label>
          <label>
            <span>Password</span>
            <div className="admin-password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your secure password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {message && (
            <p className="admin-form-error" role="alert">
              {message}
            </p>
          )}

          <button className="admin-primary-button" type="submit" disabled={loading}>
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" size={18} />
                Signing in
              </>
            ) : (
              <>
                Open dashboard
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </motion.section>
    </main>
  );
}
