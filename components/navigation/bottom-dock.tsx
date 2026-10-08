"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const destinations = [
  { href: "/home", icon: "home", label: "Home" },
  { href: "/games", icon: "games", label: "Games" },
  { href: "/progress", icon: "progress", label: "Progress" },
  { href: "/profile", icon: "profile", label: "Profile" },
] as const;

type DockIconName = (typeof destinations)[number]["icon"];

function DockIcon({ name }: { name: DockIconName }) {
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m3.5 10.5 8.5-7 8.5 7v9a1 1 0 0 1-1 1h-5v-6h-4v6h-5a1 1 0 0 1-1-1z" />
      </svg>
    );
  }

  if (name === "games") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.5 8.5h7a5 5 0 0 1 4.76 3.48l1.1 3.45a3 3 0 0 1-5.15 2.88L14.5 16.5h-5l-1.71 1.81a3 3 0 0 1-5.15-2.88l1.1-3.45A5 5 0 0 1 8.5 8.5Z" />
        <path d="M8 11.5v4M6 13.5h4M16.5 12.5h.01M18.5 14.5h.01M9 5.5h6" />
      </svg>
    );
  }

  if (name === "progress") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19.5V13h4v6.5H4ZM10 19.5V8h4v11.5h-4ZM16 19.5V3.5h4v16h-4Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function BottomDock() {
  const pathname = usePathname();

  return (
    <nav className="bottom-dock" aria-label="Primary navigation">
      <ul className="bottom-dock-list">
        {destinations.map((destination) => {
          const isActive =
            pathname === destination.href ||
            pathname.startsWith(`${destination.href}/`);

          return (
            <li key={destination.href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className="bottom-dock-link"
                href={destination.href}
              >
                <span className="bottom-dock-icon">
                  <DockIcon name={destination.icon} />
                </span>
                <span className="bottom-dock-label">{destination.label}</span>
                <span className="bottom-dock-marker" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
