"use client";

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
 * Cada item contém nome, URL de destino e ícone
 */
const navigationItems = [
  { name: "Painel", href: "/dashboard", icon: BarChart3 },
  { name: "Gerenciamento de Quartos", href: "/rooms", icon: HotelIcon },
  { name: "Reservas", href: "/bookings", icon: CalendarDays },
  { name: "Hóspedes", href: "/guests", icon: Users },
  { name: "Pagamentos", href: "/payments", icon: CreditCard },
  { name: "Funcionários", href: "/staff", icon: Building2 },
  { name: "Relatórios", href: "/reports", icon: FileText },
];

/**
 * Layout principal do painel de controle
 * Fornece estrutura com barra lateral de navegação e cabeçalho
 * @param children - Componentes filhos que serão renderizados dentro do layout
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-muted/20">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 px-4 py-2">
              <HotelIcon className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">HotelPro</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
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
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger />
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
            <div className="flex items-center gap-2">
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
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      3
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px]">
                  <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] overflow-auto">
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
              <ModeToggle />
              <Button variant="outline" size="icon" aria-label="Configurações">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Sair">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

/**
 * Componente de ícone de pesquisa
 * @param props - Propriedades SVG padrão
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
 * @param title - Título da notificação
 * @param description - Descrição da notificação
 * @param time - Tempo relativo desde que a notificação foi criada
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
