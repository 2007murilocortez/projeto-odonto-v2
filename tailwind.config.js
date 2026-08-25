/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      noite: 'var(--noite)',
      tecido: 'var(--tecido)',
      'tecido-alto': 'var(--tecido-alto)',
      line: 'var(--line)',
      ink: 'var(--ink)',
      'ink-muted': 'var(--ink-muted)',
      'ink-disabled': 'var(--ink-disabled)',
      oxigenio: 'var(--oxigenio)',
      'oxigenio-dim': 'var(--oxigenio-dim)',
      inflamacao: 'var(--inflamacao)',
      placa: 'var(--placa)',
    },
    fontFamily: {
      display: 'var(--font-display)',
      body: 'var(--font-body)',
      mono: 'var(--font-mono)',
    },
    fontSize: {
      'display-lg': [
        'var(--type-display-lg)',
        {
          lineHeight: 'var(--leading-display)',
          letterSpacing: 'var(--tracking-display)',
          fontWeight: 'var(--weight-display)',
        },
      ],
      display: ['var(--type-display)', { lineHeight: 'var(--leading-display)' }],
      equation: [
        'var(--type-equation)',
        { letterSpacing: 'var(--tracking-equation)' },
      ],
      card: ['var(--type-card)', { lineHeight: 'var(--leading-card)' }],
      body: 'var(--type-body)',
      caption: [
        'var(--type-caption)',
        { letterSpacing: 'var(--tracking-caption)' },
      ],
    },
    extend: {
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        7: 'var(--space-7)',
        8: 'var(--space-8)',
        9: 'var(--space-9)',
        10: 'var(--space-10)',
        11: 'var(--space-11)',
        12: 'var(--space-12)',
      },
      borderRadius: {
        md: 'var(--radius-md)',
      },
      boxShadow: {
        lift: 'var(--shadow-lift)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
        spring: 'var(--ease-spring)',
      },
      maxWidth: {
        content: 'var(--content-max)',
      },
    },
  },
  plugins: [],
};
