import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        maroon: {
          50: '#fef2f4',
          100: '#fce4e8',
          200: '#f9cbd4',
          500: '#8b2238',
          600: '#6b1d2f',
          700: '#521220',
          800: '#3a0c16',
        },
        navy: {
          50: '#f4f6fa',
          100: '#e8ecf4',
          200: '#d1dbe9',
          500: '#324a70',
          600: '#233754',
          700: '#1b2a41',
          800: '#0f172a',
          900: '#0a0f1d',
        }
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'marquee-left': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-right': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
        'marquee-left': 'marquee-left 45s linear infinite',
        'marquee-right': 'marquee-right 45s linear infinite',
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
