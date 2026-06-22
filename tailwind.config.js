/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF7F2',
        coffee: '#5C3D2E',
        amber: '#C8763A',
        sage: '#7A9E7E',
        alert: '#C0392B',
        ink: '#2C2016',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(44,32,22,0.08), 0 1px 2px rgba(44,32,22,0.04)',
        card: '0 4px 16px rgba(92,61,46,0.08)',
      },
    },
  },
  plugins: [],
}
