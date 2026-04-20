# Nidhi Bawa Coaching Platform — Setup Guide

## What's been built

A complete integrated platform with three access layers:

| Layer | URL | Who sees it |
|---|---|---|
| Public website | nidhibawa.com | Everyone |
| Client portal | nidhibawa.com/portal | Enrolled clients only |
| Coach hub | nidhibawa.com/hub | Nidhi only (admin) |

---

## Files to add to the existing website repo

Copy all files from this platform/ directory into the lifecoach-website repo:

```
src/types/platform.ts          ← new
src/lib/firestoreService.ts    ← new
src/lib/notionService.ts       ← new  
src/lib/razorpayService.ts     ← new
src/components/SessionPreview.tsx  ← new
src/components/EnrollButton.tsx    ← new
src/components/ProtectedRoute.tsx  ← new
src/data/platformPrograms.ts       ← new
src/views/LoginPage.tsx            ← new
src/views/PortalDashboard.tsx      ← new
src/views/PortalSessionPage.tsx    ← new
src/views/CoachHub.tsx             ← replaces content hub's StrategistHub
src/App.tsx                        ← replaces existing App.tsx
src/views/KidsProgramsView.tsx     ← replaces existing
src/views/ParentProgramsView.tsx   ← replaces existing
src/views/CorporateProgramsView.tsx ← replaces existing
firestore.rules                    ← replaces existing
api/razorpay/create-order.ts       ← new (Vercel Edge Function)
api/razorpay/verify.ts             ← new (Vercel Edge Function)
api/notion/page/[pageId].ts        ← new (Vercel Edge Function)
```

---

## Environment Variables

Add these to Vercel dashboard (Settings → Environment Variables):

### Frontend (.env.local for dev, Vercel env for prod)
```env
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
VITE_NOTION_PROXY_URL=/api/notion
```

### Backend (Vercel server-side only — never expose to browser)
```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_PROJECT_ID=gen-lang-client-0506370437
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Service Setup Checklist

### 1. Razorpay (India payments)
- [ ] Create account at razorpay.com
- [ ] Go to Settings → API Keys → Generate Live Keys
- [ ] Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to Vercel
- [ ] In Razorpay dashboard: Settings → Webhooks → add your domain
- [ ] Test with Razorpay test keys first (rzp_test_...)

### 2. Firebase (Auth + Database)
- [ ] Firebase project already exists: gen-lang-client-0506370437
- [ ] Go to Firebase Console → Project Settings → Service Accounts
- [ ] Generate new private key → download JSON
- [ ] Stringify the JSON and add as FIREBASE_SERVICE_ACCOUNT env var
- [ ] In Firestore: create these collections manually or they'll be created on first write:
  - users
  - enrollments  
  - sessionNotes
  - payments
  - programs
- [ ] Deploy updated firestore.rules: `firebase deploy --only firestore:rules`
- [ ] In Firebase Console → Authentication → Sign-in method → Enable Google

### 3. Notion (Content editing)
- [ ] Go to notion.so → Settings → Integrations → Create new integration
- [ ] Name it "Nidhi Bawa Coaching" → copy the token
- [ ] Add as NOTION_TOKEN to Vercel
- [ ] Create a Notion database with one page per session module
- [ ] Share the database with your integration
- [ ] See Notion Setup section below for page structure

### 4. Resend (Welcome emails)
- [ ] Create account at resend.com (free: 100 emails/day)
- [ ] Add and verify your domain (nidhibawa.com)
- [ ] Create API key → add as RESEND_API_KEY to Vercel
- [ ] The welcome email template is already coded in api/razorpay/verify.ts

---

## Notion Page Structure

For each session module, create a Notion page with this structure:
Nidhi can edit these freely — changes appear in the portal without any deployment.

```
# [Session Title]

## Icebreaker
[Describe the opening activity]

## Coaching Approach
[1-2 sentences on the coaching method for this session]

## Dialogue Script
Coach: [What Nidhi says]
Participant: [Example response]
Coach: [Follow-up]
Participant: [Example response]

## Reflection Questions
- [Question 1]
- [Question 2]
- [Question 3]

## Activities
- [Activity description 1]
- [Activity description 2]

## Exercises
[Exercise Title] | [Description for the client] | type:text
[Exercise Title] | [Description for the client] | type:list

## Application
[The one thing to practice between sessions]
```

**Exercise types:**
- `type:text` → single text area
- `type:list` → multiple items (coming in V2)
- `type:scale` → 1-10 rating (coming in V2)

---

## Setting Nidhi as Admin

After Nidhi signs in with Google for the first time:

1. Go to Firebase Console → Firestore → users collection
2. Find Nidhi's document (by email: the admin email in firestore.rules)
3. Change the `role` field from `"user"` to `"admin"`

Or run this one-time script:
```javascript
// In Firebase Console → Firestore → Run query
// Or use Firebase Admin SDK
await updateDoc(doc(db, 'users', NIDHI_UID), { role: 'admin' });
```

The firestore.rules also have a hardcoded bypass for `bawa.atul@gmail.com` 
— update this to Nidhi's actual Google account email.

---

## Creating an Enrollment (After Payment)

The payment flow creates enrollments automatically via `api/razorpay/verify.ts`.

For manual enrollment (e.g. bank transfer):
1. Go to Nidhi's Coach Hub (/hub)
2. Currently: add enrollment directly in Firestore Console
3. V2: Admin enrollment creation UI (on roadmap)

Enrollment document structure:
```json
{
  "userId": "firebase_uid",
  "userEmail": "client@email.com",
  "userName": "Client Name",
  "programId": "kids-program",
  "programName": "The Inner Shield Program",
  "programSegment": "kids",
  "status": "active",
  "unlockedSessions": [1],
  "currentSession": 1,
  "totalSessions": 5,
  "meetLink": "https://zoom.us/j/...",
  "calendarLink": "https://calendly.com/nidhi-bawa/session",
  "startedAt": "2026-04-19T00:00:00Z",
  "createdAt": "2026-04-19T00:00:00Z",
  "updatedAt": "2026-04-19T00:00:00Z"
}
```

---

## Session Flow (How Nidhi Uses the Hub During a Call)

1. Open nidhibawa.com/hub in one browser tab
2. Start Zoom/Meet in another window or tab
3. In the hub: go to Clients tab → find the client → click their current session
4. The full module appears: icebreaker script, dialogue prompts, exercises
5. Client has nidhibawa.com/portal open on their device
6. Both work through the session content simultaneously
7. After the session: in the hub → add coach notes + homework → click "Unlock Session [N+1]"
8. Client sees the notes and homework in their portal automatically

---

## Revenue Projections (With Platform Active)

| Stream | Unit Price | Volume/Month | Monthly Revenue |
|---|---|---|---|
| Kids program enrollments | ₹18,000 | 4 | ₹72,000 |
| Parents program enrollments | ₹12,000 | 3 | ₹36,000 |
| Corporate workshop | ₹85,000 | 0.5 | ₹42,500 |
| Discovery calls → conversions | — | — | included above |
| **Total** | | | **₹1,50,500/month** |

At 50% capacity, that's ₹75,000/month. At full capacity, ₹1.5L+/month.
Year 1 target: ₹12–18L.

---

## Next Steps After Launch

**Week 1:**
- Deploy with Razorpay test keys
- Create Nidhi's admin account
- Add all 5 kids session modules to Notion
- Test complete flow: homepage → program page → pay → portal → session

**Week 2–3:**
- Switch to Razorpay live keys
- Add real testimonials + photos
- SEO meta tags on all pages
- Set up Google Search Console

**Month 2:**
- Add admin enrollment creation UI to Coach Hub
- Add session note viewing in Coach Hub (see client's exercise responses)
- Set up email nurture sequence (Mailchimp/ConvertKit)

**Month 3:**
- Group cohort enrollment (multiple clients, one program)
- Self-paced course mode (no live sessions)
- Stripe for global (USD) enrollments
