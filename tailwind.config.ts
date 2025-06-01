/**
 * Arquivo de Configuração do Tailwind CSS
 *
 * Este arquivo define todas as configurações personalizadas do framework Tailwind CSS,
 * incluindo cores, espaçamentos, animações e plugins.
 */

import type { Config } from "tailwindcss";

const config = {
  /**
   * Configuração do modo escuro
   *
   * ["class"] - Indica que o modo escuro será controlado pela classe 'dark'
   * no elemento HTML, em vez de usar as preferências do sistema operacional.
   */
  darkMode: ["class"],

  /**
   * Configuração de conteúdo
   *
   * Define os arquivos que o Tailwind deve escanear para encontrar classes
   * e gerar o CSS. Inclui todos os arquivos TypeScript/React do projeto.
   */
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],

  /**
   * Prefixo para as classes do Tailwind
   *
   * Deixado vazio para usar os nomes padrão sem prefixo.
   * Útil para evitar conflitos quando se usa múltiplos frameworks CSS.
   */
  prefix: "",

  /**
   * Configuração do tema
   *
   * Define todas as personalizações visuais do tema, incluindo cores,
   * espaçamentos, tipografia e outros valores de design.
   */
  theme: {
    /**
     * Configuração do container
     *
     * Define como os elementos com a classe 'container' devem se comportar.
     */
    container: {
      center: true, // Centraliza o container horizontalmente
      padding: "2rem", // Adiciona padding interno padrão
      screens: {
        "2xl": "1400px", // Define a largura máxima para telas grandes
      },
    },

    /**
     * Extensões do tema padrão
     *
     * Adiciona ou modifica valores no tema base do Tailwind,
     * sem substituir completamente as configurações padrão.
     */
    extend: {
      /**
       * Paleta de cores personalizada
       *
       * Define todas as cores do sistema de design, usando variáveis CSS
       * para facilitar a troca entre temas claro e escuro.
       * O formato hsl(var(--nome-da-cor)) permite manipular cores via CSS.
       */
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
        /**
         * Cores específicas para a barra lateral
         *
         * Define um conjunto separado de cores para a barra lateral,
         * permitindo estilização independente do tema principal.
         */
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
      },

      /**
       * Raios de borda personalizados
       *
       * Define os raios de borda usando variáveis CSS,
       * o que permite ajustar facilmente o arredondamento em todo o projeto.
       */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      /**
       * Animações de keyframe personalizadas
       *
       * Define animações para componentes específicos,
       * como o comportamento de expansão e colapso de acordeões.
       */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },

      /**
       * Configurações de animação
       *
       * Define as configurações de temporização e easing para as animações keyframe.
       */
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },

  /**
   * Plugins do Tailwind CSS
   *
   * Estende as funcionalidades do Tailwind com plugins adicionais.
   * tailwindcss-animate - Adiciona utilitários para animações.
   */
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
