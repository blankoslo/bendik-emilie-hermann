"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    href: "/",
    label: "Hjem",
    icon: (active: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l9-9 9 9M4.5 10.5V20a.5.5 0 00.5.5h4.5v-5h5v5H19a.5.5 0 00.5-.5V10.5"
        />
      </svg>
    ),
    activeOn: (p: string) => p === "/",
  },
  {
    href: "/tur",
    label: "Turer",
    icon: (active: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7"
        />
      </svg>
    ),
    activeOn: (p: string) => p.startsWith("/tur"),
  },
  {
    href: "/familie",
    label: "Familier",
    icon: (active: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.8}
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a4 4 0 00-5.916-3.51M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a4 4 0 015.916-3.51M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    activeOn: (p: string) => p.startsWith("/familie"),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0a1a12]/95 backdrop-blur-md">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {NAV.map((item) => {
          const active = item.activeOn(pathname);
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-5 py-1 transition-colors ${
                  active ? "text-green-400" : "text-white/40 hover:text-white/70"
                }`}
              >
                {item.icon(active)}
                <span className="text-[10px] font-medium tracking-wide">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
