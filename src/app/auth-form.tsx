"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthFormMode = "login" | "register";

type ApiError = {
  error?: {
    message?: string;
  };
};

export function AuthForm({ mode }: { mode: AuthFormMode }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = isRegister
      ? {
          email: String(formData.get("email") ?? ""),
          username: String(formData.get("username") ?? ""),
          password: String(formData.get("password") ?? "")
        }
      : {
          identifier: String(formData.get("identifier") ?? ""),
          password: String(formData.get("password") ?? "")
        };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = (await response.json()) as ApiError;
        setMessage(body.error?.message ?? "Authentication failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setMessage("Unable to reach the authentication service");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {isRegister ? (
        <>
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label className="field">
            <span>Username</span>
            <input
              name="username"
              type="text"
              autoComplete="username"
              minLength={3}
              required
            />
          </label>
        </>
      ) : (
        <label className="field">
          <span>Email or username</span>
          <input name="identifier" type="text" autoComplete="username" required />
        </label>
      )}

      <label className="field">
        <span>Password</span>
        <input
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          minLength={7}
          required
        />
      </label>

      {isRegister ? (
        <p className="form-hint">
          Password must be at least 7 characters and include uppercase,
          lowercase, and a number.
        </p>
      ) : null}

      {message ? <div className="form-error">{message}</div> : null}

      <button className="primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Login"}
      </button>

      <div className="auth-switch">
        {isRegister ? (
          <>
            Already have an account? <Link href="/login">Login</Link>
          </>
        ) : (
          <>
            Need an account? <Link href="/register">Create one</Link>
          </>
        )}
      </div>
    </form>
  );
}
