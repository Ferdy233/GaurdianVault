import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f7f6f3",
        ink: {
          DEFAULT: "#14161a",
          700: "#3d4249",
          500: "#6b7178",
          300: "#a6abb2"
        },
        rule: "#dcd9d2",
        navy: {
          DEFAULT: "#1c3049",
          900: "#101d2c",
          700: "#25405f",
          100: "#dde4ec",
          50: "#eef1f5"
        },
        brass: {
          DEFAULT: "#9a7638",
          400: "#c9a765",
          100: "#f2e8d5"
        },
        moss: {
          DEFAULT: "#3f6b4f",
          100: "#e3ede5"
        },
        oxblood: {
          DEFAULT: "#6b2233",
          100: "#f4e3e6"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"]
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }]
      },
      borderRadius: {
        DEFAULT: "2px",
        md: "3px",
        lg: "4px"
      }
    }
  },
  plugins: []
};

export default config;
