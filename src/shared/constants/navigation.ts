export type NavigationItem = {
  label: string;
  href: string;
};

export const navigationItems: NavigationItem[] = [
  { label: "Projects", href: "/projects" },
  { label: "Crawl", href: "/crawl" },
  { label: "Locators", href: "/locators" },
  { label: "Snapshots", href: "/snapshots" },
  { label: "Generator", href: "/generator" }
];
