import type { ContentBundle } from '@/lib/types'
import { profile } from './profile'
import { founder } from './founder'
import { projects } from './projects'
import { research } from './research'
import { lab } from './lab'
import { security } from './security'
import { thoughts } from './thoughts'
import { milestones } from './milestones'

/**
 * The committed seed bundle.
 *
 * Two jobs:
 *   1. First-run seed for the datastore (so the control room starts populated).
 *   2. Safe fallback for the public site when no datastore is configured, so the
 *      workstation always renders.
 *
 * SERVER ONLY — never import this from a client component, or every seed entry
 * ends up in the browser bundle. Client code should use `lib/content` (selectors)
 * and `lib/taxonomy` (labels) instead.
 */
export const seedBundle: ContentBundle = {
  profile,
  founder,
  projects,
  research,
  lab,
  security,
  thoughts,
  milestones,
}
