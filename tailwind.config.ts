import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Old-school creamy vanilla palette
        bg: {
          DEFAULT: "#F8F0DC",   // antique white — page background, light with a warm whitish touch
          soft: "#FFFAEC",      // floral white — cards, elevated surfaces
          card: "#FFFEF7",      // nearly pure white — top elevation
        },
        fg: {
          DEFAULT: "#2A2118",   // aged-ink brown — primary text
          muted: "#6B5F4E",     // warm medium brown — secondary text
          dim: "#9C8E78",       // light brown — tertiary, dim
        },
        accent: {
          DEFAULT: "#D44C5A",   // light cherry red — warm, slightly pink, classic on vanilla
          soft: "rgba(212,76,90,0.12)",
        },
        success: "#2D6A4F",     // forest green
        warning: "#A66D1F",     // ochre
        danger:  "#7B2D26",     // oxblood — more "old school" than crimson
        line: "rgba(42,33,24,0.10)", // soft ink border
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      boxShadow: {
        // Subtle warm shadow that suits parchment / cream surfaces
        soft: "0 1px 0 0 rgba(255,255,255,0.35) inset, 0 1px 14px rgba(42,33,24,0.06)",
        ring: "0 0 0 1px rgba(42,33,24,0.08)",
      },
      animation: {
        "fade-in": "fadeIn 400ms ease-in-out both",
        "slide-up": "slideUp 400ms ease-in-out both",
        "shimmer": "shimmer 1.6s linear infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
