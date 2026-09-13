import type { Profile } from '@/lib/types'

/**
 * CURATED PROFILE (singleton)
 * Hand-managed, editable from the control room, and part of CORTEX's evidence base.
 * Never claim something that cannot be evidenced.
 */
export const profile: Profile = {
  name: 'Aayush Sahu',
  handle: 'Aayushashsahu',
  identity: 'AAYUSH',
  positioning: ['AI SYSTEMS', 'ANALYSIS', 'PRODUCT'],
  secondary: ['SECURITY', 'FORENSICS', 'SYSTEMS ENGINEERING'],
  statement: 'I build intelligent systems, investigate difficult problems, and turn ideas into products.',
  summary:
    'AI systems builder, analytical thinker and founder. I work on intelligence systems, reliability and evidence, and I build products around them. Cybersecurity and digital forensics are a technical specialty, not the whole identity.',
  disciplines: [
    'AI systems',
    'Analysis',
    'Technical research',
    'Product building',
    'Founder / operator',
    'Systems engineering',
    'Security & forensics',
  ],
  domains: [
    'AI AGENTS',
    'AI MEMORY',
    'INTELLIGENCE SYSTEMS',
    'HUMAN + AI INTERACTION',
    'AI RELIABILITY',
    'SECURITY OF AI SYSTEMS',
    'PRODUCT SYSTEMS',
    'ANALYSIS',
    'AUTOMATION',
  ],
}
