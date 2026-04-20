// ─────────────────────────────────────────────────────────────
// EnrollButton.tsx
// Handles the full Razorpay payment + enrollment flow
// Used on program pages and in the portal
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/src/components/AuthProvider';
import { signInWithGoogle } from '@/src/lib/firebase';
import { initiatePayment } from '@/src/lib/razorpayService';
import type { Program } from '@/src/types/platform';
import { cn } from '@/src/lib/utils';

interface EnrollButtonProps {
  program: Program;
  size?: 'default' | 'lg' | 'sm';
  className?: string;
  fullWidth?: boolean;
}

type FlowState = 'idle' | 'signing-in' | 'loading-payment' | 'processing' | 'success' | 'error';

export function EnrollButton({ program, size = 'lg', className, fullWidth }: EnrollButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<FlowState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleEnroll = async () => {
    setErrorMsg('');

    // Step 1: Ensure user is signed in
    if (!user) {
      setState('signing-in');
      try {
        await signInWithGoogle();
      } catch {
        setState('error');
        setErrorMsg('Sign-in was cancelled. Please try again.');
        return;
      }
      setState('idle');
    }

    // Step 2: Check if already enrolled (user should be set now)
    const currentUser = user;
    if (!currentUser) return;

    // Step 3: Initiate payment
    setState('loading-payment');

    initiatePayment({
      program,
      user: {
        uid: currentUser.uid,
        email: currentUser.email ?? '',
        displayName: currentUser.displayName ?? 'Student',
      },
      onSuccess: (enrollmentId) => {
        setState('success');
        // Small delay to show success state, then redirect to portal
        setTimeout(() => {
          navigate(`/portal?enrollment=${enrollmentId}&welcome=true`);
        }, 1500);
      },
      onFailure: (error) => {
        setState('error');
        setErrorMsg(error);
      },
    });

    // Note: Razorpay opens its own modal — setState will change via callbacks above
    setState('processing');
  };

  const isLoading = ['signing-in', 'loading-payment', 'processing'].includes(state);

  const labels: Record<FlowState, string> = {
    idle: `Enroll — ₹${program.priceINR.toLocaleString('en-IN')}`,
    'signing-in': 'Signing you in...',
    'loading-payment': 'Preparing checkout...',
    processing: 'Complete payment in the window',
    success: 'Enrolled! Taking you to your portal...',
    error: `Retry — ₹${program.priceINR.toLocaleString('en-IN')}`,
  };

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full')}>
      <Button
        size={size}
        onClick={handleEnroll}
        disabled={isLoading || state === 'success'}
        className={cn(
          'rounded-full font-semibold transition-all duration-200',
          state === 'success' && 'bg-green-600 hover:bg-green-600',
          state === 'error' && 'bg-red-600 hover:bg-red-700',
          !['success', 'error'].includes(state) && 'bg-[#5A5A40] hover:bg-[#4A4A35]',
          'text-white',
          fullWidth && 'w-full',
          className
        )}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && state !== 'success' && <ArrowRight className="mr-2 h-4 w-4" />}
        {labels[state]}
      </Button>

      {state === 'error' && errorMsg && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!user && state === 'idle' && (
        <p className="text-xs text-center text-muted-foreground">
          You'll be asked to sign in with Google before payment
        </p>
      )}
    </div>
  );
}
