import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@shared/types';
import LanguageToggle from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';

const links = [
  { to: '/dashboard', label: 'Dashboard', roles: [] },
  { to: '/incident-reports', label: 'Incidents', roles: [UserRole.PREVENTIVE_OFFICER, UserRole.DETECTIVE_OFFICER, UserRole.POLICE_HEAD, UserRole.SUPER_ADMIN] },
  { to: '/case-management', label: 'Cases', roles: [] },
  { to: '/user-management', label: 'Users', roles: [UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD, UserRole.HR_MANAGER] },
  { to: '/citizen-portal', label: 'Citizen', roles: [UserRole.CITIZEN] },
  { to: '/citizen-feedback', label: 'Feedback', roles: [UserRole.CITIZEN] },
  { to: '/criminal-database', label: 'Criminal DB', roles: [UserRole.DETECTIVE_OFFICER, UserRole.POLICE_HEAD, UserRole.SUPER_ADMIN] },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  // Hide navbar on landing and auth pages for a cleaner layout
  const hiddenRoutes = ['/', '/login', '/signup'];
  if (hiddenRoutes.includes(location.pathname)) return null;

  const canSee = (roles: string[]) => {
    if (!roles || roles.length === 0) return true;
    return !!user && roles.includes(user.role);
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-crime-black/90 backdrop-blur border-b border-crime-red/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white font-semibold tracking-tight">
              Wolaita Sodo CMS
            </Link>
            <div className="hidden md:flex items-center gap-2">
              {links.filter(l => canSee(l.roles)).map(l => {
                const active = location.pathname.startsWith(l.to);
                return (
                  <Link key={l.to} to={l.to} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${active ? 'bg-crime-red text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
                    {l.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/signup"><Button variant="outline" className="h-9">Sign Up</Button></Link>
                <Link to="/login"><Button className="h-9 bg-crime-red hover:bg-crime-red-dark text-white">Login</Button></Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-gray-300 text-sm">{user?.fullName}</span>
                <Button variant="outline" className="h-9" onClick={logout}>Logout</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
