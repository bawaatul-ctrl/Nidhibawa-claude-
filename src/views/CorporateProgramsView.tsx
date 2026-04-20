// ─────────────────────────────────────────────────────────────
// CorporateProgramsView.tsx — UPDATED
// Replace existing src/views/CorporateProgramsView.tsx
// ─────────────────────────────────────────────────────────────

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Star, Users, Clock, Building2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SessionPreview } from '@/src/components/SessionPreview';
import { BookingDialog } from '@/src/components/BookingDialog';
import { getProgramBySegment } from '@/src/data/platformPrograms';
import { FAQSection } from '@/src/components/FAQSection';
import { CONTACT_INFO } from '@/src/data/strategy';

const program = getProgramBySegment('corporate')!;

const faqs = [
  {
    question: 'Can this be delivered as a single day workshop?',
    answer: 'Yes. The program can be compressed into a full-day intensive (6–7 hours with breaks) or spread across 8 bi-weekly sessions of 90 minutes each. Most organisations find the distributed format creates more lasting behaviour change.',
  },
  {
    question: 'What team size works best?',
    answer: 'The EQ Leadership Workshop is designed for 10–25 participants. For larger organisations, we can run it in cohorts or design a custom programme at scale.',
  },
  {
    question: 'Do you offer in-person delivery?',
    answer: 'Yes. Nidhi delivers in-person in Delhi NCR. For other locations, travel costs are added. Remote delivery via Zoom is available globally and equally effective for this content.',
  },
  {
    question: 'How do you measure impact?',
    answer: 'We run an EQ diagnostic at the start and end of the programme, and use session feedback forms after each workshop. Organisations that want formal ROI measurement can request a 90-day follow-up survey.',
  },
  {
    question: 'Can you customise the content for our industry?',
    answer: 'Yes — Nidhi does a briefing call with the HR manager or team lead before every engagement to understand the specific context, team dynamics, and challenges. The frameworks stay consistent but the examples and scenarios are tailored.',
  },
];

export default function CorporateProgramsView() {
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
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
            Corporate Leadership · Teams of 10–25
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-medium leading-tight">
            {program.name}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">{program.tagline}</p>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">{program.description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{program.sessionCount} sessions · {program.durationWeeks} weeks</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />10–25 participants</span>
            <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" />In-person or virtual</span>
          </div>

          {/* Corporate: no direct pay — use enquiry flow */}
          <div className="flex flex-wrap gap-3 pt-2">
            <a href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=Hi Nidhi, I'm interested in the EQ Leadership Workshop for my team.`} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="rounded-full bg-[#5A5A40] hover:bg-[#4A4A35] text-white gap-2">
                <MessageSquare className="h-4 w-4" />
                Request a proposal
              </Button>
            </a>
            <BookingDialog>
              <Button size="lg" variant="outline" className="rounded-full border-[#5A5A40] text-[#5A5A40] hover:bg-[#5A5A40] hover:text-white">
                Book an intro call
              </Button>
            </BookingDialog>
          </div>
          <p className="text-xs text-muted-foreground">
            Starting from ₹{program.priceINR.toLocaleString('en-IN')} for teams of 10–25 · Custom pricing for larger groups
          </p>
        </motion.div>
      </section>

      <section className="py-16 grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-medium">Sound familiar?</h2>
          <ul className="space-y-3">
            {program.painPoints.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <span className="text-amber-500 mt-0.5">—</span>
                <span className="text-sm leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-medium">What the team gains</h2>
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
          <h2 className="text-3xl font-serif font-medium text-center">What organisations say</h2>
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

      <FAQSection items={faqs} title="Questions about the workshop" description="" />

      <section className="bg-[#1A1A1A] text-white rounded-[3rem] p-12 md:p-20 text-center space-y-8">
        <h2 className="text-3xl md:text-4xl font-serif font-medium max-w-2xl mx-auto">
          Build the team culture you actually want.
        </h2>
        <p className="text-white/60 max-w-xl mx-auto">
          Custom proposal within 24 hours · In-person or virtual · Tailored for your industry
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=Hi Nidhi, I'm interested in the EQ Leadership Workshop for my team.`} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="rounded-full bg-white text-[#1A1A1A] hover:bg-white/90 px-10 font-semibold">
              Request a proposal
            </Button>
          </a>
          <BookingDialog>
            <Button size="lg" variant="outline" className="rounded-full border-white/30 hover:bg-white/10 px-10 text-white">
              Book an intro call
            </Button>
          </BookingDialog>
        </div>
      </section>
    </div>
  );
}
