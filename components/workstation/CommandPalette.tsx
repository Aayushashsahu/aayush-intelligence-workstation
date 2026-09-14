'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Command as CommandIcon,
  Search,
  BrainCircuit,
  FolderGit2,
  GitCommitHorizontal,
  ShieldCheck,
  Rocket,
  FlaskConical,
  Network,
  TerminalSquare,
  RefreshCw,
  UserCheck,
  ChevronRight,
  X,
  Mail,
  Linkedin,
} from 'lucide-react'
import { useWorkstation } from '@/components/workstation/store'
import { useContent } from '@/components/workstation/ContentProvider'
import type { ViewId } from '@/lib/types'
import { findProject } from '@/lib/content'

type PaletteItem = {
  id: string
  title: string
  category: 'NAVIGATION' | 'ACTIONS' | 'CASE FILES'
  subtitle?: string
  icon: any
  action: () => void
}

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenRecruiter,
}: {
  isOpen: boolean
  onClose: () => void
  onOpenRecruiter: () => void
}) {
  const { setView, openDossier, openTerminal, sync, askCortex } = useWorkstation()
  const bundle = useContent()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Global Ctrl+K / Cmd+K handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          // Parent triggers open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const items: PaletteItem[] = useMemo(() => {
    const navItems: PaletteItem[] = [
      {
        id: 'nav-command',
        title: 'COMMAND CENTER',
        category: 'NAVIGATION',
        subtitle: 'Workstation home & overview',
        icon: CommandIcon,
        action: () => {
          setView('COMMAND')
          onClose()
        },
      },
      {
        id: 'nav-cortex',
        title: 'CORTEX // INTELLIGENCE CORE',
        category: 'NAVIGATION',
        subtitle: 'Evidence-grounded reasoning & query',
        icon: BrainCircuit,
        action: () => {
          setView('CORTEX')
          onClose()
        },
      },
      {
        id: 'nav-map',
        title: 'SYSTEM MAP',
        category: 'NAVIGATION',
        subtitle: 'Interactive architecture & discipline topology',
        icon: Network,
        action: () => {
          setView('MAP')
          onClose()
        },
      },
      {
        id: 'nav-projects',
        title: 'PROJECT CASE FILES',
        category: 'NAVIGATION',
        subtitle: 'Engineering archives & verification gates',
        icon: FolderGit2,
        action: () => {
          setView('PROJECTS')
          onClose()
        },
      },
      {
        id: 'nav-github',
        title: 'GITHUB TELEMETRY',
        category: 'NAVIGATION',
        subtitle: 'Live commits & contribution calendar',
        icon: GitCommitHorizontal,
        action: () => {
          setView('GITHUB')
          onClose()
        },
      },
      {
        id: 'nav-lab',
        title: 'LAB // RESEARCH',
        category: 'NAVIGATION',
        subtitle: 'Research index & experiments',
        icon: FlaskConical,
        action: () => {
          setView('LAB')
          onClose()
        },
      },
      {
        id: 'nav-security',
        title: 'SECURITY CASES',
        category: 'NAVIGATION',
        subtitle: 'Defensive systems & forensic investigations',
        icon: ShieldCheck,
        action: () => {
          setView('SECURITY')
          onClose()
        },
      },
      {
        id: 'nav-founder',
        title: 'FOUNDER HQ',
        category: 'NAVIGATION',
        subtitle: 'Octiq AI & strategic operating layer',
        icon: Rocket,
        action: () => {
          setView('FOUNDER')
          onClose()
        },
      },
    ]

    const actionItems: PaletteItem[] = [
      {
        id: 'act-recruiter',
        title: 'ENTER RECRUITER MODE [60s READ]',
        category: 'ACTIONS',
        subtitle: 'Fast-path senior engineering evaluation',
        icon: UserCheck,
        action: () => {
          onClose()
          onOpenRecruiter()
        },
      },
      {
        id: 'act-cortex-fit',
        title: 'ASK CORTEX // EVALUATE ENGINEERING FIT',
        category: 'ACTIONS',
        subtitle: 'Run evidence-backed fit assessment',
        icon: BrainCircuit,
        action: () => {
          onClose()
          askCortex('Evaluate Aayush’s technical depth and fit for an AI Systems / Senior Engineering role based on verified evidence.')
        },
      },
      {
        id: 'act-sync',
        title: 'SYNC GITHUB TELEMETRY NOW',
        category: 'ACTIONS',
        subtitle: 'Refresh live commit streams',
        icon: RefreshCw,
        action: () => {
          onClose()
          void sync()
        },
      },
      {
        id: 'act-terminal',
        title: 'OPEN SYSTEM TERMINAL_01',
        category: 'ACTIONS',
        subtitle: 'Command line prompt interface',
        icon: TerminalSquare,
        action: () => {
          onClose()
          openTerminal()
        },
      },
      {
        id: 'act-email',
        title: 'SEND DIRECT EMAIL // aayushsahu0406@gmail.com',
        category: 'ACTIONS',
        subtitle: 'Open default mail client to aayushsahu0406@gmail.com',
        icon: Mail,
        action: () => {
          onClose()
          window.location.href = `mailto:${bundle.profile.email || 'aayushsahu0406@gmail.com'}`
        },
      },
      {
        id: 'act-linkedin',
        title: 'LINKEDIN // PROFILE (aayush-sahu-ai)',
        category: 'ACTIONS',
        subtitle: 'Open LinkedIn profile in new tab',
        icon: Linkedin,
        action: () => {
          onClose()
          window.open(bundle.profile.linkedin || 'https://www.linkedin.com/in/aayush-sahu-ai', '_blank')
        },
      },
    ]

    const projectItems: PaletteItem[] = (bundle.projects || []).map((p) => ({
      id: `proj-${p.id}`,
      title: `${p.title} // CASE FILE`,
      category: 'CASE FILES',
      subtitle: p.objective,
      icon: FolderGit2,
      action: () => {
        onClose()
        openDossier({ id: p.id, title: p.title, category: p.category })
      },
    }))

    return [...actionItems, ...navItems, ...projectItems]
  }, [bundle.projects, bundle.profile.email, bundle.profile.linkedin, onClose, onOpenRecruiter, openDossier, openTerminal, setView, sync, askCortex])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q),
    )
  }, [items, query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action()
      }
    }
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1050] flex items-start justify-center bg-[rgba(5,5,8,0.85)] p-4 pt-20 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="panel relative w-full max-w-2xl overflow-hidden border-[var(--amber-line)] bg-[var(--bg-deep)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--surface)] px-4 py-3.5">
          <Search size={16} className="text-[var(--amber)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, subsystem, or project case file…"
            aria-label="Command palette search"
            className="flex-1 bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--dim)]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[var(--dim)] hover:text-[var(--text)]"
            >
              <X size={14} />
            </button>
          )}
          <span className="mono border border-[var(--line)] px-1.5 py-0.5 text-[9px] text-[var(--dim)]">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--dim)]">
              No systems or commands matching &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon
              const isSelected = index === selectedIndex
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'border border-[var(--amber-line)] bg-[var(--amber-wash)] text-[var(--text)]'
                      : 'border border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      size={14}
                      className={isSelected ? 'text-[var(--amber)]' : 'text-[var(--dim)]'}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold leading-snug">{item.title}</div>
                      {item.subtitle && (
                        <div className="truncate text-[10px] text-[var(--dim)]">{item.subtitle}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-none">
                    <span className="mono text-[8px] tk text-[var(--dim)]">{item.category}</span>
                    <ChevronRight
                      size={12}
                      className={isSelected ? 'text-[var(--amber)]' : 'text-transparent'}
                    />
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div className="flex items-center justify-between border-t border-[var(--line)] bg-[var(--surface-2)] px-4 py-2 mono text-[8px] tk text-[var(--dim)]">
          <div className="flex items-center gap-3">
            <span>↑↓ NAVIGATE</span>
            <span>↵ EXECUTE</span>
            <span>ESC CLOSE</span>
          </div>
          <span>AAYUSH WORKSTATION OS</span>
        </div>
      </div>
    </div>
  )
}
