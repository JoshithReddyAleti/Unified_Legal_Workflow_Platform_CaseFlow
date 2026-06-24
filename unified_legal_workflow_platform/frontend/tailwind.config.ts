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
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#4F6AF5",
          600: "#4338ca",
          700: "#3730a3",
          800: "#312e81",
          900: "#1e1b4b",
        },
        surface: {
          base: "#080E1A",
          900: "#0D1628",
          800: "#111F38",
          700: "#162242",
          600: "#1C2D52",
          500: "#1E3A5F",
        },
        glass: "rgba(255,255,255,0.04)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(239,68,68,0.4)" },
          "50%": { boxShadow: "0 0 20px rgba(239,68,68,0.8), 0 0 40px rgba(239,68,68,0.3)" },
        },
        accentGlow: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(79,106,245,0.3)" },
          "50%": { boxShadow: "0 0 24px rgba(79,106,245,0.6), 0 0 48px rgba(79,106,245,0.2)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(79,106,245,0.3)" },
          "50%": { borderColor: "rgba(79,106,245,0.7)" },
        },
        typing: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        blink: {
          "0%, 100%": { borderColor: "transparent" },
          "50%": { borderColor: "rgba(79,106,245,0.8)" },
        },
        stagger1: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-in-right": "slideInRight 0.4s cubic-bezier(0.4,0,0.2,1) forwards",
        "slide-in-left": "slideInLeft 0.4s cubic-bezier(0.4,0,0.2,1) forwards",
        shimmer: "shimmer 2s infinite linear",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "accent-glow": "accentGlow 2.5s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "gradient-x": "gradientX 4s ease infinite",
        "spin-slow": "spinSlow 8s linear infinite",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.4,0,0.2,1) forwards",
        "border-glow": "borderGlow 2s ease-in-out infinite",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)",
        "card-hover": "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(79,106,245,0.15)",
        glow: "0 0 20px rgba(79,106,245,0.4)",
        "glow-danger": "0 0 20px rgba(239,68,68,0.4)",
        "glow-success": "0 0 20px rgba(16,185,129,0.4)",
        inner: "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)",
        "sidebar-gradient": "linear-gradient(180deg, #0A1628 0%, #0D1A38 50%, #0B1422 100%)",
        "hero-gradient": "linear-gradient(135deg, #0B1120 0%, #0F1C38 50%, #0B1120 100%)",
        "accent-gradient": "linear-gradient(135deg, #4F6AF5 0%, #7C3AED 100%)",
        "danger-gradient": "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
        "success-gradient": "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
