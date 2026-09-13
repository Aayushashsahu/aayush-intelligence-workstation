import type { FounderContent } from '@/lib/types'

/**
 * FOUNDER (singleton)
 * Company, focus, principles and product notes. `company.verified: false` means the
 * detail has not been confirmed — the workstation renders that honestly and CORTEX
 * is instructed to treat it as unknown rather than invent traction, users or revenue.
 */
export const founder: FounderContent = {
  company: {
    name: 'Octiq AI',
    role: 'Founder',
    status: 'ACTIVE',
    summary: 'The current founder and product effort inside this workstation.',
    building: [
      'Octiq AI is the active company/product Aayush is building, and the reason the founder dimension sits at the centre of this workstation.',
    ],
    exploring: [
      'Applied AI product surfaces.',
      'The reliability gap between an AI proposal and a verified outcome.',
    ],
    links: [],
    verified: false,
  },
  focus: [
    'Intelligent systems that stay honest about what they can prove.',
    'Reliability boundaries between AI proposals and verified outcomes.',
    'Product surfaces built directly on top of those systems.',
  ],
  exploring: [
    'Verification layers for AI-generated output.',
    'Local-first personal intelligence.',
    'Knowledge structures for complex operational domains.',
  ],
  principles: [
    { title: 'BUILD BEFORE PERFECT', text: 'A working prototype teaches you more than a plan that is still being discussed.' },
    { title: 'EVIDENCE > ASSUMPTION', text: 'A successful call is an observation. Proof is something you verify.' },
    { title: 'SYSTEMS > FEATURES', text: 'Features are local. Systems decide whether anything survives contact with reality.' },
    { title: 'SHIP → LEARN → ITERATE', text: 'Shipping is how you get information. Iterating is how you use it.' },
  ],
  productNotes: [],
  currentProjects: ['aegis', 'sentinelforge', 'edith', 'jarvis'],
  needsInput: [
    'What problem Octiq AI solves and for whom.',
    'What is actually built today vs. planned.',
    'Any real traction, users, revenue or milestones (only if true).',
    'Team, timeline and links.',
  ],
}
