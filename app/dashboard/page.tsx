"use client";

/**
 * Página do Painel de Controle (Dashboard)
 *
 * Este componente é a página principal do sistema de gerenciamento de hotel.
 * Exibe métricas importantes, gráficos de desempenho, ações rápidas e
 * listagens de reservas recentes. Serve como hub central para navegar
 * para outras funcionalidades do sistema.
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BedDoubleIcon,
  CalendarIcon,
  CreditCardIcon,
  DollarSignIcon,
  PercentIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OccupancyChart } from "@/components/dashboard/occupancy-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { AddBookingDialog } from "@/components/bookings/add-booking-dialog";
import { AddGuestDialog } from "@/components/guests/add-guest-dialog";
import { dashboardService } from "@/lib/services/dashboard-service";
import { toast } from "sonner";
import { BreadcrumbNavigation } from "@/components/ui/breadcrumb-navigation";
import { AnalyticsTab } from "@/components/dashboard/analytics-tab";
import { ReportsTab } from "@/components/dashboard/reports-tab";

/**
 * Página principal do painel de controle
 * Exibe informações resumidas e estatísticas importantes para gerenciamento do hotel
 */
export default function DashboardPage() {
  // Estados para controlar a visibilidade dos diálogos de adição
  const [showAddBookingDialog, setShowAddBookingDialog] = useState(false);
  const [showAddGuestDialog, setShowAddGuestDialog] = useState(false);

  // Estados para dados reais do dashboard
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados reais do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Buscar todas as métricas em paralelo
        const [metrics, bookings, occupancy, revenue] = await Promise.all([
          dashboardService.getDashboardMetrics(),
          dashboardService.getRecentBookings(),
          dashboardService.getOccupancyChartData(),
          dashboardService.getRevenueChartData(),
        ]);

        setDashboardMetrics(metrics);
        setRecentBookings(bookings);
        setOccupancyData(occupancy);
        setRevenueData(revenue);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        toast.error("Erro ao carregar dados do dashboard");

        // Fallback para dados vazios
        setDashboardMetrics({
          totalRooms: 0,
          occupiedRooms: 0,
          availableRooms: 0,
          occupancyRate: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          activeGuests: 0,
          pendingBookings: 0,
          todayCheckIns: 0,
          todayCheckOuts: 0,
        });
        setRecentBookings([]);
        setOccupancyData([]);
        setRevenueData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /**
   * Função para processar a adição de uma nova reserva
   *
   * @param data - Dados da nova reserva a ser adicionada
   * Em um ambiente de produção, esta função chamaria uma API para persistir os dados
   */
  const handleAddBooking = (data: any) => {
    // Aqui poderíamos implementar a lógica para salvar a reserva
    console.log("Nova reserva criada:", data);
    // Normalmente redirecionaríamos para a página de reservas
    // ou atualizaríamos o estado local
  };

  /**
   * Função para processar a adição de um novo hóspede
   *
   * @param data - Dados do novo hóspede a ser cadastrado
   * Em um ambiente de produção, esta função chamaria uma API para persistir os dados
   */
  const handleAddGuest = (data: any) => {
    // Aqui poderíamos implementar a lógica para salvar o hóspede
    console.log("Novo hóspede cadastrado:", data);
    // Normalmente redirecionaríamos para a página de hóspedes
    // ou atualizaríamos o estado local
  };

  return (
    <div className="flex flex-col gap-4">
      <BreadcrumbNavigation />
      {/* Cabeçalho com título e botões de ação */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Painel de Controle
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" aria-label="Filtrar por data">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Filtrar por Data
          </Button>
          <Button size="sm" aria-label="Baixar relatório">
            <ArrowDownIcon className="mr-2 h-4 w-4" />
            Baixar Relatório
          </Button>
        </div>
      </div>

      {/* Cards de resumo com métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card de Receita Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSignIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "R$ 0,00"
                : `R$ ${(dashboardMetrics?.totalRevenue || 0).toLocaleString(
                    "pt-BR",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}`}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpIcon
                className="mr-1 h-4 w-4 text-emerald-500"
                aria-hidden="true"
              />
              Receita total acumulada
            </p>
          </CardContent>
        </Card>

        {/* Card de Taxa de Ocupação */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Ocupação
            </CardTitle>
            <PercentIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "0%"
                : `${Math.round(dashboardMetrics?.occupancyRate || 0)}%`}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpIcon
                className="mr-1 h-4 w-4 text-emerald-500"
                aria-hidden="true"
              />
              {isLoading
                ? "0 de 0 quartos"
                : `${dashboardMetrics?.occupiedRooms || 0} de ${
                    dashboardMetrics?.totalRooms || 0
                  } quartos`}
            </p>
          </CardContent>
        </Card>

        {/* Card de Quartos Disponíveis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Quartos Disponíveis
            </CardTitle>
            <BedDoubleIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "0" : dashboardMetrics?.availableRooms || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading
                ? "De um total de 0 quartos"
                : `De um total de ${dashboardMetrics?.totalRooms || 0} quartos`}
            </p>
          </CardContent>
        </Card>

        {/* Card de Reservas Pendentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reservas Pendentes
            </CardTitle>
            <CalendarIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "0" : dashboardMetrics?.pendingBookings || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Aguardando confirmação" : "Aguardando confirmação"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sistema de abas para diferentes visualizações do painel */}
      <Tabs defaultValue="visao-geral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="analises">Análises</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        {/* Conteúdo da aba Visão Geral - principal do dashboard */}
        <TabsContent value="visao-geral" className="space-y-4">
          {/* Seção de gráficos - ocupação e receita */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Gráfico de Taxa de Ocupação */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Taxa de Ocupação</CardTitle>
                <CardDescription>
                  Ocupação de quartos nos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <OccupancyChart data={occupancyData} isLoading={isLoading} />
              </CardContent>
            </Card>

            {/* Gráfico de Receita */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Receita</CardTitle>
                <CardDescription>
                  Receita semanal dos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart data={revenueData} isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>

          {/* Seção de listagens e ações rápidas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Card de Reservas Recentes - lista as últimas reservas */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Reservas Recentes</CardTitle>
                <CardDescription>
                  Você tem 6 novas reservas hoje
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Iteração sobre o array de reservas recentes */}
                  {recentBookings.map((booking, index) => (
                    <div
                      key={`${booking.name}-${booking.room}-${index}`}
                      className="flex items-center justify-between space-x-4"
                    >
                      {/* Informações do hóspede com avatar */}
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage
                            src={booking.avatar}
                            alt={booking.name}
                          />
                          <AvatarFallback>{booking.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {booking.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Quarto {booking.room}
                          </p>
                        </div>
                      </div>

                      {/* Informações de data e status com badge contextual */}
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-muted-foreground whitespace-nowrap">
                          {booking.date}
                        </p>
                        <Badge
                          variant={
                            booking.status === "Confirmada"
                              ? "default"
                              : booking.status === "Pendente"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Card de Ações Rápidas - botões para operações comuns */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Tarefas e operações comuns</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {/* Botão para abrir o diálogo de criação de reserva */}
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setShowAddBookingDialog(true)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Nova Reserva
                </Button>

                {/* Botão para abrir o diálogo de adição de hóspede */}
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setShowAddGuestDialog(true)}
                >
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Adicionar Hóspede
                </Button>

                {/* Botão para verificar status de quarto */}
                <Button className="w-full justify-start" variant="outline">
                  <BedDoubleIcon className="mr-2 h-4 w-4" />
                  Status do Quarto
                </Button>

                {/* Botão para processar pagamento */}
                <Button className="w-full justify-start" variant="outline">
                  <CreditCardIcon className="mr-2 h-4 w-4" />
                  Processar Pagamento
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conteúdo da aba Análises */}
        <TabsContent value="analises" className="space-y-4">
          <AnalyticsTab />
        </TabsContent>

        {/* Conteúdo da aba Relatórios */}
        <TabsContent value="relatorios" className="space-y-4">
          <ReportsTab />
        </TabsContent>
      </Tabs>

      {/* Diálogo para adicionar nova reserva - aberto via estado */}
      <AddBookingDialog
        open={showAddBookingDialog}
        onOpenChange={setShowAddBookingDialog}
        onAddBooking={handleAddBooking}
      />

      {/* Diálogo para adicionar novo hóspede - aberto via estado */}
      <AddGuestDialog
        open={showAddGuestDialog}
        onOpenChange={setShowAddGuestDialog}
        onAddGuest={handleAddGuest}
      />
    </div>
  );
}

/**
 * Dados de exemplo para as reservas recentes
 * Em um ambiente de produção, estes dados viriam de uma API ou banco de dados
 *
 * Estrutura de cada item:
 * - name: Nome completo do hóspede
 * - room: Número do quarto reservado
 * - date: Informação de check-in ou check-out
 * - status: Estado atual da reserva (Confirmada, Pendente, Hospedado)
 * - avatar: URL da imagem do hóspede
 * - initials: Iniciais do nome para fallback do avatar
 */
const recentBookings = [
  {
    name: "Ana Silva",
    room: "301",
    date: "Check-in: Hoje",
    status: "Confirmada",
    avatar: "/placeholder.svg",
    initials: "AS",
  },
  {
    name: "Miguel Santos",
    room: "205",
    date: "Check-in: Amanhã",
    status: "Pendente",
    avatar: "/placeholder.svg",
    initials: "MS",
  },
  {
    name: "Sofia Oliveira",
    room: "412",
    date: "Check-in: Hoje",
    status: "Confirmada",
    avatar: "/placeholder.svg",
    initials: "SO",
  },
  {
    name: "Daniel Costa",
    room: "118",
    date: "Check-out: Hoje",
    status: "Hospedado",
    avatar: "/placeholder.svg",
    initials: "DC",
  },
  {
    name: "Laura Pereira",
    room: "225",
    date: "Check-in: Amanhã",
    status: "Confirmada",
    avatar: "/placeholder.svg",
    initials: "LP",
  },
  {
    name: "Ricardo Ferreira",
    room: "307",
    date: "Check-out: Hoje",
    status: "Hospedado",
    avatar: "/placeholder.svg",
    initials: "RF",
  },
];
