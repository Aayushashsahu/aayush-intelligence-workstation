import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--bg)',
        surface: 'var(--surface)',
        line: 'var(--line)',
        amber: 'var(--amber)',
      },
      gridTemplateColumns: {
        26: 'repeat(26, minmax(0, 1fr))',
        53: 'repeat(53, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
} satisfies Config
