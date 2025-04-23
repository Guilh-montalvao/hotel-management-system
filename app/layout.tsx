import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

// Definição da fonte Inter com suporte para caracteres latinos
const inter = Inter({ subsets: ["latin"] });

// Metadados da aplicação que serão utilizados para SEO e exibição do título da página
export const metadata: Metadata = {
  title: "Sistema de Gerenciamento de Hotel",
  description: "Um sistema moderno de gerenciamento de hotel",
  generator: "v0.dev",
};

/**
 * Layout raiz da aplicação
 * Esta função envolve toda a aplicação e fornece o contexto do tema
 * @param children - Componentes filhos que serão renderizados dentro do layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
