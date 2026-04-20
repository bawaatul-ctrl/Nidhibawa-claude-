// ─────────────────────────────────────────────────────────────
// ParentProgramsView.tsx — UPDATED
// Replace existing src/views/ParentProgramsView.tsx
// ─────────────────────────────────────────────────────────────

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Star, Users, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SessionPreview } from '@/src/components/SessionPreview';
import { EnrollButton } from '@/src/components/EnrollButton';
import { BookingDialog } from '@/src/components/BookingDialog';
import { getProgramBySegment } from '@/src/data/platformPrograms';
import { FAQSection } from '@/src/components/FAQSection';

const program = getProgramBySegment('parents')!;

const faqs = [
  {
    question: 'Do both parents need to attend?',
    answer: 'It\'s most effective when both parents can join, but not required. Even one parent changing their approach creates meaningful change in the home dynamic.',
  },
  {
    question: 'Does my child need to be involved?',
    answer: 'These sessions are for you as a parent. However, if it makes sense, Nidhi may suggest one joint session with your child as part of the program.',
  },
  {
    question: 'My child is a teenager — is this still relevant?',
    answer: 'Yes, especially for teenagers. The teen years are when most parent-child communication breaks down. The tools in this program are specifically designed for the challenges of parenting adolescents.',
  },
  {
    question: 'I\'ve read all the parenting books. How is this different?',
    answer: 'Books give you theory. This program gives you practice. We work on your specific patterns, your specific child, and the specific situations happening in your home right now.',
  },
];

export default function ParentProgramsView() {
  return (
    <div className="space-y-0 pb-24">
      <div className="pt-2 pb-6">
        <Button variant="ghost" size="sm" asChild className="rounded-full">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <section className="space-y-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl space-y-6"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Conscious Parenting
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-medium leading-tight">
            {program.name}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">{program.tagline}</p>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">{program.description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{program.sessionCount} sessions · {program.durationWeeks} weeks</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />1:1 with Nidhi</span>
            <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" />For parents of children of all ages</span>
          </div>

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

      <section className="py-16 grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-medium">Does this sound familiar?</h2>
          <ul className="space-y-3">
            {program.painPoints.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <span className="text-blue-400 mt-0.5">—</span>
                <span className="text-sm leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-medium">What changes</h2>
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

      <SessionPreview program={program} />

      {program.testimonials && program.testimonials.length > 0 && (
        <section className="py-16 space-y-8">
          <h2 className="text-3xl font-serif font-medium text-center">What parents say</h2>
          <div className="max-w-lg mx-auto">
            {program.testimonials.map((t, i) => (
              <div key={i} className="bg-[#F5F5F0] rounded-2xl p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, s) => <Star key={s} className="h-4 w-4 fill-[#5A5A40] text-[#5A5A40]" />)}
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

      <FAQSection items={faqs} title="Questions about the program" description="" />

      <section className="bg-[#5A5A40] text-white rounded-[3rem] p-12 md:p-20 text-center space-y-8">
        <h2 className="text-3xl md:text-4xl font-serif font-medium max-w-2xl mx-auto">
          The relationship you want with your child starts here.
        </h2>
        <p className="text-white/75 max-w-xl mx-auto">
          ₹{program.priceINR.toLocaleString('en-IN')} · {program.sessionCount} sessions · Personal portal included
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <EnrollButton program={program} className="bg-white text-[#5A5A40] hover:bg-white/90 border-white" />
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
