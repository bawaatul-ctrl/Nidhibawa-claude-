// ─────────────────────────────────────────────────────────────
// NOTION CONTENT SERVICE
// Fetches session content from Notion database
// Content is read-only from the frontend — Nidhi edits in Notion
// ─────────────────────────────────────────────────────────────

import type { NotionSessionContent } from '../types/platform';

// Notion API requires a backend proxy to avoid exposing the token.
// In production, this hits your own Vercel Edge Function /api/notion
// In development, set VITE_NOTION_PROXY_URL=http://localhost:3001
const NOTION_PROXY = import.meta.env.VITE_NOTION_PROXY_URL ?? '/api/notion';

// ─── In-memory cache (per session, per page load) ──────────

const contentCache = new Map<string, NotionSessionContent>();

// ─── Fetch a single session's content by Notion page ID ───

export async function fetchSessionContent(
  notionPageId: string,
  sessionNumber: number,
  programId: string
): Promise<NotionSessionContent | null> {
  const cacheKey = `${programId}-${sessionNumber}`;
  if (contentCache.has(cacheKey)) return contentCache.get(cacheKey)!;

  try {
    const res = await fetch(`${NOTION_PROXY}/page/${notionPageId}`);
    if (!res.ok) throw new Error(`Notion proxy error: ${res.status}`);
    const raw = await res.json();
    const content = parseNotionPage(raw, notionPageId, sessionNumber, programId);
    contentCache.set(cacheKey, content);
    return content;
  } catch (err) {
    console.error('Failed to fetch Notion content:', err);
    return null;
  }
}

// ─── Parse Notion page blocks into structured content ─────
// 
// Expected Notion page structure (set up by Nidhi):
//  - H1: Session Title
//  - H2: "Icebreaker" → paragraph content
//  - H2: "Coaching Approach" → paragraph content
//  - H2: "Dialogue Script" → bulleted list (Coach: ... / Participant: ...)
//  - H2: "Reflection Questions" → bulleted list
//  - H2: "Activities" → bulleted list
//  - H2: "Exercises" → toggle blocks (title = exercise name, body = description)
//  - H2: "Application" → paragraph content

function parseNotionPage(
  raw: NotionAPIPage,
  notionPageId: string,
  sessionNumber: number,
  programId: string
): NotionSessionContent {
  const blocks: NotionBlock[] = raw.results ?? [];

  let currentSection = '';
  const sections: Record<string, string[]> = {
    icebreaker: [],
    coachingApproach: [],
    dialogueScript: [],
    reflectionQuestions: [],
    activities: [],
    exercises: [],
    application: [],
  };

  for (const block of blocks) {
    const text = extractBlockText(block);
    if (!text) continue;

    if (block.type === 'heading_2') {
      currentSection = normalizeSectionName(text);
      continue;
    }

    if (currentSection) {
      sections[currentSection]?.push(text);
    }
  }

  // Parse dialogue: "Coach: ..." / "Participant: ..."
  const dialogueScript = sections.dialogueScript
    .map(line => {
      const coachMatch = line.match(/^Coach:\s*(.+)/i);
      const partMatch = line.match(/^Participant:\s*(.+)/i);
      if (coachMatch) return { coach: coachMatch[1], participant: '' };
      if (partMatch) return { coach: '', participant: partMatch[1] };
      return null;
    })
    .filter(Boolean)
    .reduce((acc: { coach: string; participant: string }[], item, idx, arr) => {
      if (item?.coach) acc.push({ coach: item.coach, participant: arr[idx + 1]?.participant ?? '' });
      return acc;
    }, []);

  // Parse exercises: "Title | Description | type:text"
  const exercises = sections.exercises.map((line, idx) => {
    const parts = line.split('|').map(p => p.trim());
    return {
      id: `ex-${idx}`,
      title: parts[0] ?? line,
      description: parts[1] ?? '',
      inputType: (parts[2]?.replace('type:', '') as 'text' | 'list' | 'scale') ?? 'text',
    };
  });

  return {
    notionPageId,
    sessionNumber,
    programId,
    icebreaker: sections.icebreaker.join(' '),
    coachingApproach: sections.coachingApproach.join(' '),
    dialogueScript,
    reflectionQuestions: sections.reflectionQuestions,
    activities: sections.activities,
    exercises,
    application: sections.application.join(' '),
    lastSynced: new Date(),
  };
}

// ─── Helpers ─────────────────────────────────────────────

function extractBlockText(block: NotionBlock): string {
  const richText = block[block.type]?.rich_text ?? [];
  return richText.map((t: { plain_text: string }) => t.plain_text).join('');
}

function normalizeSectionName(text: string): string {
  const map: Record<string, string> = {
    'icebreaker': 'icebreaker',
    'coaching approach': 'coachingApproach',
    'dialogue script': 'dialogueScript',
    'reflection questions': 'reflectionQuestions',
    'activities': 'activities',
    'exercises': 'exercises',
    'application': 'application',
  };
  return map[text.toLowerCase().trim()] ?? '';
}

// ─── Types (minimal, enough to parse) ───────────────────

interface NotionAPIPage {
  results: NotionBlock[];
}

interface NotionBlock {
  type: string;
  [key: string]: unknown;
}

// ─── Fallback content (used when Notion is unreachable) ──
// This is the existing content.ts data — always available

export async function getFallbackSessionContent(
  programId: string,
  sessionNumber: number
): Promise<NotionSessionContent | null> {
  try {
    // Dynamic import to avoid bundling all 15 modules unless needed
    const { coachingContent } = await import('../data/content');
    const segmentMap: Record<string, string> = {
      'kids-program': 'Kids / Students',
      'parents-program': 'Parents',
      'corporate-program': 'Corporate Professionals',
    };
    const segment = segmentMap[programId];
    const modules = coachingContent.filter(m => m.segment === segment);
    const module = modules[sessionNumber - 1];
    if (!module) return null;

    return {
      notionPageId: 'fallback',
      sessionNumber,
      programId,
      icebreaker: module.sessionFlow.icebreaker,
      coachingApproach: module.coachingApproach,
      dialogueScript: module.sessionFlow.dialogue.map(d => ({
        coach: d.coach,
        participant: d.participant,
      })),
      reflectionQuestions: module.sessionFlow.reflectionQuestions,
      activities: module.sessionFlow.activities,
      exercises: module.exercises.map((e, i) => ({
        id: `ex-${i}`,
        title: e.title,
        description: e.description,
        inputType: 'text' as const,
      })),
      application: module.sessionFlow.application,
      lastSynced: new Date(),
    };
  } catch {
    return null;
  }
}
