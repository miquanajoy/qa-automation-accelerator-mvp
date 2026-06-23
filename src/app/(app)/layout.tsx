import Link from "next/link";
import { LogoutButton } from "../logout-button";
import { requireCurrentUser } from "@/modules/auth/services/current-user.service";
import { navigationItems } from "@/shared/constants/navigation";

export default async function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireCurrentUser();

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <Link className="brand" href="/dashboard">
          <span className="brand__name">QA Automation Accelerator</span>
          <span className="brand__meta">MVP Foundation</span>
        </Link>

        <nav className="nav">
          {navigationItems.map((item) => (
            <Link className="nav__item" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar__title">Dashboard</div>
          <div className="topbar__actions">
            <span className="topbar__status">{user.username}</span>
            <LogoutButton />
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
