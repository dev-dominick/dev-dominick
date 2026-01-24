import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Premium color palette - enterprise-grade
      colors: {
        // Primary brand color (sophisticated blue)
        primary: {
          50: "rgb(240 249 255 / <alpha-value>)",
          100: "rgb(224 242 254 / <alpha-value>)",
          200: "rgb(186 230 253 / <alpha-value>)",
          300: "rgb(125 211 252 / <alpha-value>)",
          400: "rgb(56 189 248 / <alpha-value>)",
          500: "rgb(14 165 233 / <alpha-value>)",
          600: "rgb(2 132 199 / <alpha-value>)",
          700: "rgb(3 102 163 / <alpha-value>)",
          800: "rgb(7 89 133 / <alpha-value>)",
          900: "rgb(12 74 110 / <alpha-value>)",
          950: "rgb(8 47 73 / <alpha-value>)",
        },
        // Success green
        success: {
          50: "rgb(240 253 250 / <alpha-value>)",
          100: "rgb(204 251 241 / <alpha-value>)",
          400: "rgb(52 211 153 / <alpha-value>)",
          500: "rgb(16 185 129 / <alpha-value>)",
          600: "rgb(5 150 105 / <alpha-value>)",
        },
        // Warning amber
        warning: {
          50: "rgb(255 251 235 / <alpha-value>)",
          400: "rgb(250 204 21 / <alpha-value>)",
          500: "rgb(245 158 11 / <alpha-value>)",
          600: "rgb(217 119 6 / <alpha-value>)",
        },
        // Danger red
        danger: {
          50: "rgb(254 242 242 / <alpha-value>)",
          400: "rgb(248 113 113 / <alpha-value>)",
          500: "rgb(239 68 68 / <alpha-value>)",
          600: "rgb(220 38 38 / <alpha-value>)",
        },
        // Neutral palette
        neutral: {
          0: "rgb(255 255 255 / <alpha-value>)",
          50: "rgb(250 250 250 / <alpha-value>)",
          100: "rgb(245 245 245 / <alpha-value>)",
          200: "rgb(229 229 229 / <alpha-value>)",
          300: "rgb(212 212 212 / <alpha-value>)",
          400: "rgb(163 163 163 / <alpha-value>)",
          500: "rgb(115 115 115 / <alpha-value>)",
          600: "rgb(82 82 82 / <alpha-value>)",
          700: "rgb(64 64 64 / <alpha-value>)",
          800: "rgb(38 38 38 / <alpha-value>)",
          900: "rgb(23 23 23 / <alpha-value>)",
          950: "rgb(10 10 10 / <alpha-value>)",
        },
        // Matrix dark theme palette (for admin/dashboard)
        "matrix-black": "rgb(10 10 10 / <alpha-value>)",
        "matrix-dark": "rgb(23 23 23 / <alpha-value>)",
        "matrix-darker": "rgb(38 38 38 / <alpha-value>)",
        "matrix-primary": "rgb(34 197 94 / <alpha-value>)", // bright green
        "matrix-secondary": "rgb(100 116 139 / <alpha-value>)", // slate
        "matrix-accent": "rgb(59 130 246 / <alpha-value>)", // blue
        "matrix-text-primary": "rgb(34 197 94 / <alpha-value>)", // bright green
        "matrix-text-secondary": "rgb(148 163 184 / <alpha-value>)", // slate-400
        "matrix-text-muted": "rgb(100 116 139 / <alpha-value>)", // slate-500
        "matrix-border": "rgb(71 85 105 / <alpha-value>)", // slate-600
      },
      // Custom gradients for dashboard/matrix theme
      backgroundImage: {
        "matrix-linear-to-br": "linear-gradient(to bottom right, rgb(10 10 10), rgb(38 38 38))",
        "matrix-linear-to-r": "linear-gradient(to right, rgb(10 10 10), rgb(23 23 23))",
        "success-gradient": "linear-gradient(135deg, rgb(16 185 129), rgb(5 150 105))",
        "danger-gradient": "linear-gradient(135deg, rgb(239 68 68), rgb(220 38 38))",
        "primary-gradient": "linear-gradient(135deg, rgb(14 165 233), rgb(2 132 199))",
      },
      spacing: {
        xs: "0.5rem",    // 8px
        sm: "1rem",      // 16px
        md: "1.5rem",    // 24px
        lg: "2rem",      // 32px
        xl: "3rem",      // 48px
        "2xl": "4rem",   // 64px
        "3xl": "6rem",   // 96px
      },
      // Enterprise-grade shadows
      boxShadow: {
        // Minimal
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        // Base
        base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        // Elevated
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        // Focus ring
        "focus-ring": "0 0 0 3px rgba(14, 165, 233, 0.1), 0 0 0 1px rgb(14, 165, 233)",
        // Inverted
        inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
      },
      // Smooth transitions
      transitionDuration: {
        75: "75ms",
        100: "100ms",
        150: "150ms",
        200: "200ms",
        300: "300ms",
        400: "400ms",
        500: "500ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        "smooth-in": "cubic-bezier(0.4, 0, 1, 1)",
        "smooth-out": "cubic-bezier(0, 0, 0.2, 1)",
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      // Premium animations
      animation: {
        fadeIn: "fadeIn 300ms ease-out forwards",
        fadeOut: "fadeOut 300ms ease-out forwards",
        slideUp: "slideUp 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        slideDown: "slideDown 300ms ease-out forwards",
        slideLeft: "slideLeft 300ms ease-out forwards",
        slideRight: "slideRight 300ms ease-out forwards",
        scaleIn: "scaleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        spin: "spin 1s linear infinite",
        bounce: "bounce 1s infinite",
        "shimmer": "shimmer 2s infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideLeft: {
          "0%": { transform: "translateX(16px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(-16px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      // Border radius scale
      borderRadius: {
        xs: "0.25rem",    // 4px
        sm: "0.375rem",   // 6px
        md: "0.5rem",     // 8px
        lg: "0.75rem",    // 12px
        xl: "1rem",       // 16px
        "2xl": "1.5rem",  // 24px
        full: "9999px",
      },
      // Micro-interaction utilities
      scale: {
        98: "0.98",
        102: "1.02",
      },
      opacity: {
        2: "0.02",
        8: "0.08",
      },
    },
  },
  plugins: [],
};

export default config;
