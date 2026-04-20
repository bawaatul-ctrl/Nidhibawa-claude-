// ─────────────────────────────────────────────────────────────
// SessionPreview.tsx
// PUBLIC component — shown on program pages before enrollment
// Shows: objective, activity types, outcome. NOT the full script.
// Converts browsers into buyers by eliminating "what will happen?"
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Clock, CheckCircle2, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProgramSessionPreview, Program } from '@/src/types/platform';
import { BookingDialog } from '@/src/components/BookingDialog';
import { cn } from '@/src/lib/utils';

interface SessionPreviewProps {
  program: Program;
  onEnroll?: () => void;
}

export function SessionPreview({ program, onEnroll }: SessionPreviewProps) {
  const [openSession, setOpenSession] = useState<number | null>(1);

  return (
    <section className="py-16 space-y-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#5A5A40]/10 px-4 py-1.5 text-sm font-medium text-[#5A5A40]">
          <Sparkles className="h-4 w-4" />
          Inside the program
        </div>
        <h2 className="text-3xl md:text-4xl font-serif font-medium">What happens in each session?</h2>
        <p className="text-muted-foreground">
          Every session has a clear objective, a structured activity, and a concrete outcome.
          No vague conversations — each one moves you forward.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {program.sessions.map((session, idx) => {
          const isOpen = openSession === session.sessionNumber;
          const isLast = idx === program.sessions.length - 1;

          return (
            <motion.div
              key={session.sessionNumber}
              initial={false}
              className={cn(
                'border rounded-2xl overflow-hidden transition-all duration-300',
                isOpen
                  ? 'border-[#5A5A40] shadow-sm'
                  : 'border-muted hover:border-[#5A5A40]/40'
              )}
            >
              {/* Session Header — always visible */}
              <button
                onClick={() => setOpenSession(isOpen ? null : session.sessionNumber)}
                className="w-full flex items-center justify-between p-5 text-left gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={cn(
                    'h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors',
                    isOpen
                      ? 'bg-[#5A5A40] text-white'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {session.sessionNumber}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-base truncate">{session.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {session.durationMinutes} min
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronDown className={cn(
                  'h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )} />
              </button>

              {/* Session Detail — expands on click */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-5 pb-6 space-y-5 border-t border-muted">
                      {/* Objective */}
                      <div className="pt-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                          What you'll work on
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                          {session.objectiveSummary}
                        </p>
                      </div>

                      {/* Activities Preview */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                          The session includes
                        </p>
                        <ul className="space-y-2">
                          {session.activitiesPreview.map((activity, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-[#5A5A40] mt-1.5 shrink-0" />
                              <p className="text-sm text-muted-foreground">{activity}</p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Outcome */}
                      <div className="bg-[#F5F5F0] rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-4 w-4 text-[#5A5A40] mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A40] mb-1">
                              By the end of this session
                            </p>
                            <p className="text-sm font-medium text-[#3A3A28]">
                              {session.outcomeStatement}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* IP Gate — teases full content */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground border border-dashed border-muted rounded-lg p-3">
                        <Lock className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          Full exercises, reflection prompts, and take-home activities are
                          available in your personal portal after enrolling.
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Enroll CTA below session list */}
      <div className="flex flex-col items-center gap-4 pt-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#5A5A40]" />
            {program.sessionCount} structured sessions
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#5A5A40]" />
            Personal coaching portal
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#5A5A40]" />
            On Zoom / Google Meet
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {onEnroll ? (
            <Button
              size="lg"
              onClick={onEnroll}
              className="rounded-full bg-[#5A5A40] hover:bg-[#4A4A35] px-10 font-semibold text-white"
            >
              Enroll for ₹{program.priceINR.toLocaleString('en-IN')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
          <BookingDialog>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-[#5A5A40] text-[#5A5A40] hover:bg-[#5A5A40] hover:text-white px-10"
            >
              Book a free discovery call first
            </Button>
          </BookingDialog>
        </div>
        <p className="text-xs text-muted-foreground">
          Secure payment via Razorpay · UPI, cards, net banking accepted
        </p>
      </div>
    </section>
  );
}
