/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // High-end dark theme SaaS palette
        dark: {
          bg: '#090d16',      // Deep space black/blue
          panel: '#111827',   // Slate gray
          card: '#1f2937',    // Card color
          border: '#374151',  // Border color
          text: '#f9fafb',    // Main text
          muted: '#9ca3af',   // Secondary text
          hover: '#2563eb'    // Primary action hover
        }
      }
    },
  },
  plugins: [],
}
