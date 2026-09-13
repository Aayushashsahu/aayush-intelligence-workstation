import {
  mediaKinds,
  milestoneKinds,
  projectCategories,
  projectStatuses,
  researchCategories,
  researchStatuses,
  securityStatuses,
  thoughtTopics,
  timelineModels,
} from '@/lib/taxonomy'
import type { ContentType } from '@/lib/types'

/**
 * Field schemas drive the generic control-room editor, so adding a field is a
 * one-line change and no new UI code.
 *
 * Array-of-object fields (links, media, principles, product notes) are edited as
 * pipe-delimited lines rather than a nested UI: simple, robust and diffable.
 */

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'list'
  | 'tags'
  | 'select'
  | 'date'
  | 'boolean'
  | 'number'
  | 'url'
  | 'pairs'

export type FieldDef = {
  /** Dotted path, so singletons can edit nested company.* fields. */
  key: string
  label: string
  kind: FieldKind
  options?: readonly string[]
  placeholder?: string
  help?: string
  /** Pipe-delimited field names for `pairs`, e.g. ['label','url']. */
  pairKeys?: string[]
  wide?: boolean
}

export type SchemaDef = {
  type: ContentType
  label: string
  singular: string
  listKey: 'projects' | 'research' | 'lab' | 'security' | 'thoughts' | 'milestones' | null
  fields: FieldDef[]
  titleKey: string
  subtitleKey: string
}

const publishedField: FieldDef = { key: 'published', label: 'Published', kind: 'boolean', help: 'Unpublished entries never reach the public site.' }

export const SCHEMAS: Record<string, SchemaDef> = {
  projects: {
    type: 'projects',
    label: 'PROJECTS',
    singular: 'PROJECT',
    listKey: 'projects',
    titleKey: 'title',
    subtitleKey: 'category',
    fields: [
      { key: 'title', label: 'Title', kind: 'text' },
      { key: 'repo', label: 'GitHub repository name', kind: 'text', help: 'Binds live telemetry. Exclude if there is no public repo.' },
      { key: 'category', label: 'Category', kind: 'select', options: projectCategories },
      { key: 'status', label: 'Status', kind: 'select', options: projectStatuses },
      { key: 'timeline', label: 'Timeline model', kind: 'select', options: timelineModels },
      { key: 'objective', label: 'Objective', kind: 'textarea', wide: true },
      { key: 'why', label: 'Why it exists', kind: 'textarea', wide: true },
      { key: 'evidence', label: 'Evidence', kind: 'list', wide: true, help: 'One point per line.' },
      { key: 'architecture', label: 'Architecture', kind: 'list', wide: true, help: 'One line per stage or decision.' },
      { key: 'techAreas', label: 'Technical areas', kind: 'list', help: 'One per line.' },
      { key: 'tags', label: 'Tags', kind: 'tags' },
      { key: 'link', label: 'Primary link', kind: 'url' },
      { key: 'links', label: 'Additional links', kind: 'pairs', pairKeys: ['label', 'url'], help: 'One per line: Label|https://…' },
      { key: 'media', label: 'Media', kind: 'pairs', pairKeys: ['url', 'alt', 'kind'], help: `One per line: https://…|description|${mediaKinds.join('|')}` },
      { key: 'relatedResearch', label: 'Related research ids', kind: 'list', help: 'One research id per line.' },
      { key: 'notes', label: 'Internal notes', kind: 'textarea', wide: true },
      { key: 'featured', label: 'Featured', kind: 'boolean' },
      publishedField,
    ],
  },

  research: {
    type: 'research',
    label: 'RESEARCH',
    singular: 'RESEARCH',
    listKey: 'research',
    titleKey: 'title',
    subtitleKey: 'category',
    fields: [
      { key: 'title', label: 'Title', kind: 'text' },
      { key: 'category', label: 'Category', kind: 'select', options: researchCategories },
      { key: 'status', label: 'Status', kind: 'select', options: researchStatuses },
      { key: 'date', label: 'Date', kind: 'date', help: 'Leave empty unless the date is genuinely known.' },
      { key: 'description', label: 'Description', kind: 'textarea', wide: true },
      { key: 'notes', label: 'Notes', kind: 'textarea', wide: true },
      { key: 'tags', label: 'Tags', kind: 'tags' },
      { key: 'link', label: 'External link', kind: 'url' },
      { key: 'paper', label: 'Paper / PDF', kind: 'url' },
      { key: 'relatedProjects', label: 'Related project ids', kind: 'list', help: 'One project id per line.' },
      publishedField,
    ],
  },

  lab: {
    type: 'lab',
    label: 'LAB',
    singular: 'LAB ENTRY',
    listKey: 'lab',
    titleKey: 'title',
    subtitleKey: 'category',
    fields: [
      { key: 'title', label: 'Title', kind: 'text' },
      { key: 'question', label: 'Question / hypothesis', kind: 'textarea', wide: true, help: 'What is actually being tested?' },
      { key: 'category', label: 'Category', kind: 'select', options: researchCategories },
      { key: 'status', label: 'Status', kind: 'select', options: researchStatuses },
      { key: 'description', label: 'Description', kind: 'textarea', wide: true },
      { key: 'state', label: 'Current state', kind: 'textarea', wide: true },
      { key: 'notes', label: 'Notes', kind: 'textarea', wide: true },
      { key: 'tags', label: 'Tags', kind: 'tags' },
      { key: 'link', label: 'External link', kind: 'url' },
      { key: 'relatedProjects', label: 'Related project ids', kind: 'list' },
      { key: 'relatedResearch', label: 'Related research ids', kind: 'list' },
      publishedField,
    ],
  },

  security: {
    type: 'security',
    label: 'SECURITY',
    singular: 'SECURITY CASE',
    listKey: 'security',
    titleKey: 'title',
    subtitleKey: 'category',
    fields: [
      { key: 'title', label: 'Case title', kind: 'text' },
      { key: 'category', label: 'Category', kind: 'text' },
      { key: 'status', label: 'Status', kind: 'select', options: securityStatuses },
      { key: 'projectId', label: 'Linked project id', kind: 'text', help: 'Optional: links the case to a dossier.' },
      { key: 'description', label: 'Description', kind: 'textarea', wide: true },
      { key: 'findings', label: 'Findings', kind: 'list', wide: true, help: 'One per line.' },
      { key: 'evidence', label: 'Evidence', kind: 'list', wide: true, help: 'One per line.' },
      { key: 'references', label: 'References', kind: 'pairs', pairKeys: ['label', 'url'], help: 'One per line: Label|https://…' },
      { key: 'tags', label: 'Tags', kind: 'tags' },
      publishedField,
    ],
  },

  thoughts: {
    type: 'thoughts',
    label: 'THOUGHTS',
    singular: 'NOTE',
    listKey: 'thoughts',
    titleKey: 'title',
    subtitleKey: 'topic',
    fields: [
      { key: 'title', label: 'Title', kind: 'text' },
      { key: 'topic', label: 'Topic', kind: 'select', options: thoughtTopics },
      { key: 'date', label: 'Date', kind: 'date' },
      { key: 'body', label: 'Body', kind: 'textarea', wide: true },
      { key: 'tags', label: 'Tags', kind: 'tags' },
      publishedField,
    ],
  },

  milestones: {
    type: 'milestones',
    label: 'MILESTONES',
    singular: 'MILESTONE',
    listKey: 'milestones',
    titleKey: 'title',
    subtitleKey: 'kind',
    fields: [
      { key: 'title', label: 'Title', kind: 'text' },
      { key: 'date', label: 'Date', kind: 'date', help: 'Only set a date that is genuinely known.' },
      { key: 'kind', label: 'Kind', kind: 'select', options: milestoneKinds },
      { key: 'projectId', label: 'Project id', kind: 'text', help: 'Binds the milestone to a dossier timeline.' },
      { key: 'description', label: 'Description', kind: 'textarea', wide: true },
      { key: 'link', label: 'Link', kind: 'url' },
      publishedField,
    ],
  },

  profile: {
    type: 'profile',
    label: 'PROFILE',
    singular: 'PROFILE',
    listKey: null,
    titleKey: 'name',
    subtitleKey: 'identity',
    fields: [
      { key: 'name', label: 'Name', kind: 'text' },
      { key: 'handle', label: 'GitHub handle', kind: 'text' },
      { key: 'identity', label: 'Display identity', kind: 'text' },
      { key: 'positioning', label: 'Primary positioning', kind: 'list', help: 'One per line, e.g. AI SYSTEMS.' },
      { key: 'secondary', label: 'Secondary dimensions', kind: 'list' },
      { key: 'statement', label: 'Statement', kind: 'textarea', wide: true },
      { key: 'summary', label: 'Summary', kind: 'textarea', wide: true },
      { key: 'disciplines', label: 'Disciplines', kind: 'list' },
      { key: 'domains', label: 'Open topics', kind: 'list' },
    ],
  },

  founder: {
    type: 'founder',
    label: 'FOUNDER',
    singular: 'FOUNDER',
    listKey: null,
    titleKey: 'company.name',
    subtitleKey: 'company.role',
    fields: [
      { key: 'company.name', label: 'Company name', kind: 'text' },
      { key: 'company.role', label: 'Role', kind: 'text' },
      { key: 'company.status', label: 'Status', kind: 'text' },
      { key: 'company.verified', label: 'Detail verified by owner', kind: 'boolean', help: 'Off means CORTEX treats company detail as unknown.' },
      { key: 'company.summary', label: 'Company summary', kind: 'textarea', wide: true },
      { key: 'company.building', label: 'What I am building', kind: 'list', wide: true },
      { key: 'company.exploring', label: 'What the company is exploring', kind: 'list', wide: true },
      { key: 'company.links', label: 'Company links', kind: 'list' },
      { key: 'focus', label: 'Current focus', kind: 'list', wide: true },
      { key: 'exploring', label: 'Personal exploring', kind: 'list', wide: true },
      { key: 'principles', label: 'Operating principles', kind: 'pairs', pairKeys: ['title', 'text'], wide: true, help: 'One per line: TITLE|Description' },
      { key: 'productNotes', label: 'Product notes', kind: 'pairs', pairKeys: ['title', 'body', 'date'], wide: true, help: 'One per line: Title|Body|2026-01-31' },
      { key: 'currentProjects', label: 'Representative project ids', kind: 'list' },
      { key: 'needsInput', label: 'Still to supply', kind: 'list', wide: true },
    ],
  },
}

export const ADMIN_DOMAINS = [
  'projects',
  'research',
  'lab',
  'security',
  'thoughts',
  'milestones',
  'profile',
  'founder',
] as const

export type AdminDomain = (typeof ADMIN_DOMAINS)[number]
