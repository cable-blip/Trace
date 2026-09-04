/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        spotlight: "spotlight 2s ease .75s 1 forwards",
        glitch: "glitch 0.3s ease forwards",
        "glitch-subtle": "glitch 0.5s ease forwards",
        "hud-scan": "hud-scan 3s linear infinite",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "border-flow": "border-flow 3s linear infinite",
      },
      keyframes: {
        spotlight: {
          "0%": { opacity: 0, transform: "translate(-72%, -62%) scale(0.5)" },
          "100%": { opacity: 1, transform: "translate(-50%, -40%) scale(1)" },
        },
        glitch: {
          "0%": { transform: "skew(0deg)" },
          "20%": { transform: "skew(-2deg) translateX(-2px)" },
          "40%": { transform: "skew(1.5deg) translateX(2px)" },
          "60%": { transform: "skew(-1deg) translateX(-1px)" },
          "80%": { transform: "skew(0.5deg)" },
          "100%": { transform: "skew(0deg)" },
        },
        "hud-scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "neon-pulse": {
          "0%, 100%": { opacity: 1, textShadow: "0 0 10px currentColor, 0 0 30px currentColor" },
          "50%": { opacity: 0.8, textShadow: "0 0 5px currentColor, 0 0 15px currentColor" },
        },
        "border-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      colors: {
        background: '#06070A',
        surface: '#0C130E',
        'surface-elevated': '#151820',
        'surface-border': 'rgba(255, 255, 255, 0.08)',
        'text-primary': '#E0E0E0',
        'text-secondary': '#94A3B8',
        'text-muted': '#5E6470',
        accent: {
          emerald: '#10B981',
          cyan: '#00FFFF',
          blue: '#3B82F6',
          neon: '#00FF41',
          magenta: '#FF00FF',
          red: '#FF3333',
        },
      },
      fontFamily: {
        sans: ['Fira Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'IBM Plex Mono', 'monospace'],
        hud: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(0, 255, 255, 0.5), 0 0 30px rgba(0, 255, 255, 0.2)',
        'neon-green': '0 0 10px rgba(0, 255, 65, 0.5), 0 0 30px rgba(0, 255, 65, 0.2)',
        'neon-red': '0 0 10px rgba(255, 51, 51, 0.5), 0 0 30px rgba(255, 51, 51, 0.2)',
        'neon-magenta': '0 0 10px rgba(255, 0, 255, 0.5), 0 0 30px rgba(255, 0, 255, 0.2)',
        'hud': '0 0 0 1px rgba(0, 255, 255, 0.3), 0 0 15px rgba(0, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
}
