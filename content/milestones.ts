import type { Milestone } from '@/lib/types'

/**
 * MILESTONES
 * ----------------------------------------------------------------------------
 * Deliberately empty. Dated milestones are only meaningful when they are true, so
 * this starts blank rather than guessing a history.
 *
 * Two sources feed the timeline UI:
 *   1. Manual milestones added here (or from the control room) — the only place
 *      real dates belong.
 *   2. GitHub-derived points (repository created / last push) for bound dossiers,
 *      generated automatically and clearly labelled as telemetry.
 *
 * Shape:
 * {
 *   id: 'aegis-first-release-gate',
 *   title: 'Release gate hardened',
 *   description: '...',
 *   date: '2025-04-02',        // only set a date you are sure about
 *   link: null,
 *   projectId: 'aegis',        // optional binding to a dossier
 *   kind: 'BUILD',
 * }
 */
export const milestones: Milestone[] = []

// Milestone kinds live in `lib/taxonomy`, which is safe for client components.
