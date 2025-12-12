import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        accent: '#FF4081',
        background: '#FFFFFF',
        text: '#1A1A1A',
        contrast: '#000000',
      },
      fontFamily: {
        heading: ['"SF Pro Display"', 'system-ui', 'sans-serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        heading: ['48px', { lineHeight: '1.2' }],
        base: ['16px', { lineHeight: '1.2' }],
      },
      height: {
        '64': '64px',
      },
    },
  },
  plugins: [],
}

export default config
