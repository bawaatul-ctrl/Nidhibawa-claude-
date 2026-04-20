// ─────────────────────────────────────────────────────────────
// FIRESTORE SERVICE
// All database reads/writes for the platform
// ─────────────────────────────────────────────────────────────

import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, where, getDocs, onSnapshot, serverTimestamp,
  arrayUnion, Timestamp, addDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  UserProfile, Enrollment, SessionNote,
  Program, PaymentRecord, ClientExercise
} from '../types/platform';

// ─── User ─────────────────────────────────────────────────

export async function upsertUserProfile(user: {
  uid: string; email: string | null;
  displayName: string | null; photoURL: string | null;
}): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      photoURL: user.photoURL ?? '',
      role: 'user',
      enrollments: [],
      createdAt: serverTimestamp(),
    });
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export function subscribeUserProfile(uid: string, cb: (p: UserProfile | null) => void) {
  return onSnapshot(doc(db, 'users', uid), snap => {
    cb(snap.exists() ? (snap.data() as UserProfile) : null);
  });
}

// ─── Programs (public) ───────────────────────────────────

export async function getAllPrograms(): Promise<Program[]> {
  const snap = await getDocs(query(collection(db, 'programs'), where('isActive', '==', true)));
  return snap.docs.map(d => d.data() as Program);
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const snap = await getDocs(query(collection(db, 'programs'), where('slug', '==', slug)));
  if (snap.empty) return null;
  return snap.docs[0].data() as Program;
}

// ─── Enrollments ─────────────────────────────────────────

export async function getEnrollmentsForUser(userId: string): Promise<Enrollment[]> {
  const snap = await getDocs(
    query(collection(db, 'enrollments'), where('userId', '==', userId))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Enrollment));
}

export function subscribeEnrollmentsForUser(userId: string, cb: (e: Enrollment[]) => void) {
  return onSnapshot(
    query(collection(db, 'enrollments'), where('userId', '==', userId)),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Enrollment)))
  );
}

export async function getEnrollmentById(id: string): Promise<Enrollment | null> {
  const snap = await getDoc(doc(db, 'enrollments', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Enrollment) : null;
}

// Admin: create enrollment after payment
export async function createEnrollment(data: Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'enrollments'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // Also update user's enrollments array
  await updateDoc(doc(db, 'users', data.userId), {
    enrollments: arrayUnion(ref.id),
  });
  return ref.id;
}

// Admin: unlock next session
export async function unlockNextSession(enrollmentId: string, sessionNumber: number): Promise<void> {
  await updateDoc(doc(db, 'enrollments', enrollmentId), {
    unlockedSessions: arrayUnion(sessionNumber),
    currentSession: sessionNumber,
    updatedAt: serverTimestamp(),
  });
}

// Admin: update meet link
export async function updateMeetLink(enrollmentId: string, meetLink: string): Promise<void> {
  await updateDoc(doc(db, 'enrollments', enrollmentId), {
    meetLink,
    updatedAt: serverTimestamp(),
  });
}

// Admin: mark enrollment complete
export async function completeEnrollment(enrollmentId: string): Promise<void> {
  await updateDoc(doc(db, 'enrollments', enrollmentId), {
    status: 'completed',
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// ─── Session Notes ────────────────────────────────────────

export async function getSessionNote(enrollmentId: string, sessionNumber: number): Promise<SessionNote | null> {
  const snap = await getDocs(
    query(
      collection(db, 'sessionNotes'),
      where('enrollmentId', '==', enrollmentId),
      where('sessionNumber', '==', sessionNumber)
    )
  );
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as SessionNote;
}

export function subscribeSessionNote(
  enrollmentId: string,
  sessionNumber: number,
  cb: (note: SessionNote | null) => void
) {
  return onSnapshot(
    query(
      collection(db, 'sessionNotes'),
      where('enrollmentId', '==', enrollmentId),
      where('sessionNumber', '==', sessionNumber)
    ),
    snap => cb(snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as SessionNote))
  );
}

export async function upsertSessionNote(
  enrollmentId: string,
  userId: string,
  programId: string,
  sessionNumber: number,
  exercises: ClientExercise[]
): Promise<void> {
  const existing = await getSessionNote(enrollmentId, sessionNumber);
  if (existing) {
    await updateDoc(doc(db, 'sessionNotes', existing.id), {
      clientExercises: exercises,
      updatedAt: serverTimestamp(),
    });
  } else {
    await addDoc(collection(db, 'sessionNotes'), {
      enrollmentId,
      userId,
      programId,
      sessionNumber,
      status: 'in_progress',
      clientExercises: exercises,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

// Admin: add coach notes + homework
export async function addCoachNotes(
  noteId: string,
  coachNotes: string,
  homework: string
): Promise<void> {
  await updateDoc(doc(db, 'sessionNotes', noteId), {
    coachNotes,
    homework,
    status: 'completed',
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Get all session notes for an enrollment (portal history view)
export async function getAllSessionNotes(enrollmentId: string): Promise<SessionNote[]> {
  const snap = await getDocs(
    query(collection(db, 'sessionNotes'), where('enrollmentId', '==', enrollmentId))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SessionNote));
}

// ─── Payments ─────────────────────────────────────────────

export async function createPaymentRecord(data: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'payments'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentRecord['status'],
  razorpayPaymentId?: string,
  razorpaySignature?: string
): Promise<void> {
  await updateDoc(doc(db, 'payments', paymentId), {
    status,
    ...(razorpayPaymentId && { razorpayPaymentId }),
    ...(razorpaySignature && { razorpaySignature }),
    updatedAt: serverTimestamp(),
  });
}

// ─── Admin: All Enrollments ───────────────────────────────

export async function getAllEnrollments(): Promise<Enrollment[]> {
  const snap = await getDocs(collection(db, 'enrollments'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Enrollment));
}

export async function getAllEnrollmentsForProgram(programId: string): Promise<Enrollment[]> {
  const snap = await getDocs(
    query(collection(db, 'enrollments'), where('programId', '==', programId))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Enrollment));
}
