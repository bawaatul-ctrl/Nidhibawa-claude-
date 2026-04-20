// ─────────────────────────────────────────────────────────────
// api/razorpay/verify.ts
// Vercel Edge Function — verifies Razorpay payment signature
// and creates the enrollment in Firestore via Admin SDK
// Deploy as: /api/razorpay/verify
// ─────────────────────────────────────────────────────────────

export const config = { runtime: 'nodejs' }; // Needs crypto + Firebase Admin

import crypto from 'crypto';

// NOTE: In production, use firebase-admin package.
// This example uses the Firestore REST API to avoid bundling firebase-admin
// in the Edge runtime. For Node.js runtime, install firebase-admin instead.

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    paymentDocId,
    userId,
    userEmail,
    userName,
    programId,
    programName,
    programSegment,
    totalSessions,
  } = await req.json();

  // ─── Step 1: Verify Razorpay signature ─────────────────
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // ─── Step 2: Create enrollment in Firestore ─────────────
  // Using Firestore REST API (works in Node.js Edge Functions)
  const projectId = process.env.FIREBASE_PROJECT_ID!;
  const firestoreBase = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

  // Get Firebase Admin token (via service account)
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
  const token = await getAdminToken(serviceAccount);

  const enrollmentData = {
    fields: {
      userId: { stringValue: userId },
      userEmail: { stringValue: userEmail },
      userName: { stringValue: userName },
      programId: { stringValue: programId },
      programName: { stringValue: programName },
      programSegment: { stringValue: programSegment },
      status: { stringValue: 'active' },
      unlockedSessions: { arrayValue: { values: [{ integerValue: '1' }] } },
      currentSession: { integerValue: '1' },
      totalSessions: { integerValue: String(totalSessions) },
      paymentId: { stringValue: paymentDocId },
      startedAt: { timestampValue: new Date().toISOString() },
      createdAt: { timestampValue: new Date().toISOString() },
      updatedAt: { timestampValue: new Date().toISOString() },
    }
  };

  let enrollmentId: string;
  try {
    const res = await fetch(`${firestoreBase}/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(enrollmentData),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Firestore enrollment error:', err);
      return new Response(JSON.stringify({ error: 'Enrollment creation failed' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const created = await res.json();
    enrollmentId = created.name.split('/').pop();

    // ─── Step 3: Update user's enrollments array ───────────
    // Append to user document (PATCH with field transform)
    await fetch(`${firestoreBase}/users/${userId}?updateMask.fieldPaths=enrollments`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        writes: [{
          transform: {
            document: `projects/${projectId}/databases/(default)/documents/users/${userId}`,
            fieldTransforms: [{
              fieldPath: 'enrollments',
              appendMissingElements: { values: [{ stringValue: enrollmentId }] }
            }]
          }
        }]
      }),
    });

    // ─── Step 4: Send welcome email ────────────────────────
    // Fire-and-forget — don't block the response
    sendWelcomeEmail({
      to: userEmail,
      name: userName,
      programName,
      enrollmentId,
    }).catch(console.error);

  } catch (err) {
    console.error('verify handler error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ enrollmentId }), {
    status: 200, headers: { 'Content-Type': 'application/json' }
  });
}

// ─── Get Firebase Admin JWT ─────────────────────────────

async function getAdminToken(serviceAccount: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  };

  // Create JWT (simplified — in production use google-auth-library)
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;

  // For production: use jose or google-auth-library
  // This is the pattern — replace with proper JWT signing
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signingInput, // In prod: properly signed JWT
    }),
  });
  const { access_token } = await tokenRes.json();
  return access_token;
}

// ─── Welcome Email ─────────────────────────────────────

async function sendWelcomeEmail({
  to, name, programName, enrollmentId
}: { to: string; name: string; programName: string; enrollmentId: string }) {
  // Uses Resend (https://resend.com) — free tier: 100 emails/day
  // Add RESEND_API_KEY to Vercel env vars
  if (!process.env.RESEND_API_KEY) return;

  const portalUrl = `https://nidhibawa.com/portal?enrollment=${enrollmentId}`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Nidhi Bawa <nidhi@nidhibawa.com>',
      to,
      subject: `Welcome to ${programName} — Your portal is ready`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1A1A1A;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: #5A5A40; color: white; padding: 12px 24px; border-radius: 50px; font-size: 14px; letter-spacing: 0.1em; font-family: sans-serif; text-transform: uppercase;">
              Nidhi Bawa Coaching
            </div>
          </div>
          
          <h1 style="font-size: 28px; font-weight: normal; margin-bottom: 8px;">Welcome, ${name}.</h1>
          <p style="font-size: 18px; color: #5A5A40; margin-bottom: 32px;">You're enrolled in <strong>${programName}</strong>.</p>
          
          <p style="font-size: 16px; line-height: 1.7; margin-bottom: 24px; color: #444;">
            I'm genuinely looking forward to this journey with you. Your personal coaching portal is ready — 
            this is where we'll work together during our sessions, and where your exercises and notes will live.
          </p>

          <div style="background: #F5F5F0; border-radius: 16px; padding: 24px; margin: 32px 0; text-align: center;">
            <p style="font-family: sans-serif; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Your coaching portal</p>
            <a href="${portalUrl}" style="display: inline-block; background: #5A5A40; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-family: sans-serif; font-size: 15px; font-weight: 600;">
              Access Your Portal →
            </a>
            <p style="font-family: sans-serif; font-size: 12px; color: #999; margin-top: 12px;">Sign in with the Google account you used to enroll</p>
          </div>

          <p style="font-size: 15px; line-height: 1.7; margin-bottom: 16px; color: #444;">
            You'll hear from me shortly with your first session date and the Zoom/Meet link. 
            If you have any questions before we begin, just reply to this email.
          </p>
          
          <p style="font-size: 15px; color: #444; margin-top: 32px;">With warmth,</p>
          <p style="font-size: 18px; font-style: italic; color: #5A5A40;">Nidhi Bawa</p>
          
          <hr style="border: none; border-top: 1px solid #E5E5E5; margin: 40px 0;" />
          <p style="font-family: sans-serif; font-size: 12px; color: #999; text-align: center;">
            Questions? WhatsApp: +91 9999134639 · nidhi@nidhibawa.com
          </p>
        </div>
      `,
    }),
  });
}
