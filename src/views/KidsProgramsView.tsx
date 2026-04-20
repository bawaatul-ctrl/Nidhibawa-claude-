// ─────────────────────────────────────────────────────────────
// KidsProgramsView.tsx — UPDATED
// Now includes session preview and enrollment flow
// Replace existing src/views/KidsProgramsView.tsx
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Star, Users, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgramHub } from '@/src/components/ProgramHub';
import { SessionPreview } from '@/src/components/SessionPreview';
import { EnrollButton } from '@/src/components/EnrollButton';
import { BookingDialog } from '@/src/components/BookingDialog';
import { getProgramBySegment } from '@/src/data/platformPrograms';
import { FAQSection } from '@/src/components/FAQSection';

const program = getProgramBySegment('kids')!;

const faqs = [
  {
    question: 'What age is this program for?',
    answer: 'The Inner Shield Program is designed for children aged 8–16. The activities and language are adapted for each child — we work differently with a 9-year-old than with a 15-year-old.',
  },
  {
    question: 'Does my child need to be in "crisis" to benefit?',
    answer: 'Not at all. Many of our most successful clients are children who are functioning well but whose parents can see they\'re holding back, struggling quietly, or heading into a difficult phase like secondary school or board exams.',
  },
  {
    question: 'Are parents involved in the sessions?',
    answer: 'Sessions are one-on-one between Nidhi and your child to build trust and safety. However, after each session Nidhi shares a brief parent update with key insights and how to support the work at home.',
  },
  {
    question: 'How are sessions delivered?',
    answer: 'Sessions are on Zoom or Google Meet. Your child will have their own personal portal — a private, safe space where they do their exercises and keep their notes. Both Nidhi and your child have it open during the session.',
  },
  {
    question: 'What if my child is reluctant to try coaching?',
    answer: 'This is very common. Nidhi\'s approach is non-clinical and non-intimidating — it feels more like an interesting conversation with a trusted adult than "seeing someone." A free discovery call with Nidhi (and optionally the child) usually resolves this.',
  },
];

export default function KidsProgramsView() {
  return (
    <div className="space-y-0 pb-24">
      {/* Back nav */}
      <div className="pt-2 pb-6">
        <Button variant="ghost" size="sm" asChild className="rounded-full">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Hero */}
      <section className="space-y-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl space-y-6"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
              Kids & Teens · Ages 8–16
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-medium leading-tight">
            {program.name}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {program.tagline}
          </p>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            {program.description}
          </p>

          {/* Quick facts */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {program.sessionCount} sessions · {program.durationWeeks} weeks
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              1:1 with Nidhi
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              Personal coaching portal included
            </span>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-3 pt-2">
            <EnrollButton program={program} />
            <BookingDialog>
              <Button size="lg" variant="outline" className="rounded-full border-[#5A5A40] text-[#5A5A40] hover:bg-[#5A5A40] hover:text-white">
                Book a free discovery call
              </Button>
            </BookingDialog>
          </div>
        </motion.div>
      </section>

      {/* Pain Points + Outcomes */}
      <section className="py-16 grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-medium">Does this sound familiar?</h2>
          <ul className="space-y-3">
            {program.painPoints.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <span className="text-rose-400 mt-0.5">—</span>
                <span className="text-sm leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-medium">What changes after this program</h2>
          <ul className="space-y-3">
            {program.outcomes.map((o, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#5A5A40] mt-0.5 shrink-0" />
                <span className="text-sm leading-relaxed">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Session Preview — the IP-safe, trust-building section */}
      <SessionPreview
        program={program}
        onEnroll={() => {
          document.getElementById('enroll-cta')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Testimonials */}
      {program.testimonials && program.testimonials.length > 0 && (
        <section className="py-16 space-y-8">
          <h2 className="text-3xl font-serif font-medium text-center">What parents say</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {program.testimonials.map((t, i) => (
              <div key={i} className="bg-[#F5F5F0] rounded-2xl p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-[#5A5A40] text-[#5A5A40]" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed italic">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <FAQSection items={faqs} title="Questions about the program" description="" />

      {/* Final CTA */}
      <section id="enroll-cta" className="bg-[#5A5A40] text-white rounded-[3rem] p-12 md:p-20 text-center space-y-8">
        <h2 className="text-3xl md:text-4xl font-serif font-medium max-w-2xl mx-auto">
          Ready to give your child the tools they need?
        </h2>
        <p className="text-white/75 max-w-xl mx-auto">
          ₹{program.priceINR.toLocaleString('en-IN')} · {program.sessionCount} sessions · Personal portal · Zoom or Google Meet
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <EnrollButton
            program={program}
            className="bg-white text-[#5A5A40] hover:bg-white/90 border-white"
          />
          <BookingDialog>
            <Button size="lg" variant="outline" className="rounded-full border-white/40 text-white hover:bg-white/10 px-10">
              Discovery call first
            </Button>
          </BookingDialog>
        </div>
      </section>
    </div>
  );
}
