// ─────────────────────────────────────────────────────────────
// CoachHub.tsx  (replaces /hub route in content hub)
// Admin-only. Full session scripts + client management.
// Route: /hub  (protected — admin role only)
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Baby, Briefcase, Search, BookOpen, MessageSquare,
  Target, Zap, ShieldCheck, ChevronRight, CheckCircle2,
  Unlock, FileText, Plus, MoreHorizontal, Video, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { coachingContent, ContentModule } from '@/src/data/content';
import {
  getAllEnrollments,
  unlockNextSession,
  updateMeetLink,
  addCoachNotes,
  getAllSessionNotes
} from '@/src/lib/firestoreService';
import type { Enrollment, SessionNote } from '@/src/types/platform';
import { cn } from '@/src/lib/utils';

// ─── Segment config ────────────────────────────────────────

const SEGMENTS = [
  { label: 'Kids / Students', slug: 'kids', icon: Baby, color: 'bg-rose-50 text-rose-700' },
  { label: 'Parents', slug: 'parents', icon: Users, color: 'bg-blue-50 text-blue-700' },
  { label: 'Corporate Professionals', slug: 'corporate', icon: Briefcase, color: 'bg-amber-50 text-amber-700' },
] as const;

const SEGMENT_MAP: Record<string, string> = {
  kids: 'Kids / Students',
  parents: 'Parents',
  corporate: 'Corporate Professionals',
};

export default function CoachHub() {
  const [hubTab, setHubTab] = useState<'modules' | 'clients'>('clients');
  const [activeSegment, setActiveSegment] = useState<'kids' | 'parents' | 'corporate'>('kids');
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<ContentModule | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // Load all enrollments
  useEffect(() => {
    getAllEnrollments().then(e => {
      setEnrollments(e);
      setLoadingClients(false);
    });
  }, []);

  const filteredModules = useMemo(() =>
    coachingContent.filter(m =>
      m.segment === SEGMENT_MAP[activeSegment] &&
      (m.topicTitle.toLowerCase().includes(search.toLowerCase()) ||
       m.painPoint.toLowerCase().includes(search.toLowerCase()))
    ), [activeSegment, search]);

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#5A5A40] mb-2">
            <ShieldCheck className="h-4 w-4" />
            Coach Hub — Private
          </div>
          <h1 className="text-3xl font-serif font-medium">Session Command Centre</h1>
        </div>
      </div>

      <Tabs value={hubTab} onValueChange={v => setHubTab(v as 'modules' | 'clients')}>
        <TabsList className="grid w-full max-w-sm grid-cols-2 rounded-full p-1 h-11">
          <TabsTrigger value="clients" className="rounded-full gap-2 text-sm">
            <Users className="h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="modules" className="rounded-full gap-2 text-sm">
            <BookOpen className="h-4 w-4" />
            Content Library
          </TabsTrigger>
        </TabsList>

        {/* ── CLIENTS TAB ── */}
        <TabsContent value="clients" className="mt-8 space-y-6">
          {loadingClients ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-[#5A5A40]" />
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-24 bg-muted/20 rounded-3xl space-y-3">
              <p className="text-muted-foreground">No enrolled clients yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map(enrollment => (
                <ClientCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  onUnlock={async (sessionNum) => {
                    await unlockNextSession(enrollment.id, sessionNum);
                    setEnrollments(prev => prev.map(e =>
                      e.id === enrollment.id
                        ? { ...e, unlockedSessions: [...e.unlockedSessions, sessionNum], currentSession: sessionNum }
                        : e
                    ));
                  }}
                  onUpdateMeetLink={async (link) => {
                    await updateMeetLink(enrollment.id, link);
                    setEnrollments(prev => prev.map(e =>
                      e.id === enrollment.id ? { ...e, meetLink: link } : e
                    ));
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── CONTENT LIBRARY TAB ── */}
        <TabsContent value="modules" className="mt-8 space-y-6">
          {/* Segment + Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              {SEGMENTS.map(seg => (
                <button
                  key={seg.slug}
                  onClick={() => { setActiveSegment(seg.slug as typeof activeSegment); setSelectedModule(null); }}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-semibold transition-all',
                    activeSegment === seg.slug
                      ? 'bg-[#5A5A40] text-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  {seg.label.split(' ')[0]}
                </button>
              ))}
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search topics..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-muted rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
              />
            </div>
          </div>

          {/* Module list + detail */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Module List */}
            <div className="space-y-3">
              {filteredModules.map(module => (
                <button
                  key={module.id}
                  onClick={() => setSelectedModule(module)}
                  className={cn(
                    'w-full text-left p-4 rounded-2xl border transition-all',
                    selectedModule?.id === module.id
                      ? 'border-[#5A5A40] bg-[#F5F5F0] shadow-sm'
                      : 'border-muted hover:border-[#5A5A40]/40 hover:shadow-sm'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{module.topicTitle}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{module.painPoint}</p>
                    </div>
                    <ChevronRight className={cn(
                      'h-4 w-4 transition-transform text-muted-foreground',
                      selectedModule?.id === module.id && 'rotate-90 text-[#5A5A40]'
                    )} />
                  </div>
                </button>
              ))}
            </div>

            {/* Module Detail */}
            {selectedModule ? (
              <ModuleDetail module={selectedModule} />
            ) : (
              <div className="hidden lg:flex items-center justify-center bg-muted/10 rounded-3xl border border-dashed border-muted min-h-[300px]">
                <p className="text-sm text-muted-foreground">Select a module to view full session content</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Client Card ─────────────────────────────────────────────

function ClientCard({
  enrollment,
  onUnlock,
  onUpdateMeetLink,
}: {
  enrollment: Enrollment;
  onUnlock: (sessionNum: number) => Promise<void>;
  onUpdateMeetLink: (link: string) => Promise<void>;
}) {
  const [unlocking, setUnlocking] = useState(false);
  const [editingLink, setEditingLink] = useState(false);
  const [linkValue, setLinkValue] = useState(enrollment.meetLink ?? '');
  const nextSession = enrollment.currentSession + 1;
  const canUnlockNext = nextSession <= enrollment.totalSessions;

  const handleUnlock = async () => {
    setUnlocking(true);
    await onUnlock(nextSession);
    setUnlocking(false);
  };

  const handleSaveLink = async () => {
    await onUpdateMeetLink(linkValue);
    setEditingLink(false);
  };

  return (
    <div className="bg-white border border-muted rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{enrollment.userName}</p>
          <p className="text-xs text-muted-foreground">{enrollment.userEmail}</p>
          <p className="text-sm text-[#5A5A40] font-medium mt-1">{enrollment.programName}</p>
        </div>
        <div className="text-right">
          <span className={cn(
            'inline-block text-xs font-semibold px-2.5 py-1 rounded-full',
            enrollment.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-muted text-muted-foreground'
          )}>
            {enrollment.status}
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            Session {enrollment.currentSession}/{enrollment.totalSessions}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1">
        {Array.from({ length: enrollment.totalSessions }, (_, i) => i + 1).map(n => (
          <div
            key={n}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              enrollment.unlockedSessions.includes(n)
                ? n < enrollment.currentSession ? 'bg-[#5A5A40]' : 'bg-[#5A5A40]/40'
                : 'bg-muted'
            )}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Unlock next session */}
        {canUnlockNext && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleUnlock}
            disabled={unlocking}
            className="rounded-full gap-2 text-xs border-[#5A5A40] text-[#5A5A40] hover:bg-[#5A5A40] hover:text-white"
          >
            {unlocking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5" />}
            Unlock Session {nextSession}
          </Button>
        )}

        {/* Set meet link */}
        {!editingLink ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingLink(true)}
            className="rounded-full gap-2 text-xs"
          >
            <Video className="h-3.5 w-3.5" />
            {enrollment.meetLink ? 'Edit call link' : 'Add call link'}
          </Button>
        ) : (
          <div className="flex gap-2 w-full">
            <input
              value={linkValue}
              onChange={e => setLinkValue(e.target.value)}
              placeholder="https://zoom.us/j/..."
              className="flex-1 text-xs border border-muted rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
            />
            <Button size="sm" onClick={handleSaveLink} className="rounded-full text-xs bg-[#5A5A40] text-white">Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingLink(false)} className="rounded-full text-xs">Cancel</Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Module Detail ────────────────────────────────────────────

function ModuleDetail({ module }: { module: ContentModule }) {
  return (
    <div className="bg-white border border-muted rounded-3xl p-6 overflow-y-auto max-h-[700px] space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{module.painPoint}</p>
        <h3 className="text-xl font-serif font-medium">{module.topicTitle}</h3>
      </div>

      {/* Problem */}
      <div className="bg-rose-50 rounded-xl p-4 text-sm text-rose-800 italic leading-relaxed">
        "{module.problemStatement}"
      </div>

      {/* Coaching approach */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Coaching approach</p>
        <p className="text-sm leading-relaxed">{module.coachingApproach}</p>
      </div>

      {/* Session flow */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Icebreaker</p>
        <p className="text-sm text-muted-foreground italic">{module.sessionFlow.icebreaker}</p>

        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4">Dialogue script</p>
        {module.sessionFlow.dialogue.map((d, i) => (
          <div key={i} className="space-y-1">
            <div className="flex gap-2">
              <span className="text-xs font-bold text-[#5A5A40] w-20 shrink-0">Coach:</span>
              <p className="text-sm">{d.coach}</p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs font-bold text-muted-foreground w-20 shrink-0">Client:</span>
              <p className="text-sm text-muted-foreground italic">{d.participant}</p>
            </div>
          </div>
        ))}

        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4">Reflection questions</p>
        {module.sessionFlow.reflectionQuestions.map((q, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-[#5A5A40]">→</span>
            <p className="text-sm">{q}</p>
          </div>
        ))}

        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4">Exercises</p>
        {module.exercises.map((e, i) => (
          <div key={i} className="p-3 bg-muted/30 rounded-xl">
            <p className="text-sm font-semibold">{e.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{e.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
