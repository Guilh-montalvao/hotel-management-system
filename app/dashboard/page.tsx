"use client";

import { useState } from "react";
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

/**
 * Página principal do painel de controle
 * Exibe informações resumidas e estatísticas importantes para gerenciamento do hotel
 */
export default function DashboardPage() {
  const [showAddBookingDialog, setShowAddBookingDialog] = useState(false);
  const [showAddGuestDialog, setShowAddGuestDialog] = useState(false);

  // Função para adicionar uma nova reserva
  const handleAddBooking = (data: any) => {
    // Aqui poderíamos implementar a lógica para salvar a reserva
    console.log("Nova reserva criada:", data);
    // Normalmente redirecionaríamos para a página de reservas
    // ou atualizaríamos o estado local
  };

  // Função para adicionar um novo hóspede
  const handleAddGuest = (data: any) => {
    // Aqui poderíamos implementar a lógica para salvar o hóspede
    console.log("Novo hóspede cadastrado:", data);
    // Normalmente redirecionaríamos para a página de hóspedes
    // ou atualizaríamos o estado local
  };

  return (
    <div className="flex flex-col gap-4">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSignIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$45.231,89</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpIcon
                className="mr-1 h-4 w-4 text-emerald-500"
                aria-hidden="true"
              />
              +20,1% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
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
            <div className="text-2xl font-bold">84,3%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpIcon
                className="mr-1 h-4 w-4 text-emerald-500"
                aria-hidden="true"
              />
              +4,3% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
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
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              De um total de 120 quartos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novas Reservas
            </CardTitle>
            <CalendarIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowDownIcon
                className="mr-1 h-4 w-4 text-red-500"
                aria-hidden="true"
              />
              -8% em relação a ontem
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Abas para diferentes visualizações do painel */}
      <Tabs defaultValue="visao-geral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="analises">Análises</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>
        <TabsContent value="visao-geral" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Taxa de Ocupação</CardTitle>
                <CardDescription>
                  Ocupação de quartos nos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <OccupancyChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Receita</CardTitle>
                <CardDescription>
                  Detalhamento mensal de receita
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Reservas Recentes</CardTitle>
                <CardDescription>
                  Você tem 6 novas reservas hoje
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.name}
                      className="flex items-center justify-between space-x-4"
                    >
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
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Tarefas e operações comuns</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setShowAddBookingDialog(true)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Nova Reserva
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setShowAddGuestDialog(true)}
                >
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Adicionar Hóspede
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BedDoubleIcon className="mr-2 h-4 w-4" />
                  Status do Quarto
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CreditCardIcon className="mr-2 h-4 w-4" />
                  Processar Pagamento
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analises" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo de Análises</CardTitle>
              <CardDescription>
                Análises detalhadas serão exibidas aqui
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">
                  Gráficos e dados de análise serão exibidos aqui
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="relatorios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo de Relatórios</CardTitle>
              <CardDescription>
                Relatórios gerados serão exibidos aqui
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">
                  Dados de relatórios e exportações serão exibidos aqui
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para adicionar nova reserva */}
      <AddBookingDialog
        open={showAddBookingDialog}
        onOpenChange={setShowAddBookingDialog}
        onAddBooking={handleAddBooking}
      />

      {/* Diálogo para adicionar novo hóspede */}
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
