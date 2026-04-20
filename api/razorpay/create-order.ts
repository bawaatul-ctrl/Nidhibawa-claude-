// ─────────────────────────────────────────────────────────────
// api/razorpay/create-order.ts
// Vercel Edge Function — creates a Razorpay order
// Deploy as: /api/razorpay/create-order
// ─────────────────────────────────────────────────────────────
// 
// IMPORTANT: Copy this file to api/razorpay/create-order.ts
// in the root of your project (not inside /src)
// Set environment variables in Vercel dashboard:
//   RAZORPAY_KEY_ID
//   RAZORPAY_KEY_SECRET
//   FIREBASE_SERVICE_ACCOUNT (JSON stringified)
//
// ─────────────────────────────────────────────────────────────

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { programId, programName, amountINR, userId, userEmail } = await req.json();

  if (!programId || !amountINR || !userId) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

  const orderPayload = {
    amount: amountINR * 100, // Razorpay expects paise
    currency: 'INR',
    receipt: `receipt_${userId}_${Date.now()}`,
    notes: {
      programId,
      programName,
      userId,
      userEmail,
    },
  };

  try {
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
      },
      body: JSON.stringify(orderPayload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Razorpay order error:', err);
      return new Response(JSON.stringify({ error: 'Order creation failed' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const order = await res.json();
    return new Response(JSON.stringify({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('create-order error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
