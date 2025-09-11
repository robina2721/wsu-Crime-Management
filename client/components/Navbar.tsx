import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@shared/types";
import LanguageToggle from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/dashboard", label: "Dashboard", roles: [] },
  {
    to: "/incident-reports",
    label: "Incidents",
    roles: [
      UserRole.PREVENTIVE_OFFICER,
      UserRole.DETECTIVE_OFFICER,
      UserRole.POLICE_HEAD,
      UserRole.SUPER_ADMIN,
    ],
  },
  { to: "/case-management", label: "Cases", roles: [] },
  {
    to: "/user-management",
    label: "Users",
    roles: [UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD, UserRole.HR_MANAGER],
  },
  { to: "/citizen-portal", label: "Citizen", roles: [UserRole.CITIZEN] },
  { to: "/citizen-feedback", label: "Feedback", roles: [UserRole.CITIZEN] },
  {
    to: "/criminal-database",
    label: "Criminal DB",
    roles: [
      UserRole.DETECTIVE_OFFICER,
      UserRole.POLICE_HEAD,
      UserRole.SUPER_ADMIN,
    ],
  },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Hide navbar on landing and auth pages for a cleaner layout
  const hiddenRoutes = ["/", "/login", "/signup"];
  if (hiddenRoutes.includes(location.pathname)) return null;

  const canSee = (roles: string[]) => {
    if (!roles || roles.length === 0) return true;
    return !!user && roles.includes(user.role);
  };

  const NavLinks = () => (
    <>
      {links
        .filter((l) => canSee(l.roles))
        .map((l) => {
          const active = location.pathname.startsWith(l.to);
          return (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${active ? "bg-crime-red text-white" : "text-gray-300 hover:text-white hover:bg-white/10"}`}
            >
              {l.label}
            </Link>
          );
        })}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full bg-crime-black/90 backdrop-blur border-b border-crime-red/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white font-semibold tracking-tight">
              Wolaita Sodo CMS
            </Link>
            <div className="hidden md:flex items-center gap-2">
              <NavLinks />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <button
                aria-label="Open menu"
                onClick={() => setOpen((v) => !v)}
                className="p-2 rounded-md bg-white/10"
              >
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {open ? (
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 4a1 1 0 000 2h12a1 1 0 100-2H4z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
              </button>
            </div>
            <LanguageToggle />
            {!isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/signup">
                  <Button variant="outline" className="h-9">
                    Sign Up
                  </Button>
                </Link>
                <Link to="/login">
                  <Button className="h-9 bg-crime-red hover:bg-crime-red-dark text-white">
                    Login
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <span className="hidden sm:inline text-gray-300 text-sm">
                  {user?.fullName}
                </span>
                <Button variant="outline" className="h-9" onClick={logout}>
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-crime-black/95 border-t border-crime-red/10 ${open ? "block" : "hidden"}`}
      >
        <div className="px-4 pt-2 pb-4 space-y-1">
          <NavLinks />
          <div className="pt-2 border-t border-crime-red/10">
            {!isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link to="/signup" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="h-9 w-full">
                    Sign Up
                  </Button>
                </Link>
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button className="h-9 bg-crime-red hover:bg-crime-red-dark text-white w-full">
                    Login
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">{user?.fullName}</span>
                <Button
                  variant="outline"
                  className="h-9"
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
