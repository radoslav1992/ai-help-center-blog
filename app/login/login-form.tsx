"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  callbackUrl: string;
};

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl
    });

    setLoading(false);

    if (!response || response.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(response.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <form className="neo-form" onSubmit={onSubmit}>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />

      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" minLength={6} required />

      {error ? <p className="error-line">{error}</p> : null}

      <button type="submit" className="neo-button" disabled={loading}>
        {loading ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
