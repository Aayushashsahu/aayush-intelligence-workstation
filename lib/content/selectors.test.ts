import { describe, it, expect, vi } from 'vitest'
import {
  byOrder,
  isPublished,
  findProject,
  featuredProjects,
  inferCategory,
  relatedResearch,
  findProjectByRepo,
  relatedLab,
  projectMilestones,
  thoughtsForTopic,
  counts,
  toDossier,
  repoMilestones,
  timelineFor,
  archiveDossiers,
  languageShare
} from './selectors'

describe('Content selectors', () => {
  const items = [
    { id: '1', type: 'projects', order: 2, published: true, featured: false, repo: 'repo1', title: 'proj1', category: 'web' },
    { id: '2', type: 'projects', order: 1, published: true, featured: true, repo: 'repo2', title: 'proj2', category: 'ai' },
    { id: '3', type: 'projects', order: 3, published: false, featured: true, repo: 'repo3', title: 'proj3', category: 'sec' },
  ] as any[]

  const bundle = {
    projects: items,
    research: [{ relatedProjects: ['2'] }],
    lab: [{ relatedProjects: ['1'] }],
    milestones: [{ projectId: '1', date: '2023-01-01' }],
    thoughts: [{ topic: 'AI' }],
    security: [],
  } as any

  it('byOrder sorts items by order property', () => {
    const sorted = byOrder(items)
    expect(sorted.map(i => i.id)).toEqual(['2', '1', '3'])
  })

  it('isPublished correctly identifies published items', () => {
    expect(isPublished(items[0])).toBe(true)
    expect(isPublished(items[2])).toBe(false)
  })

  it('finds project by various means', () => {
    expect(findProject(bundle, '1')).toBeDefined()
    expect(findProject(bundle, 'repo2')).toBeDefined()
    expect(findProject(bundle, 'proj3')).toBeDefined()
    expect(findProjectByRepo(bundle, 'repo2')).toBeDefined()
    expect(findProject(bundle, 'nonexistent')).toBeUndefined()
  })

  it('finds related items', () => {
    expect(relatedResearch(bundle, '2').length).toBe(1)
    expect(relatedLab(bundle, '1').length).toBe(1)
    expect(projectMilestones(bundle, '1').length).toBe(1)
    expect(thoughtsForTopic(bundle, 'AI').length).toBe(1)
  })

  it('counts correctly', () => {
    const c = counts(bundle)
    expect(c.projects).toBe(3)
    expect(c.curatedRepos).toBe(3)
  })

  it('featuredProjects returns featured or slices', () => {
    expect(featuredProjects(bundle).length).toBe(2) // 2 and 3 are featured
    const noFeaturedBundle = { ...bundle, projects: [items[0]] }
    expect(featuredProjects(noFeaturedBundle).length).toBe(1) // fallbacks to slice
  })

  it('inferCategory infers from repo fields', () => {
    expect(inferCategory({ name: 'malware', description: '' } as any)).toBe('SECURITY')
    expect(inferCategory({ name: 'ai-agent', description: '' } as any)).toBe('AI / SYSTEMS')
    expect(inferCategory({ name: 'data-pipeline', description: '' } as any)).toBe('DATA / BACKEND')
    expect(inferCategory({ name: 'react-ui', description: '' } as any)).toBe('WEB / PRODUCT')
    expect(inferCategory({ name: 'something', description: '' } as any)).toBe('EXPERIMENTS')
  })

  it('toDossier uses existing curated project or synthesises one', () => {
    const p1 = toDossier(bundle, { name: 'repo2' } as any)
    expect(p1.id).toBe('2')

    const p2 = toDossier(bundle, { name: 'new-repo', description: 'test', html_url: 'link' } as any)
    expect(p2.id).toBe('auto-new-repo')
    expect(p2.category).toBe('EXPERIMENTS')
  })

  it('repoMilestones generates milestones from repo dates', () => {
    const milestones = repoMilestones({ created_at: '2023-01-01', pushed_at: '2023-02-01' } as any, 'proj1')
    expect(milestones.length).toBe(2)
    expect(repoMilestones(undefined, 'proj1').length).toBe(0)
  })

  it('timelineFor sorts milestones chronologically', () => {
    const milestones = timelineFor(bundle, items[0], { created_at: '2022-01-01', pushed_at: '2024-01-01' } as any)
    expect(milestones.length).toBe(3)
    expect(milestones[0].date).toBe('2022-01-01')
    expect(milestones[1].date).toBe('2023-01-01') // manual
    expect(milestones[2].date).toBe('2024-01-01')
  })

  it('archiveDossiers includes curated and auto-discovered repos', () => {
    const dossiers = archiveDossiers(bundle, [{ name: 'repo1' }, { name: 'new-repo' }] as any)
    expect(dossiers.length).toBe(4) // 3 curated + 1 new
  })

  it('languageShare computes proportions correctly', () => {
    const share = languageShare([{ language: 'TypeScript' }, { language: 'TypeScript' }, { language: 'Python' }] as any)
    expect(share.length).toBe(2)
    expect(share[0].name).toBe('TypeScript')
    expect(share[0].count).toBe(2)
    expect(share[0].share).toBeCloseTo(0.666)
    expect(share[1].name).toBe('Python')
    expect(share[1].count).toBe(1)
  })
})
