import type React from "react";
import DashboardLayout from "@/components/dashboard-layout";

/**
 * Layout específico para a seção do painel de controle
 * Utiliza o componente DashboardLayout para envolver todas as páginas desta seção
 * @param children - Componentes filhos que serão renderizados dentro do layout
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
