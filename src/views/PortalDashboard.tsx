// ─────────────────────────────────────────────────────────────
// PortalDashboard.tsx
// Client-facing portal — shown after login
// Displays enrolled programs, session progress, and join call
// Route: /portal
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, BookOpen, CheckCircle2, Clock, Lock, Video,
  Calendar, ArrowRight, LogOut, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/src/components/AuthProvider';
import { logout } from '@/src/lib/firebase';
import { subscribeEnrollmentsForUser } from '@/src/lib/firestoreService';
import type { Enrollment } from '@/src/types/platform';
import { cn } from '@/src/lib/utils';

const segmentColors: Record<string, string> = {
  kids: 'bg-rose-50 text-rose-700 border-rose-200',
  parents: 'bg-blue-50 text-blue-700 border-blue-200',
  corporate: 'bg-amber-50 text-amber-700 border-amber-200',
};

const segmentLabels: Record<string, string> = {
  kids: 'Kids & Teens',
  parents: 'Conscious Parenting',
  corporate: 'Corporate Leadership',
};

export default function PortalDashboard() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const isWelcome = params.get('welcome') === 'true';
  const enrollmentParam = params.get('enrollment');

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeEnrollmentsForUser(user.uid, (data) => {
      setEnrollments(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-[#5A5A40] flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Loading your programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-24">

      {/* Welcome Banner (shown right after payment) */}
      <AnimatePresence>
        {isWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="bg-[#5A5A40] text-white rounded-2xl p-6 flex items-start gap-4"
          >
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">You're enrolled!</h3>
              <p className="text-white/80 text-sm mt-0.5">
                A welcome email is on its way. Your first session is unlocked below.
                Nidhi will be in touch with your session date and Zoom link.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-medium">
            Welcome back, {user?.displayName?.split(' ')[0]}.
          </h1>
          <p className="text-muted-foreground mt-1">Your coaching programs</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout()}
          className="text-muted-foreground hover:text-foreground rounded-full gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>

      {/* No enrollments */}
      {enrollments.length === 0 && (
        <div className="text-center py-24 space-y-6 bg-[#F5F5F0] rounded-3xl">
          <div className="h-16 w-16 rounded-full bg-[#5A5A40]/10 flex items-center justify-center mx-auto">
            <BookOpen className="h-8 w-8 text-[#5A5A40]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-serif font-medium">No programs yet</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Enroll in a coaching program to get started.
            </p>
          </div>
          <Button asChild className="rounded-full bg-[#5A5A40] hover:bg-[#4A4A35] text-white">
            <Link to="/programs">Browse Programs</Link>
          </Button>
        </div>
      )}

      {/* Enrollment Cards */}
      <div className="space-y-6">
        {enrollments.map((enrollment) => (
          <EnrollmentCard
            key={enrollment.id}
            enrollment={enrollment}
            isHighlighted={enrollment.id === enrollmentParam}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Enrollment Card ─────────────────────────────────────────

function EnrollmentCard({
  enrollment,
  isHighlighted,
}: {
  enrollment: Enrollment;
  isHighlighted: boolean;
}) {
  const navigate = useNavigate();
  const completedSessions = enrollment.unlockedSessions.filter(
    n => n < enrollment.currentSession
  ).length;
  const progress = Math.round((completedSessions / enrollment.totalSessions) * 100);

  return (
    <motion.div
      initial={isHighlighted ? { scale: 0.98, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, type: 'spring' }}
      className={cn(
        'bg-white border rounded-3xl overflow-hidden',
        isHighlighted ? 'border-[#5A5A40] shadow-md' : 'border-muted shadow-sm'
      )}
    >
      {/* Card Header */}
      <div className="p-6 border-b border-muted">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className={cn(
              'inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border',
              segmentColors[enrollment.programSegment]
            )}>
              {segmentLabels[enrollment.programSegment]}
            </span>
            <h2 className="text-xl font-serif font-medium mt-2">{enrollment.programName}</h2>
            <p className="text-sm text-muted-foreground">
              Session {enrollment.currentSession} of {enrollment.totalSessions} · {enrollment.status === 'active' ? 'In progress' : enrollment.status}
            </p>
          </div>

          {/* Join Call Button */}
          {enrollment.meetLink && enrollment.status === 'active' && (
            <a
              href={enrollment.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#5A5A40] hover:bg-[#4A4A35] text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors shrink-0"
            >
              <Video className="h-4 w-4" />
              Join Session
            </a>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedSessions} sessions completed</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full bg-[#5A5A40] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: enrollment.totalSessions }, (_, i) => i + 1).map((sessionNum) => {
          const isUnlocked = enrollment.unlockedSessions.includes(sessionNum);
          const isCurrent = sessionNum === enrollment.currentSession;
          const isCompleted = isUnlocked && sessionNum < enrollment.currentSession;

          return (
            <button
              key={sessionNum}
              disabled={!isUnlocked}
              onClick={() => isUnlocked && navigate(`/portal/session/${enrollment.id}/${sessionNum}`)}
              className={cn(
                'flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200',
                isUnlocked
                  ? 'hover:border-[#5A5A40] hover:shadow-sm cursor-pointer'
                  : 'opacity-50 cursor-not-allowed',
                isCurrent && 'border-[#5A5A40] bg-[#F5F5F0]',
                isCompleted && 'bg-muted/30',
                !isUnlocked && 'bg-muted/10'
              )}
            >
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                isCompleted && 'bg-[#5A5A40] text-white',
                isCurrent && 'bg-[#5A5A40] text-white',
                !isUnlocked && 'bg-muted text-muted-foreground',
              )}>
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : sessionNum}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn(
                  'text-xs font-semibold truncate',
                  isCurrent ? 'text-[#5A5A40]' : isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  Session {sessionNum}
                  {isCurrent && <span className="ml-1 text-[#5A5A40]">· Current</span>}
                </p>
              </div>
              {isUnlocked ? (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Calendar link */}
      {enrollment.calendarLink && (
        <div className="px-6 pb-5">
          <a
            href={enrollment.calendarLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[#5A5A40] hover:text-[#4A4A35] font-medium"
          >
            <Calendar className="h-4 w-4" />
            Schedule your next session
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </motion.div>
  );
}
