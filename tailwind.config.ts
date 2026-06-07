import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        iosBlue: '#0A84FF',
        appBg: '#F7F8FA',
        appCard: '#FFFFFF',
        appText: '#1D1D1F',
        appSecondary: '#6E6E73',
        appSuccess: '#34C759'
      },
      borderRadius: {
        ios: '20px'
      },
      boxShadow: {
        card: '0 16px 45px rgba(29, 29, 31, 0.08)'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config;
