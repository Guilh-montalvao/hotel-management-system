"use client";

/**
 * Layout Principal do Dashboard
 *
 * Este componente define a estrutura geral do painel de controle do sistema,
 * incluindo a barra lateral de navegação, cabeçalho com notificações e área
 * de conteúdo principal. Serve como contêiner para todas as páginas do dashboard.
 *
 * Funcionalidades:
 * - Barra lateral com navegação principal
 * - Cabeçalho com pesquisa e notificações
 * - Alternância de tema claro/escuro
 * - Layout responsivo que se adapta a diferentes tamanhos de tela
 */

import type React from "react";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart3,
  BellIcon,
  Building2,
  CalendarDays,
  CreditCard,
  FileText,
  HotelIcon,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Itens de navegação do menu lateral
 *
 * Esta constante define a estrutura da navegação principal do sistema.
 * Cada item contém:
 * - name: Nome exibido no menu
 * - href: URL de destino ao clicar no item
 * - icon: Componente de ícone Lucide a ser exibido
 *
 * Esta estrutura facilita a manutenção e expansão do menu, pois
 * novos itens podem ser adicionados apenas editando este array.
 */
const navigationItems = [
  { name: "Painel", href: "/dashboard", icon: BarChart3 },
  { name: "Gerenciamento de Quartos", href: "/rooms", icon: HotelIcon },
  { name: "Reservas", href: "/bookings", icon: CalendarDays },
  { name: "Hóspedes", href: "/guests", icon: Users },
  { name: "Pagamentos", href: "/payments", icon: CreditCard },
  { name: "Relatórios", href: "/reports", icon: FileText },
];

/**
 * Layout principal do painel de controle
 *
 * Este componente envolve toda a interface do dashboard e gerencia o estado
 * de elementos compartilhados como o menu lateral e as notificações.
 *
 * @param children - Componentes filhos (páginas específicas) que serão renderizados
 *                   dentro da área de conteúdo principal
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtém o caminho atual para destacar o item de menu ativo
  const pathname = usePathname();

  // Estado para controlar a exibição do dropdown de notificações
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    /**
     * SidebarProvider fornece o contexto necessário para a barra lateral
     * funcionar, incluindo estado de abertura/fechamento em dispositivos móveis
     */
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-muted/20">
        {/* Barra lateral de navegação */}
        <Sidebar className="border-r">
          {/* Cabeçalho da barra lateral com logo e nome do sistema */}
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 px-4 py-2">
              <HotelIcon className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">HotelPro</span>
            </div>
          </SidebarHeader>

          {/* Conteúdo principal da barra lateral com menu de navegação */}
          <SidebarContent>
            <SidebarMenu>
              {/* Mapeia os itens de navegação definidos na constante */}
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href} // Destaca o item ativo com base na URL atual
                    tooltip={item.name}
                  >
                    <a href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          {/* Rodapé da barra lateral com informações do usuário atual */}
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="/placeholder.svg" alt="Usuário" />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">João Silva</span>
                <span className="text-xs text-muted-foreground">
                  Gerente do Hotel
                </span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Área principal do dashboard com cabeçalho e conteúdo */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Cabeçalho com pesquisa, notificações e controles do sistema */}
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            {/* Botão para abrir/fechar a barra lateral em dispositivos móveis */}
            <SidebarTrigger />

            {/* Campo de pesquisa global */}
            <div className="w-full flex-1">
              <form>
                <div className="relative">
                  <Input
                    placeholder="Pesquisar..."
                    className="w-full md:w-[300px] pl-8"
                  />
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </form>
            </div>

            {/* Área de controles: notificações, tema, configurações e logout */}
            <div className="flex items-center gap-2">
              {/* Menu dropdown de notificações */}
              <DropdownMenu
                open={notificationsOpen}
                onOpenChange={setNotificationsOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative"
                    aria-label="Notificações"
                  >
                    <BellIcon className="h-5 w-5" />
                    {/* Badge indicando número de notificações não lidas */}
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      3
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                {/* Conteúdo do dropdown de notificações */}
                <DropdownMenuContent align="end" className="w-[300px]">
                  <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] overflow-auto">
                    {/* Lista de notificações recentes */}
                    <NotificationItem
                      title="Nova Reserva"
                      description="Quarto 301 reservado para amanhã"
                      time="5 min atrás"
                    />
                    <NotificationItem
                      title="Solicitação de Manutenção"
                      description="Quarto 205 reportou problema no ar-condicionado"
                      time="20 min atrás"
                    />
                    <NotificationItem
                      title="Lembrete de Check-out"
                      description="3 hóspedes com check-out hoje"
                      time="1 hora atrás"
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Botão para alternar entre tema claro e escuro */}
              <ModeToggle />

              {/* Botão de acesso às configurações do sistema */}
              <Button variant="outline" size="icon" aria-label="Configurações">
                <Settings className="h-5 w-5" />
              </Button>

              {/* Botão para realizar logout do sistema */}
              <Button variant="outline" size="icon" aria-label="Sair">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Área de conteúdo principal onde as páginas específicas são renderizadas */}
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

/**
 * Componente de ícone de pesquisa
 *
 * Ícone SVG personalizado para o campo de pesquisa.
 * Construído como um componente React que aceita propriedades SVG padrão.
 *
 * @param props - Propriedades SVG padrão que serão passadas para o elemento
 */
function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

/**
 * Componente para exibir um item de notificação
 *
 * Renderiza uma notificação individual no dropdown de notificações.
 * Exibe título, descrição e tempo relativo desde a criação.
 *
 * @param title - Título/assunto da notificação
 * @param description - Texto detalhado da notificação
 * @param time - Tempo relativo desde que a notificação foi criada (ex: "5 min atrás")
 */
function NotificationItem({
  title,
  description,
  time,
}: {
  title: string;
  description: string;
  time: string;
}) {
  return (
    <DropdownMenuItem className="flex flex-col items-start p-4 cursor-default">
      <div className="font-medium">{title}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
      <div className="text-xs text-muted-foreground mt-1">{time}</div>
    </DropdownMenuItem>
  );
}
