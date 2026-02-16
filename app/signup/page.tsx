import Link from "next/link";
import { SignupForm } from "@/app/signup/signup-form";

export default function SignupPage() {
  return (
    <section className="auth-shell neo-card">
      <p className="neo-kicker">JOIN THE COMMUNITY</p>
      <h1>Create your AI Help Center account</h1>
      <p>Comment on articles and subscribe to publish article reviews.</p>

      <SignupForm />

      <p>
        Already have an account? <Link href="/login">Log in</Link>.
      </p>
    </section>
  );
}
