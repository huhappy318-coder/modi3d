/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f1110',
        mist: '#d7d3ca',
        ash: '#7c847f',
        celadon: '#8faba6',
        cloud: '#f1eee7',
        gold: '#c9b184',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', '"PingFang SC"', 'serif'],
      },
      letterSpacing: {
        calm: '0.18em',
      },
      boxShadow: {
        veil: '0 0 120px rgba(190, 208, 202, 0.05)',
      },
    },
  },
  plugins: [],
}
