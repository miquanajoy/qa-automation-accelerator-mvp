import { redirect } from "next/navigation";
import { AuthForm } from "../auth-form";
import { getCurrentUser } from "@/modules/auth/services/current-user.service";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-header">
          <div className="brand__meta">QA Automation Accelerator</div>
          <h1 className="auth-title">Login</h1>
          <p className="page-description">
            Use your email or username to access the workspace.
          </p>
        </div>
        <AuthForm mode="login" />
      </section>
    </main>
  );
}
