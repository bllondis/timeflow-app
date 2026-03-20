import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Urbanist', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Urbanist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        tf: {
          bg: "hsl(var(--tf-bg))",
          ink: "hsl(var(--tf-ink))",
          muted: "hsl(var(--tf-muted))",
          border: "hsl(var(--tf-border))",
          surface: "hsl(var(--tf-surface))",
          accent: "hsl(var(--tf-accent))",
          "accent-hover": "hsl(var(--tf-accent-hover))",
          blue: "hsl(var(--tf-blue))",
          "blue-hover": "hsl(var(--tf-blue-hover))",
          "blue-light": "hsl(var(--tf-blue-light))",
          teal: "hsl(var(--tf-teal))",
          green: "hsl(var(--tf-green))",
          yellow: "hsl(var(--tf-yellow))",
          orange: "hsl(var(--tf-orange))",
          red: "hsl(var(--tf-red))",
          purple: "hsl(var(--tf-purple))",
          topbar: "hsl(var(--tf-topbar))",
          "card-bg": "hsl(var(--tf-card-bg))",
          "card-border": "hsl(var(--tf-card-border))",
        },
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px 0 rgba(0,0,0,0.06)',
        'soft': '0 1px 3px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
        'modal': '0 24px 64px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,0.03)',
        'toast': '0 8px 24px rgba(0,0,0,.08)',
        'float': '0 2px 8px rgba(0,0,0,0.04), 0 0px 1px rgba(0,0,0,0.06)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
