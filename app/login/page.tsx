import Link from "next/link";
import { LoginForm } from "@/app/login/login-form";

type LoginPageProps = {
  searchParams: { callbackUrl?: string };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const callbackUrl = searchParams.callbackUrl ?? "/";

  return (
    <section className="auth-shell neo-card">
      <p className="neo-kicker">WELCOME BACK</p>
      <h1>Log in to AI Help Center</h1>
      <p>Post comments, subscribe for reviews, and access your account.</p>

      <LoginForm callbackUrl={callbackUrl} />

      <p>
        New here? <Link href="/signup">Create an account</Link>.
      </p>
    </section>
  );
}
