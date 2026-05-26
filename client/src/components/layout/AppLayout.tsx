import { useEffect } from 'react';
import { Navigate, Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm font-medium transition-colors hover:text-foreground',
    isActive ? 'text-foreground' : 'text-muted-foreground'
  );

function UserInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shrink-0">
      {initials}
    </span>
  );
}

export function AppLayout() {
  const { user, token, clearAuth } = useAuthStore();
  const location = useLocation();
  const fromReviews = location.state?.fromReviews === true;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const isReviewerOrAdmin = user?.role === 'REVIEWER' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
        <div className="flex h-14 items-center gap-6 px-6">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity">
            <div className="h-5 w-[3px] rounded-full bg-primary" />
            <span className="font-bold text-[14px] tracking-tight text-foreground">
              PipelineHQ
            </span>
          </Link>

          <div className="h-4 w-px bg-border" />

          <nav className="flex items-center gap-5">
            <NavLink to="/" end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) => navLinkClass({ isActive: isActive && !fromReviews })}
            >
              Projects
            </NavLink>
            {isReviewerOrAdmin && (
              <NavLink
                to="/reviews"
                className={({ isActive }) => navLinkClass({ isActive: isActive || fromReviews })}
              >
                Reviews
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin/users" className={navLinkClass}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {user?.name && <UserInitials name={user.name} />}
                  <span className="hidden sm:block">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-2">
                  <p className="text-xs font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={clearAuth}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
