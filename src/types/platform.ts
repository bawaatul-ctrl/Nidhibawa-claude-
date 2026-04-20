// ─────────────────────────────────────────────────────────────
// PLATFORM TYPES
// Single source of truth for all data structures
// Used by: website, portal, coach hub, Firestore
// ─────────────────────────────────────────────────────────────

export type ProgramSegment = 'kids' | 'parents' | 'corporate';

export type EnrollmentStatus = 'pending_payment' | 'active' | 'completed' | 'paused';

export type SessionStatus = 'locked' | 'upcoming' | 'in_progress' | 'completed';

// ─── User ───────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin';
  enrollments: string[]; // enrollment IDs
  createdAt: Date;
}

// ─── Program (Firestore + Notion-backed) ────────────────────

export interface ProgramSessionPreview {
  sessionNumber: number;
  title: string;
  durationMinutes: number;
  objectiveSummary: string;    // Public: 1-2 sentences
  activitiesPreview: string[]; // Public: 3-4 bullet points (type, not content)
  outcomeStatement: string;    // Public: what they'll walk away with
  notionPageId?: string;       // Links to full content in Notion
}

export interface Program {
  id: string;
  slug: string;
  segment: ProgramSegment;
  name: string;
  tagline: string;
  description: string;
  forWhom: string[];           // "Parents of children 8-14 who..."
  painPoints: string[];        // "Your child struggles with..."
  outcomes: string[];          // "After this program..."
  sessionCount: number;
  durationWeeks: number;
  priceINR: number;
  priceUSD?: number;
  sessions: ProgramSessionPreview[];
  testimonials?: ProgramTestimonial[];
  isActive: boolean;
  razorpayPlanId?: string;
}

export interface ProgramTestimonial {
  quote: string;
  author: string;
  role: string;
  photoUrl?: string;
}

// ─── Enrollment ─────────────────────────────────────────────

export interface Enrollment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  programId: string;
  programName: string;
  programSegment: ProgramSegment;
  status: EnrollmentStatus;
  unlockedSessions: number[];  // [1, 2, 3] — session numbers
  currentSession: number;
  totalSessions: number;
  paymentId?: string;
  paymentAmount?: number;
  meetLink?: string;           // Zoom/Meet link for this client
  calendarLink?: string;       // Calendly link for this client
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Session Notes ───────────────────────────────────────────

export interface ClientExercise {
  exerciseId: string;
  title: string;
  response: string;
  completedAt?: Date;
}

export interface SessionNote {
  id: string;
  enrollmentId: string;
  userId: string;
  programId: string;
  sessionNumber: number;
  status: SessionStatus;
  clientExercises: ClientExercise[];
  coachNotes?: string;          // Nidhi writes — client can read
  homework?: string;            // Set by Nidhi post-session
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Payment ─────────────────────────────────────────────────

export interface PaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  programId: string;
  programName: string;
  amountINR: number;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

// ─── Notion Content (fetched at runtime) ─────────────────────

export interface NotionSessionContent {
  notionPageId: string;
  sessionNumber: number;
  programId: string;
  icebreaker: string;
  coachingApproach: string;
  dialogueScript: { coach: string; participant: string }[];
  reflectionQuestions: string[];
  activities: string[];
  exercises: { id: string; title: string; description: string; inputType: 'text' | 'list' | 'scale' }[];
  application: string;
  lastSynced: Date;
}
