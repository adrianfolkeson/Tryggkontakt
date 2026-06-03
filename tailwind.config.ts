import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-sunken": "var(--surface-sunken)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        "text-subtle": "var(--text-subtle)",
        primary: {
          DEFAULT: "var(--primary)",
          text: "var(--primary-text)",
          soft: "var(--primary-soft)",
        },
        warn: {
          DEFAULT: "var(--warn)",
          soft: "var(--warn-soft)",
        },
        danger: "var(--danger)",
        focus: "var(--focus)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["2rem", { lineHeight: "1.2", fontWeight: "600" }],
        h1: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        h2: ["1.25rem", { lineHeight: "1.35", fontWeight: "600" }],
        "body-lg": ["1.1875rem", { lineHeight: "1.55", fontWeight: "400" }],
        body: ["1.0625rem", { lineHeight: "1.55", fontWeight: "400" }],
        meta: ["0.9375rem", { lineHeight: "1.45", fontWeight: "500" }],
        caption: ["0.875rem", { lineHeight: "1.4", fontWeight: "500" }],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        pill: "9999px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(31, 42, 46, 0.04), 0 4px 12px rgba(31, 42, 46, 0.04)",
        lifted:
          "0 2px 4px rgba(31, 42, 46, 0.06), 0 12px 32px rgba(31, 42, 46, 0.08)",
      },
      transitionDuration: {
        instant: "120ms",
        quick: "200ms",
        DEFAULT: "280ms",
        slow: "420ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.2, 0, 0, 1)",
        exit: "cubic-bezier(0.4, 0, 1, 1)",
      },
      keyframes: {
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "8%": { opacity: "1", transform: "translateY(0)" },
          "92%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(0)" },
        },
      },
      animation: {
        "toast-in": "toast-in 3s cubic-bezier(0.2, 0, 0, 1) forwards",
      },
      minHeight: {
        tap: "48px",
        button: "52px",
      },
      maxWidth: {
        content: "640px",
      },
    },
  },
  plugins: [],
} satisfies Config;
