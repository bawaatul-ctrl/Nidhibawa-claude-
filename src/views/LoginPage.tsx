// ─────────────────────────────────────────────────────────────
// LoginPage.tsx
// Handles both portal (/portal) and hub (/hub) sign-in
// Reads ?redirect= param to send user to their destination
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/src/lib/firebase';
import { useAuth } from '@/src/components/AuthProvider';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') ?? '/portal';

  // If already signed in, redirect immediately
  useEffect(() => {
    if (!loading && user) {
      navigate(redirect, { replace: true });
    }
  }, [user, loading, navigate, redirect]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate(redirect, { replace: true });
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  const isHubRedirect = redirect.startsWith('/hub');

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-full bg-[#5A5A40] flex items-center justify-center shadow-sm">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-serif">Nidhi Bawa</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white border border-muted rounded-3xl p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-serif font-medium">
              {isHubRedirect ? 'Coach Sign In' : 'Access Your Portal'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isHubRedirect
                ? 'Sign in to access the coaching hub'
                : 'Sign in to access your personal coaching program'}
            </p>
          </div>

          <Button
            size="lg"
            variant="outline"
            className="w-full rounded-full border-2 h-14 text-base font-medium gap-3 hover:bg-[#F5F5F0] hover:border-[#5A5A40] transition-all"
            onClick={handleSignIn}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isHubRedirect
                ? 'Only Nidhi Bawa can access the coach hub.'
                : 'Use the same Google account you used when enrolling. Only your program will be visible.'}
            </p>
          </div>
        </div>

        {/* Footer nav */}
        <div className="text-center text-sm text-muted-foreground">
          <span>Not enrolled yet? </span>
          <Link to="/programs" className="text-[#5A5A40] font-medium hover:underline">
            View programs
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
