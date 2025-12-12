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
        primary: "#000000",
        accent: "#FF4081",
        background: "#FFFFFF",
        text: "#1A1A1A",
      },
      fontFamily: {
        heading: ["SF Pro Display", "system-ui", "sans-serif"],
        body: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      fontSize: {
        "heading-48": ["48px", "1.2"],
        "body-16": ["16px", "1.2"],
      },
      fontWeight: {
        "900": "900",
        "500": "500",
      },
      blockSize: {
        "hero-button": "64px",
      },
    },
  },
  plugins: [],
};

export default config;