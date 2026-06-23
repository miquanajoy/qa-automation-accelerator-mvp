"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    await fetch("/api/auth/logout", {
      method: "POST"
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      className="text-button"
      disabled={isSubmitting}
      onClick={handleLogout}
      type="button"
    >
      {isSubmitting ? "Signing out..." : "Logout"}
    </button>
  );
}
