/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#34C759',
        secondary: '#007AFF',
        background: '#F5F7FA',
        surface: '#FFFFFF',
        textPrimary: '#1D1D1F',
        textSecondary: '#6E6E73',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        ui: ['Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
