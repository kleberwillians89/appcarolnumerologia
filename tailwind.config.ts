import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        lg: 'calc(var(--radius) + 2px)',
        md: 'var(--radius)',
        sm: 'calc(var(--radius) - 2px)'
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in': { from: { transform: 'translateY(10px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        'slide-up': { from: { transform: 'translateY(30px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        
        /* ➕ Animação suave para imagem de cabeçalho */
        'header-fade-slide': { 
          from: { transform: 'translateY(-20px) scale(0.95)', opacity: '0' }, 
          to: { transform: 'translateY(0) scale(1)', opacity: '1' } 
        },

        /* ➕ animações sutis para os números decorativos */
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-rotate': {
          '0%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1.5deg)' },
          '100%': { transform: 'translateY(0px) rotate(0deg)' },
        },

      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
        'slide-up-delay-1': 'slide-up 0.6s ease-out 0.1s both',
        'slide-up-delay-2': 'slide-up 0.6s ease-out 0.2s both',
        'slide-up-delay-3': 'slide-up 0.6s ease-out 0.3s both',
        'fade-in-delay-1': 'fade-in 0.8s ease-out 0.2s both',
        'fade-in-delay-2': 'fade-in 0.8s ease-out 0.4s both',
        'fade-in-delay-3': 'fade-in 0.8s ease-out 0.6s both',
        'fade-in-delay-4': 'fade-in 0.8s ease-out 0.8s both',
        
        /* ➕ Animação para imagem de cabeçalho - sincronizada com card */
        'header-fade-slide': 'header-fade-slide 0.8s ease-out 0.15s both',

        /* ➕ utilitários para os números */
        'float-slow': 'float 6s ease-in-out infinite',
        'float-slower': 'float-rotate 8s ease-in-out infinite',

      },
      typography: {
        DEFAULT: { css: { maxWidth: 'none' } },
      },
    }
  },
  plugins: [animate, typography],
} satisfies Config;
