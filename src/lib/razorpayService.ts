// ─────────────────────────────────────────────────────────────
// RAZORPAY PAYMENT SERVICE
// Handles India-first payments with UPI, cards, netbanking
// ─────────────────────────────────────────────────────────────
//
// Flow:
//  1. Client clicks "Enroll Now"
//  2. We call /api/razorpay/create-order (Vercel Edge Function)
//  3. Razorpay checkout opens
//  4. On success, we verify signature via /api/razorpay/verify
//  5. On verification, we create enrollment in Firestore
//
// ─────────────────────────────────────────────────────────────

import type { Program } from '../types/platform';
import { createPaymentRecord, updatePaymentStatus, createEnrollment } from './firestoreService';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact?: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// ─── Load Razorpay SDK dynamically ───────────────────────

function loadRazorpay(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Main: initiate payment ───────────────────────────────

export async function initiatePayment({
  program,
  user,
  onSuccess,
  onFailure,
}: {
  program: Program;
  user: { uid: string; email: string; displayName: string; phone?: string };
  onSuccess: (enrollmentId: string) => void;
  onFailure: (error: string) => void;
}) {
  const loaded = await loadRazorpay();
  if (!loaded) { onFailure('Payment system unavailable. Please try again.'); return; }

  // Step 1: Create order via backend
  let order: { id: string; amount: number; currency: string };
  try {
    const res = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        programId: program.id,
        programName: program.name,
        amountINR: program.priceINR,
        userId: user.uid,
        userEmail: user.email,
      }),
    });
    if (!res.ok) throw new Error('Order creation failed');
    order = await res.json();
  } catch (err) {
    onFailure('Unable to initiate payment. Please try again.');
    return;
  }

  // Step 2: Record payment intent in Firestore
  const paymentDocId = await createPaymentRecord({
    userId: user.uid,
    userEmail: user.email,
    programId: program.id,
    programName: program.name,
    amountINR: program.priceINR,
    razorpayOrderId: order.id,
    status: 'created',
  });

  // Step 3: Open Razorpay checkout
  const rzp = new window.Razorpay({
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: 'Nidhi Bawa Coaching',
    description: program.name,
    order_id: order.id,
    prefill: {
      name: user.displayName,
      email: user.email,
      contact: user.phone,
    },
    theme: { color: '#5A5A40' },
    handler: async (response: RazorpayResponse) => {
      // Step 4: Verify signature
      try {
        const verifyRes = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            paymentDocId,
            userId: user.uid,
            userEmail: user.email,
            userName: user.displayName,
            programId: program.id,
            programName: program.name,
            programSegment: program.segment,
            totalSessions: program.sessionCount,
          }),
        });

        if (!verifyRes.ok) throw new Error('Verification failed');
        const { enrollmentId } = await verifyRes.json();

        // Update payment status
        await updatePaymentStatus(
          paymentDocId,
          'captured',
          response.razorpay_payment_id,
          response.razorpay_signature
        );

        onSuccess(enrollmentId);
      } catch {
        onFailure('Payment verification failed. Contact support with your payment ID: ' + response.razorpay_payment_id);
      }
    },
    modal: {
      ondismiss: () => {
        updatePaymentStatus(paymentDocId, 'failed');
      },
    },
  });

  rzp.open();
}
