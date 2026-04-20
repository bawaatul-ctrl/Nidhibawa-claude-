// ─────────────────────────────────────────────────────────────
// ProtectedRoute.tsx
// Guards /portal (client) and /hub (admin) routes
// Redirects to login if not authenticated or wrong role
// ─────────────────────────────────────────────────────────────

import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/src/components/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, userProfile } = useAuth();
  const location = useLocation();

  // Show loading spinner while Firebase resolves auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-[#5A5A40] flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading your session...</p>
        </div>
      </div>
    );
  }

  // Not signed in → redirect to login page, preserve intended destination
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  // Role check: admin routes require admin role
  if (requiredRole === 'admin' && userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] px-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="text-4xl">🔒</div>
          <h2 className="text-xl font-serif font-medium">Access Restricted</h2>
          <p className="text-muted-foreground text-sm">
            This area is only accessible to Nidhi Bawa. If you're a client looking for your portal,{' '}
            <a href="/portal" className="text-[#5A5A40] underline">click here</a>.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
