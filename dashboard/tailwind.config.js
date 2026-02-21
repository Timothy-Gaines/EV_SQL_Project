/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          900: '#08090a',
          800: '#101214',
          700: '#1a1d21',
          600: '#2b3036',
          500: '#404750',
        },
        accent: {
          lime: '#ccff00',
          orange: '#ff3f00',
          purple: '#b05cff',
          cyan: '#00e5ff',
          pink: '#ff0077',
        },
        txt: {
          primary: '#f0f2f5',
          secondary: '#9ba3af',
          muted: '#5e6773',
        },
      },
      fontFamily: {
        display: ['Unbounded', 'sans-serif'],
        body: ['Archivo', 'sans-serif'],
        mono: ['Red Hat Mono', 'monospace'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(204, 255, 0, 0.2)',
        'brutal-hover': '6px 6px 0px 0px rgba(204, 255, 0, 1)',
        'brutal-orange': '4px 4px 0px 0px rgba(255, 63, 0, 0.2)',
        'brutal-purple': '4px 4px 0px 0px rgba(176, 92, 255, 0.2)',
        'brutal-cyan': '4px 4px 0px 0px rgba(0, 229, 255, 0.2)',
        'brutal-pink': '4px 4px 0px 0px rgba(255, 0, 119, 0.2)',
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E\")",
        'dots': "radial-gradient(#2b3036 1px, transparent 1px)",
      },
      backgroundSize: {
        'dots': '24px 24px',
      },
    },
  },
  plugins: [],
};
