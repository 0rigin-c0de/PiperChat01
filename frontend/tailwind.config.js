/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050608",
        panel: "#0B0D12",
        panel2: "#0E111A",
        line: "rgba(255,255,255,0.10)",
        brand: {
          300: "#E7FF4F",
          400: "#DBFF1F",
          500: "#C7F510",
        },
        neon: {
          cyan: "#22D3EE",
          violet: "#7C5CFC",
          lime: "#C7F510",
        },
      },
      boxShadow: {
        soft: "0 16px 50px rgba(0,0,0,0.55)",
        ring: "0 0 0 1px rgba(255,255,255,0.10) inset",
        neon:
          "0 0 0 1px rgba(255,255,255,0.08) inset, 0 20px 60px rgba(0,0,0,0.55)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(900px 600px at 15% 10%, rgba(124,92,252,0.25), transparent 55%), radial-gradient(900px 600px at 85% 20%, rgba(34,211,238,0.18), transparent 55%), radial-gradient(900px 700px at 50% 90%, rgba(231,255,79,0.08), transparent 60%)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
