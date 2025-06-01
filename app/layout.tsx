/**
 * Layout Raiz da Aplicação
 *
 * Este arquivo define a estrutura básica de todas as páginas da aplicação,
 * funcionando como um contêiner que envolve todo o conteúdo.
 *
 * Elementos incluídos:
 * - Configuração de fonte (Inter)
 * - Metadados para SEO
 * - Provedor de tema (modo claro/escuro)
 * - Layout do dashboard
 */

import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import DashboardLayout from "@/components/dashboard-layout";

/**
 * Configuração da fonte Inter da Google
 *
 * Carrega a fonte Inter com suporte para caracteres latinos.
 * Esta fonte será aplicada em todo o corpo da aplicação.
 * O Next.js otimiza automaticamente o carregamento desta fonte.
 */
const inter = Inter({ subsets: ["latin"] });

/**
 * Metadados da aplicação
 *
 * Estas informações são usadas pelo Next.js para:
 * - Definir o título da página na aba do navegador
 * - Fornecer descrição para motores de busca (SEO)
 * - Identificar o gerador da aplicação
 *
 * Estes metadados são aplicados a todas as páginas, mas podem ser
 * sobrescritos em páginas específicas conforme necessário.
 */
export const metadata: Metadata = {
  title: "Sistema de Gerenciamento de Hotel",
  description: "Um sistema moderno de gerenciamento de hotel",
  generator: "v0.dev",
};

/**
 * Componente de Layout Raiz
 *
 * Este componente é o contêiner principal de toda a aplicação e configura:
 * - A estrutura HTML básica (html, body)
 * - A linguagem do documento (pt-BR)
 * - A fonte padrão (Inter)
 * - O provedor de tema para suporte a modo claro/escuro
 * - O layout do dashboard que contém a barra lateral e a estrutura comum
 *
 * O suppressHydrationWarning evita avisos relacionados à hidratação do React
 * quando há diferenças entre a renderização do servidor e do cliente,
 * especialmente útil com o sistema de temas.
 *
 * @param children - Os componentes de página que serão renderizados dentro deste layout
 * @returns Elemento JSX estruturado com todo o contexto necessário para a aplicação
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* 
          ThemeProvider: Provedor de tema que permite alternar entre modo claro e escuro
          - attribute="class": usa classes CSS para controlar o tema
          - defaultTheme="light": inicia a aplicação em modo claro
          - enableSystem: permite usar a preferência do sistema do usuário
          - disableTransitionOnChange: evita animações ao mudar de tema
        */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* 
            DashboardLayout: Layout principal com barra lateral e estrutura comum
            Este componente contém a navegação principal e a estrutura compartilhada
            entre todas as páginas do dashboard.
          */}
          <DashboardLayout>{children}</DashboardLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
