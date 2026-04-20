// ─────────────────────────────────────────────────────────────
// PortalSessionPage.tsx
// The live session interface — used during the actual coaching call
// Client: does exercises, fills in reflections, sees their notes
// Both Nidhi and client browse this during the Zoom/Meet session
// Route: /portal/session/:enrollmentId/:sessionNumber
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft, BookOpen, MessageSquare, Target, Zap,
  CheckCircle2, Save, Loader2, Video, ChevronRight,
  Sparkles, PenLine, ListChecks, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/src/components/AuthProvider';
import {
  getEnrollmentById,
  subscribeSessionNote,
  upsertSessionNote
} from '@/src/lib/firestoreService';
import {
  fetchSessionContent,
  getFallbackSessionContent
} from '@/src/lib/notionService';
import type { Enrollment, SessionNote, ClientExercise, NotionSessionContent } from '@/src/types/platform';
import { cn } from '@/src/lib/utils';

export default function PortalSessionPage() {
  const { enrollmentId, sessionNumber } = useParams<{
    enrollmentId: string;
    sessionNumber: string;
  }>();
  const { user } = useAuth();
  const sessionNum = Number(sessionNumber);

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [sessionNote, setSessionNote] = useState<SessionNote | null>(null);
  const [content, setContent] = useState<NotionSessionContent | null>(null);
  const [exercises, setExercises] = useState<ClientExercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load enrollment + session note (realtime)
  useEffect(() => {
    if (!enrollmentId) return;
    getEnrollmentById(enrollmentId).then(setEnrollment);

    const unsub = subscribeSessionNote(enrollmentId, sessionNum, (note) => {
      setSessionNote(note);
      if (note?.clientExercises?.length) {
        setExercises(note.clientExercises);
      }
    });
    return unsub;
  }, [enrollmentId, sessionNum]);

  // Load session content from Notion (with fallback to content.ts)
  useEffect(() => {
    if (!enrollment) return;

    const load = async () => {
      setLoading(true);
      const sessionPreview = enrollment && null; // enrollment.program?.sessions?.[sessionNum-1]
      const notionPageId = ''; // sessionPreview?.notionPageId ?? '';

      let c: NotionSessionContent | null = null;
      if (notionPageId) {
        c = await fetchSessionContent(notionPageId, sessionNum, enrollment.programId);
      }
      if (!c) {
        c = await getFallbackSessionContent(enrollment.programId, sessionNum);
      }
      setContent(c);

      // Initialize exercises from content if not already in Firestore
      if (c && exercises.length === 0) {
        setExercises(c.exercises.map(ex => ({
          exerciseId: ex.id,
          title: ex.title,
          response: '',
        })));
      }
      setLoading(false);
    };

    load();
  }, [enrollment, sessionNum]);

  // Autosave exercises with debounce
  const saveExercises = useCallback(async () => {
    if (!enrollmentId || !user || exercises.every(e => !e.response)) return;
    setSaving(true);
    try {
      await upsertSessionNote(
        enrollmentId,
        user.uid,
        enrollment?.programId ?? '',
        sessionNum,
        exercises
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  }, [enrollmentId, user, enrollment, sessionNum, exercises]);

  // Autosave every 30 seconds
  useEffect(() => {
    const timer = setInterval(saveExercises, 30000);
    return () => clearInterval(timer);
  }, [saveExercises]);

  const updateExercise = (exerciseId: string, response: string) => {
    setExercises(prev => prev.map(e =>
      e.exerciseId === exerciseId ? { ...e, response } : e
    ));
    setSaved(false);
  };

  if (!content && loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5A5A40]" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Session content unavailable. Please contact Nidhi.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="rounded-full">
            <Link to="/portal">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              My programs
            </Link>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">Session {sessionNum}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Save status */}
          <div className={cn(
            'flex items-center gap-1.5 text-xs transition-all duration-300',
            saved ? 'text-green-600' : 'text-muted-foreground'
          )}>
            {saving ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</>
            ) : saved ? (
              <><CheckCircle2 className="h-3.5 w-3.5" /> Saved</>
            ) : null}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={saveExercises}
            disabled={saving}
            className="rounded-full gap-2 text-sm"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>

          {/* Join Call */}
          {enrollment?.meetLink && (
            <a href={enrollment.meetLink} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="rounded-full gap-2 bg-[#5A5A40] hover:bg-[#4A4A35] text-white">
                <Video className="h-3.5 w-3.5" />
                Join call
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Session Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#5A5A40]/10 text-[#5A5A40]">
            <Sparkles className="h-3 w-3" />
            Session {sessionNum}
          </span>
          {sessionNote?.completedAt && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </span>
          )}
        </div>
        <h1 className="text-3xl font-serif font-medium">{content.coachingApproach.split('.')[0]}</h1>
      </div>

      {/* Tabs: Icebreaker | Activities | Exercises | Reflection | Notes */}
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-full p-1 h-12 bg-muted/50">
          <TabsTrigger value="activities" className="rounded-full text-xs sm:text-sm gap-1.5">
            <Target className="h-3.5 w-3.5 hidden sm:block" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="exercises" className="rounded-full text-xs sm:text-sm gap-1.5">
            <PenLine className="h-3.5 w-3.5 hidden sm:block" />
            Exercises
          </TabsTrigger>
          <TabsTrigger value="reflection" className="rounded-full text-xs sm:text-sm gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 hidden sm:block" />
            Reflection
          </TabsTrigger>
          <TabsTrigger value="notes" className="rounded-full text-xs sm:text-sm gap-1.5">
            <BookOpen className="h-3.5 w-3.5 hidden sm:block" />
            Notes
          </TabsTrigger>
        </TabsList>

        {/* ── Activities Tab ── */}
        <TabsContent value="activities" className="space-y-6 mt-6">
          <div className="bg-[#F5F5F0] rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-[#5A5A40] flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Icebreaker
                </p>
                <p className="text-sm leading-relaxed">{content.icebreaker}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Session activities
            </p>
            {content.activities.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-4 bg-white border border-muted rounded-xl"
              >
                <div className="h-6 w-6 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed">{activity}</p>
              </motion.div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Application (between sessions)
            </p>
            <div className="flex items-start gap-3 p-4 bg-white border border-[#5A5A40]/20 rounded-xl">
              <CheckCircle2 className="h-5 w-5 text-[#5A5A40] shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed font-medium">{content.application}</p>
            </div>
          </div>
        </TabsContent>

        {/* ── Exercises Tab ── */}
        <TabsContent value="exercises" className="space-y-5 mt-6">
          <p className="text-sm text-muted-foreground">
            Complete these exercises during or after the session. Your responses are saved automatically.
          </p>
          {exercises.map((exercise, i) => {
            const def = content.exercises.find(e => e.id === exercise.exerciseId) ?? content.exercises[i];
            return (
              <div key={exercise.exerciseId} className="space-y-3 bg-white border border-muted rounded-2xl p-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-[#5A5A40] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {i + 1}
                    </span>
                    <p className="font-semibold text-sm">{exercise.title}</p>
                    {exercise.response && (
                      <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto shrink-0" />
                    )}
                  </div>
                  {def?.description && (
                    <p className="text-xs text-muted-foreground pl-7">{def.description}</p>
                  )}
                </div>
                <textarea
                  value={exercise.response}
                  onChange={e => updateExercise(exercise.exerciseId, e.target.value)}
                  placeholder="Write your thoughts here..."
                  rows={4}
                  className="w-full text-sm border border-muted rounded-xl p-3.5 bg-[#FDFCFB] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40] transition-all resize-none placeholder:text-muted-foreground/60"
                />
              </div>
            );
          })}

          <Button
            onClick={saveExercises}
            disabled={saving || exercises.every(e => !e.response)}
            className="w-full rounded-full bg-[#5A5A40] hover:bg-[#4A4A35] text-white gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save exercises'}
          </Button>
        </TabsContent>

        {/* ── Reflection Tab ── */}
        <TabsContent value="reflection" className="space-y-4 mt-6">
          <p className="text-sm text-muted-foreground">
            Take a moment to reflect on these questions — either during the session or after.
          </p>
          {content.reflectionQuestions.map((q, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-white border border-muted rounded-xl">
              <span className="text-[#5A5A40] font-serif text-2xl leading-none mt-0.5">"</span>
              <p className="text-sm leading-relaxed italic">{q}</p>
            </div>
          ))}
        </TabsContent>

        {/* ── Notes Tab ── */}
        <TabsContent value="notes" className="space-y-5 mt-6">
          {/* Coach's notes (if any) */}
          {sessionNote?.coachNotes && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                From Nidhi
              </p>
              <div className="p-5 bg-[#F5F5F0] border border-[#5A5A40]/20 rounded-2xl">
                <p className="text-sm leading-relaxed">{sessionNote.coachNotes}</p>
              </div>
            </div>
          )}

          {/* Homework */}
          {sessionNote?.homework && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                This week's homework
              </p>
              <div className="flex items-start gap-3 p-5 bg-white border border-[#5A5A40] rounded-2xl">
                <ListChecks className="h-5 w-5 text-[#5A5A40] shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed font-medium">{sessionNote.homework}</p>
              </div>
            </div>
          )}

          {!sessionNote?.coachNotes && !sessionNote?.homework && (
            <div className="text-center py-12 space-y-2 bg-muted/20 rounded-2xl">
              <p className="text-sm text-muted-foreground">
                Nidhi will add notes and homework after your session.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
