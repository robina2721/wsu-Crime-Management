"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/incidents", label: "Incidents" },
  { href: "/case-management", label: "Cases" },
  { href: "/users", label: "Users" },
  { href: "/citizen-portal", label: "Citizen" },
  { href: "/citizen-feedback", label: "Feedback" },
  { href: "/criminal-database", label: "Criminal DB" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";

  // Hide header on landing and auth pages for a clean welcome page
  const hiddenRoutes = ["/", "/login", "/signup"];
  if (hiddenRoutes.includes(pathname)) return null;

  return (
    <header className="bg-crime-black text-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-semibold">
              Wolaita Sodo CMS
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-1.5 rounded-md text-sm ${pathname.startsWith(l.href) ? "bg-crime-red text-white" : "text-gray-300 hover:text-white hover:bg-white/10"}`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="md:hidden">
              <button
                aria-label="Open menu"
                onClick={() => setOpen((v) => !v)}
                className="p-2 rounded-md bg-white/10"
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  {open ? (
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 4a1 1 0 000 2h12a1 1 0 100-2H4z" clipRule="evenodd" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-crime-black/95 border-t border-crime-red/10 ${open ? "block" : "hidden"}`}>
        <div className="px-4 pt-2 pb-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block px-3 py-2 rounded-md text-base ${pathname.startsWith(l.href) ? "bg-crime-red text-white" : "text-gray-300 hover:text-white hover:bg-white/10"}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-crime-red/10">
            <Link href="/login" className="block px-3 py-2 rounded-md text-base text-gray-300 hover:bg-white/10" onClick={() => setOpen(false)}>Login</Link>
            <Link href="/signup" className="block px-3 py-2 rounded-md text-base text-gray-300 hover:bg-white/10" onClick={() => setOpen(false)}>Sign up</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
