/** @type {import('tailwindcss').Config} */

const config = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  safelist: [
    {
      // Some components use str template to determine colour, not rendered if 'jit'
      pattern: /(bg|text|stroke)-volt-(alert|text-regular)/,
    },
  ],
  prefix: '',
  theme: {
    fontSize: {
      button: ['22px', '29px'],
    },
    extend: {
      fontFamily: {
        bromny: ['BROmny-Regular', 'sans-serif'],
        'bromny-black': ['BROmny-Black', 'sans-serif'],
        'bromny-bold': ['BROmny-Bold', 'sans-serif'],
        'bromny-light': ['BROmny-Light', 'sans-serif'],
        'bromny-medium': ['BROmny-Medium', 'sans-serif'],
        'bromny-semibold': ['BROmny-SemiBold', 'sans-serif'],
        'bromny-thin': ['BROmny-Thin', 'sans-serif'],
      },

      colors: {
        volt: {
          text: {
            main: '#433FFE',
            'regular-light-mode': '#333333',
            'regular-dark-mode': '#F6F6F6',
            'input-light-mode': '#666666',
            'input-dark-mode': '#5D5D5D',
            'tag-dark-mode': '#A2A2A2',
            brief: '#A7A7A7',
            selection: '#757575',
          },
          border: {
            'special-start': '#3D39FF',
            'special-end': '#36DBFF',
            start: '#444CFF',
            end: '#9F24FF',
          },
          background: {
            'light-mode': '#F4F4F4',
            'dark-mode': '#1E1E1E',
          },
          component: {
            'dark-mode': '#272727',
            'select-start': '#5259FF', // should combine with end attr to make linear effect
            'select-end': '#8941FF',
          },
          input: {
            'dark-mode': '#232323',
          },
          grey: {
            inactive: '#111111',
            select: '#E4E4E4',
          },
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
      },
      borderWidth: {
        2: 'calc(var(--borderWidth) + 1px)',
        1.5: 'calc(var(--borderWidth) + 0.5px)',
        1: 'var(--borderWidth)',
      },
      borderRadius: {
        default: 'var(--radius)',
        input: '12px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
};

export default config;
