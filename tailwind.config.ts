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
      colors: {
        // Matrix theme: cyber green on deep black
        matrix: {
          black: "#0D0208",
          darkest: "#121212",
          darker: "#1a1a1a",
          dark: "#252525",
          gray: "#2d2d2d",
          border: "#00ff41",
          primary: "#00ff41",
          secondary: "#39ff14",
          accent: "#0dff00",
          muted: "#008f11",
          success: "#00ff41",
          warning: "#ffff00",
          error: "#ff073a",
          text: {
            primary: "#e0e0e0",
            secondary: "#b0b0b0",
            muted: "#808080",
            accent: "#00ff41",
          }
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        'matrix': '0 0 10px rgba(0, 255, 65, 0.3)',
        'matrix-lg': '0 0 20px rgba(0, 255, 65, 0.4)',
        'matrix-xl': '0 0 30px rgba(0, 255, 65, 0.5)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 8s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 65, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 65, 0.8)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
};

export default config;
