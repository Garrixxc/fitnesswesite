/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink:     "rgb(var(--brand-ink) / <alpha-value>)",
        surface: "rgb(var(--brand-surface) / <alpha-value>)",
        primary: "rgb(var(--brand-primary) / <alpha-value>)",
        accent:  "rgb(var(--brand-accent) / <alpha-value>)",
        muted:   "rgb(var(--brand-muted) / <alpha-value>)",
      },
      boxShadow: { brand: "0 12px 28px rgba(99,91,255,0.25)" },
    },
  },
  plugins: [],
};
