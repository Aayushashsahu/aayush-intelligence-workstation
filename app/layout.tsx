import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'AAYUSH // INTELLIGENCE WORKSTATION',
  description:
    'An AI intelligence workstation and portfolio: AI systems, analysis, product and founder work, with live GitHub engineering telemetry.',
  applicationName: 'AAYUSH // INTELLIGENCE WORKSTATION',
  keywords: ['AI systems', 'analysis', 'product', 'founder', 'security', 'forensics', 'portfolio'],
  openGraph: {
    title: 'AAYUSH // INTELLIGENCE WORKSTATION',
    description: 'AI SYSTEMS · ANALYSIS · PRODUCT — a living workstation, not a portfolio page.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
