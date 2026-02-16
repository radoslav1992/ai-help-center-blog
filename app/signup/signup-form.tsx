"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setError(payload.message ?? "Unable to create account.");
      setLoading(false);
      return;
    }

    const signInResponse = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/"
    });

    setLoading(false);

    if (!signInResponse || signInResponse.error) {
      setError("Account created but automatic login failed. Please log in manually.");
      router.push("/login");
      return;
    }

    router.push(signInResponse.url ?? "/");
    router.refresh();
  }

  return (
    <form className="neo-form" onSubmit={onSubmit}>
      <label htmlFor="name">Name</label>
      <input id="name" name="name" type="text" minLength={2} required />

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />

      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" minLength={8} required />

      {error ? <p className="error-line">{error}</p> : null}

      <button type="submit" className="neo-button" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
