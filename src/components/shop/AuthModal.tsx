"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { signIn } from "next-auth/react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "signup";
  onGuestContinue?: () => void;
}

export function AuthModal({ open, onClose, defaultMode = "signin", onGuestContinue }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (mode === "signin") {
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        if (res?.error) {
          setError(res.error);
        } else {
          setSuccess("Signed in. You can continue.");
          handleClose();
        }
      } else {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data?.error || "Sign up failed. Try again.");
        } else {
          setSuccess("Account created. You can sign in now.");
          setMode("signin");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-2xl border border-matrix-border/40 bg-matrix-dark/90 shadow-matrix">
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 text-matrix-text-secondary hover:text-matrix-primary"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex gap-2 p-4">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-mono ${
              mode === "signin"
                ? "bg-matrix-primary/15 text-matrix-primary border border-matrix-border"
                : "text-matrix-text-secondary hover:text-matrix-primary"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-mono ${
              mode === "signup"
                ? "bg-matrix-primary/15 text-matrix-primary border border-matrix-border"
                : "text-matrix-text-secondary hover:text-matrix-primary"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-2">
          {mode === "signup" && (
            <div className="space-y-2">
              <label className="text-sm font-mono text-matrix-text-secondary">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-matrix-border/50 bg-matrix-darker px-3 py-2 text-matrix-text-primary focus:border-matrix-primary focus:outline-none"
                placeholder="Your name"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-mono text-matrix-text-secondary">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-matrix-border/50 bg-matrix-darker px-3 py-2 text-matrix-text-primary focus:border-matrix-primary focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-mono text-matrix-text-secondary">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-matrix-border/50 bg-matrix-darker px-3 py-2 text-matrix-text-primary focus:border-matrix-primary focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-matrix-primary">{success}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-matrix-primary px-4 py-2 font-semibold text-matrix-black hover:bg-matrix-secondary transition-colors disabled:opacity-70"
          >
            {isLoading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <p className="text-center text-xs text-matrix-text-muted">
            Auth pages are blocked; use this modal to sign in or create an account.
          </p>

          <button
            type="button"
            onClick={() => {
              onGuestContinue?.();
              handleClose();
            }}
            className="w-full rounded-lg border border-matrix-border/50 bg-matrix-darker px-4 py-2 text-sm font-semibold text-matrix-text-primary hover:border-matrix-primary"
          >
            Continue as guest
          </button>
        </form>
      </div>
    </div>
  );
}
