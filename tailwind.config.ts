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
        background: "var(--background)",
        foreground: "var(--foreground)",
        wheel: {
          orange: "#f97316",
          amber: "#f59e0b",
          lime: "#84cc16",
          green: "#22c55e",
          cyan: "#0284c7",
          rose: "#f43f5e",
          pink: "#ec4899",
          purple: "#a855f7",
          navy: "#0f172a",
        },
      },
      backgroundImage: {
        "logo-gradient":
          "linear-gradient(135deg, #f97316 0%, #f59e0b 30%, #84cc16 65%, #0284c7 100%)",
        "wheel-conic":
          "conic-gradient(from 0deg, #f97316 0deg 45deg, #84cc16 45deg 90deg, #0284c7 90deg 135deg, #f59e0b 135deg 180deg, #f43f5e 180deg 225deg, #22c55e 225deg 270deg, #ec4899 270deg 315deg, #a855f7 315deg 360deg)",
      },
    },
  },
  plugins: [],
};
export default config;
