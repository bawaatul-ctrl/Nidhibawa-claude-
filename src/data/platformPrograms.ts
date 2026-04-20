// ─────────────────────────────────────────────────────────────
// platformPrograms.ts
// Program definitions with safe PUBLIC session previews
// Used by: program pages, EnrollButton, SessionPreview component
// Full session content lives in Notion / content.ts (private)
// ─────────────────────────────────────────────────────────────

import type { Program } from '../types/platform';

export const PLATFORM_PROGRAMS: Program[] = [

  // ──────────────────────────────────────────────────────────
  // KIDS & STUDENTS
  // ──────────────────────────────────────────────────────────
  {
    id: 'kids-program',
    slug: 'inner-shield',
    segment: 'kids',
    name: 'The Inner Shield Program',
    tagline: 'Build confidence, resilience, and emotional strength in your child.',
    description:
      'A structured 5-session coaching program for children aged 8–16. We work through the five biggest challenges young people face today — exam anxiety, screen dependency, bullying, social confidence, and focus — using play-based, evidence-backed techniques.',
    forWhom: [
      'Children aged 8–16 who struggle with confidence or anxiety',
      'Parents who have tried "talking to them" but need a structured approach',
      'Kids showing signs of exam stress, peer pressure, or withdrawal',
    ],
    painPoints: [
      'Your child freezes during exams despite knowing the material',
      'They spend hours on screens but seem lonely and disconnected',
      'Bullying or peer pressure is affecting their personality',
      'They avoid social situations or speaking up in class',
    ],
    outcomes: [
      'A clear set of coping tools your child can use independently',
      'Stronger self-identity and resistance to peer pressure',
      'Better focus habits and a healthier relationship with screens',
      'A child who can name and manage their emotions',
    ],
    sessionCount: 5,
    durationWeeks: 6,
    priceINR: 18000,
    priceUSD: 220,
    isActive: true,
    sessions: [
      {
        sessionNumber: 1,
        title: 'Taming the Exam Monster',
        durationMinutes: 50,
        objectiveSummary:
          'We identify how your child experiences stress physically and mentally, and introduce their first practical tool for calming the nervous system before and during exams.',
        activitiesPreview: [
          'An icebreaker activity to understand how stress shows up for your child',
          'A grounding technique practice (takes 2 minutes, works anywhere)',
          'A short reflection exercise to separate identity from performance',
          'One homework technique to use before the next test',
        ],
        outcomeStatement:
          'Your child will have a concrete, practised coping tool for exam anxiety and a healthier way to talk about academic pressure at home.',
      },
      {
        sessionNumber: 2,
        title: 'Beyond the Screen',
        durationMinutes: 50,
        objectiveSummary:
          'We explore your child\'s relationship with technology — not to take it away, but to help them understand what it gives them and what it costs them.',
        activitiesPreview: [
          'An "App Audit" to identify energy-draining versus energising screen time',
          'A visual exercise comparing online identity to real-life identity',
          'A challenge to replace 30 minutes of scrolling with something fulfilling',
          'Co-creating a personal "Digital Budget" they actually agree to',
        ],
        outcomeStatement:
          'Your child will leave with a self-made digital agreement and one offline activity they\'re genuinely excited to try.',
      },
      {
        sessionNumber: 3,
        title: 'Building the Inner Shield',
        durationMinutes: 50,
        objectiveSummary:
          'We build your child\'s core identity — the values and strengths that no bully or social situation can take away — and give them a practised verbal response to difficult interactions.',
        activitiesPreview: [
          'The "Shield of Values" drawing exercise to anchor self-worth',
          'Role-play scenarios practising assertive (not aggressive) responses',
          'Identifying one trusted adult at school as a safety resource',
          'A weekly "mirror talk" practice to build confident body language',
        ],
        outcomeStatement:
          'Your child will have a "power response" they have practised out loud, and a clear sense of the values that define them — not what others say about them.',
      },
      {
        sessionNumber: 4,
        title: 'Social Confidence and Making Real Connections',
        durationMinutes: 50,
        objectiveSummary:
          'We shift from managing social anxiety to building the skills for genuine, confident connection with peers.',
        activitiesPreview: [
          'A conversation starters exercise to reduce social freeze',
          'The "Circle of Relationships" to identify healthy vs. draining friendships',
          'A role-play of a common awkward social situation',
          'One social goal to try before the next session',
        ],
        outcomeStatement:
          'Your child will feel less alone in social situations and have two or three practical tools to initiate and sustain conversations with peers.',
      },
      {
        sessionNumber: 5,
        title: 'Focus, Goals, and the Road Ahead',
        durationMinutes: 60,
        objectiveSummary:
          'We consolidate everything from the program, build a simple personal goal-setting system, and make sure your child has a toolkit they can use independently.',
        activitiesPreview: [
          'A "My Strengths" review of everything covered in the program',
          'Building a personalised "Focus Ritual" for study and homework',
          'Setting one meaningful 3-month personal goal',
          'A parent-child session moment to celebrate progress together',
        ],
        outcomeStatement:
          'Your child will leave with a written personal toolkit, a clear goal, and the confidence that they have everything they need to handle what comes next.',
      },
    ],
    testimonials: [
      {
        quote:
          'After just three sessions, my son started asking to do his homework before dinner. I didn\'t even ask him. Something shifted.',
        author: 'Priya S.',
        role: 'Parent of a 10-year-old, Delhi',
      },
      {
        quote:
          'My daughter used to cry every Sunday night before school. After the Inner Shield program she told me "Mum, I know what to do now." That was everything.',
        author: 'Meena R.',
        role: 'Parent of a 13-year-old, Bangalore',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // CONSCIOUS PARENTING
  // ──────────────────────────────────────────────────────────
  {
    id: 'parents-program',
    slug: 'conscious-parent-sprint',
    segment: 'parents',
    name: 'Conscious Parent Sprint',
    tagline: 'Respond instead of react. Connect instead of correct.',
    description:
      'A focused 4-session program for parents who want a calmer, more connected relationship with their child. We work on communication, boundaries, emotional triggers, and building resilience — in you and in your child.',
    forWhom: [
      'Parents who find themselves shouting and then feeling guilty',
      'Parents whose child "doesn\'t listen" or is constantly testing boundaries',
      'Parents navigating a difficult phase — new school, divorce, teen years',
      'Parents who want to parent differently to how they were parented',
    ],
    painPoints: [
      'You feel like you\'ve tried everything and nothing works',
      'You and your child are stuck in the same argument on repeat',
      'Your child shuts down or has meltdowns you can\'t manage',
      'You feel more like a manager than a parent',
    ],
    outcomes: [
      'A calmer home environment with fewer power struggles',
      'A communication style your child actually responds to',
      'The ability to set boundaries without disconnecting',
      'Practical tools to use in the next difficult moment',
    ],
    sessionCount: 4,
    durationWeeks: 5,
    priceINR: 12000,
    priceUSD: 150,
    isActive: true,
    sessions: [
      {
        sessionNumber: 1,
        title: 'Understanding what\'s actually happening',
        durationMinutes: 60,
        objectiveSummary:
          'Before changing anything, we map the current patterns — what triggers you, what triggers your child, and what the cycle looks like from both sides.',
        activitiesPreview: [
          'A "trigger mapping" exercise to identify your reactive moments',
          'Understanding child development stages and why your child behaves this way',
          'Identifying the three most common conflict patterns in your household',
          'One small change to try before the next session',
        ],
        outcomeStatement:
          'You\'ll leave with clarity on what\'s actually driving the conflict — and the relief of knowing it\'s not about you failing as a parent.',
      },
      {
        sessionNumber: 2,
        title: 'Speaking so they actually hear you',
        durationMinutes: 60,
        objectiveSummary:
          'Most parent-child communication breaks down at the emotional level, not the logical one. This session rewires how you start difficult conversations.',
        activitiesPreview: [
          'The "Empathy First" framework for difficult conversations',
          'Role-play of a recent conflict using a new communication structure',
          'Learning two phrases that de-escalate instead of inflame',
          'A listening exercise to use at home this week',
        ],
        outcomeStatement:
          'You\'ll have a tested communication framework that gets your child to feel heard — which is the only reliable way to then get them to listen.',
      },
      {
        sessionNumber: 3,
        title: 'Boundaries with warmth',
        durationMinutes: 60,
        objectiveSummary:
          'We work on how to say no — and hold it — without the guilt, the negotiation spiral, or the emotional shutdown that usually follows.',
        activitiesPreview: [
          'Distinguishing between rules and values — and why that changes everything',
          'Practising boundary-setting language that is warm and firm simultaneously',
          'The "broken record" technique for persistent boundary-pushers',
          'Designing one family agreement you and your child create together',
        ],
        outcomeStatement:
          'You\'ll know how to hold a boundary without a fight, and your child will feel safe rather than controlled.',
      },
      {
        sessionNumber: 4,
        title: 'Your emotional regulation — the most important tool',
        durationMinutes: 60,
        objectiveSummary:
          'Children co-regulate with their parents. This session focuses entirely on you — building the internal tools that let you respond instead of react.',
        activitiesPreview: [
          'Identifying your three core emotional triggers as a parent',
          'A 90-second physiological reset technique for reactive moments',
          'Building a "repair ritual" for after things go wrong',
          'A personal toolkit you\'ll actually use — not a long list of rules',
        ],
        outcomeStatement:
          'You\'ll leave with a personal emotional regulation plan and the confidence that even when things go wrong, you know how to repair it.',
      },
    ],
    testimonials: [
      {
        quote:
          'I used to think my daughter was the problem. Nidhi helped me see that I was the one who needed to change first. Best investment I\'ve ever made.',
        author: 'Rakesh M.',
        role: 'Father of a 9-year-old, Mumbai',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // CORPORATE LEADERSHIP
  // ──────────────────────────────────────────────────────────
  {
    id: 'corporate-program',
    slug: 'eq-leadership-workshop',
    segment: 'corporate',
    name: 'EQ Leadership Workshop',
    tagline: 'Build teams that trust each other, communicate clearly, and actually perform.',
    description:
      'A structured workshop series for teams of 10–25. Delivered across one intensive day or eight bi-weekly sessions, it covers the five EQ pillars that research consistently links to high-performing teams: self-awareness, empathy, conflict navigation, communication, and psychological safety.',
    forWhom: [
      'Mid-size teams going through change, growth, or tension',
      'Leaders who have technically capable teams that struggle to collaborate',
      'HR managers building a well-being or leadership development programme',
      'Organisations with high turnover or low engagement scores',
    ],
    painPoints: [
      'Your team avoids difficult conversations until they become crises',
      'High performers are burning out or leaving',
      'Feedback culture is either non-existent or feared',
      'Remote or hybrid work has eroded team trust and connection',
    ],
    outcomes: [
      'A team that can disagree without damaging relationships',
      'Leaders who know how to give feedback that lands',
      'Measurably improved psychological safety scores',
      'A shared language for emotional intelligence across the team',
    ],
    sessionCount: 8,
    durationWeeks: 10,
    priceINR: 85000,
    priceUSD: 1050,
    isActive: true,
    sessions: [
      {
        sessionNumber: 1,
        title: 'The EQ baseline — where are we now?',
        durationMinutes: 90,
        objectiveSummary:
          'We establish a shared understanding of emotional intelligence, run a team EQ diagnostic, and identify the three patterns most affecting this specific team.',
        activitiesPreview: [
          'An anonymous team EQ diagnostic to establish the baseline',
          'Group discussion on what "psychological safety" looks like here',
          'Identifying two team communication patterns to work on',
          'Each participant sets one personal EQ goal for the programme',
        ],
        outcomeStatement:
          'The team will have a shared EQ vocabulary and a clear, honest picture of where they\'re starting from — without blame.',
      },
      {
        sessionNumber: 2,
        title: 'Self-awareness under pressure',
        durationMinutes: 90,
        objectiveSummary:
          'Most leadership failures happen in high-pressure moments. This session builds the awareness to catch yourself before you react — and the tools to recover when you don\'t.',
        activitiesPreview: [
          'A personal "trigger audit" for each participant',
          'The STOP technique for reactive moments in meetings',
          'Pair exercise: mapping each other\'s stress signals',
          'Commitment to one behaviour change for the following week',
        ],
        outcomeStatement:
          'Participants will know their top three emotional triggers at work and have one tested technique to use in the next difficult moment.',
      },
      {
        sessionNumber: 3,
        title: 'Empathetic leadership in practice',
        durationMinutes: 90,
        objectiveSummary:
          'Empathy is not about being soft — it\'s about being accurate. This session builds the ability to read what a team member actually needs versus what they\'re saying.',
        activitiesPreview: [
          'The "Four Hats" listening framework for leaders',
          'Case studies of high-EQ vs low-EQ leadership responses',
          'Role-play: delivering difficult news with empathy',
          'Team exercise: "What does good look like for me?" sharing',
        ],
        outcomeStatement:
          'Leaders will have a practical empathy framework they can use in their next 1:1 or team meeting.',
      },
      {
        sessionNumber: 4,
        title: 'Conflict as information',
        durationMinutes: 90,
        objectiveSummary:
          'Conflict avoided becomes resentment. This session reframes conflict as useful data and builds the skills to navigate it productively.',
        activitiesPreview: [
          'Mapping the team\'s current conflict avoidance patterns',
          'The "Interest-based" conversation framework (not position-based)',
          'Live conflict simulation with structured debrief',
          'Designing a team conflict protocol for recurring disagreements',
        ],
        outcomeStatement:
          'The team will have a shared conflict protocol and each person will have practised one difficult conversation they\'ve been avoiding.',
      },
      {
        sessionNumber: 5,
        title: 'Feedback that actually works',
        durationMinutes: 90,
        objectiveSummary:
          'Most feedback either doesn\'t land or causes defensiveness. This session builds a feedback culture that is honest, specific, and received well.',
        activitiesPreview: [
          'The SBI (Situation-Behaviour-Impact) feedback model in practice',
          'Paired live feedback sessions with real recent examples',
          'Building a team feedback rhythm — when, how, and how often',
          'The "Appreciation gap" exercise to rebalance recognition',
        ],
        outcomeStatement:
          'Every participant will have given and received one piece of real feedback during the session — and the team will have a simple feedback cadence to use going forward.',
      },
      {
        sessionNumber: 6,
        title: 'Communication across styles',
        durationMinutes: 90,
        objectiveSummary:
          'Misaligned communication styles — not bad intentions — cause most team friction. This session maps the team\'s styles and builds fluency in all of them.',
        activitiesPreview: [
          'A team communication style diagnostic',
          'Direct vs. indirect communication across cultures and personalities',
          'Translating between different working styles in real-time',
          'A team communication agreement for key recurring scenarios',
        ],
        outcomeStatement:
          'The team will have a written communication agreement covering their top five recurring friction points.',
      },
      {
        sessionNumber: 7,
        title: 'Psychological safety — building it deliberately',
        durationMinutes: 90,
        objectiveSummary:
          'Google\'s Project Aristotle found psychological safety is the single biggest predictor of team performance. This session builds the specific behaviours that create it.',
        activitiesPreview: [
          'The four stages of psychological safety and where this team is',
          'Leader behaviours that create safety — and the ones that destroy it',
          'Team exercise: redesigning one regular meeting for higher safety',
          'Personal commitment cards for each team member',
        ],
        outcomeStatement:
          'The team will have specific, named behaviours they\'ve committed to — not a vague pledge to "be more open".',
      },
      {
        sessionNumber: 8,
        title: 'Integration and the path forward',
        durationMinutes: 90,
        objectiveSummary:
          'We consolidate the work, measure progress against the baseline, and build a 90-day plan that keeps the growth going after the programme ends.',
        activitiesPreview: [
          'A repeat of the session 1 EQ diagnostic to measure progress',
          'Team retrospective: what changed, what didn\'t, what we\'re still working on',
          'Building a 90-day team EQ practice plan',
          'Individual commitments shared publicly with the team',
        ],
        outcomeStatement:
          'The team will leave with measurable evidence of their progress, a concrete 90-day plan, and a shared commitment to continue.',
      },
    ],
    testimonials: [
      {
        quote:
          'We\'d tried team building events before. They\'re fun for a day and then forgotten. This was different — six months later we still reference the frameworks from Nidhi\'s sessions.',
        author: 'Anita V.',
        role: 'Head of HR, SaaS company, Hyderabad',
      },
    ],
  },
];

// Helper to get program by segment
export function getProgramBySegment(segment: 'kids' | 'parents' | 'corporate'): Program | undefined {
  return PLATFORM_PROGRAMS.find(p => p.segment === segment);
}

// Helper to get program by slug
export function getProgramBySlug(slug: string): Program | undefined {
  return PLATFORM_PROGRAMS.find(p => p.slug === slug);
}

// Helper to get program by id
export function getProgramById(id: string): Program | undefined {
  return PLATFORM_PROGRAMS.find(p => p.id === id);
}
