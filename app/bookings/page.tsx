"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  FilterIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * Página de gerenciamento de reservas
 * Permite visualizar, criar e gerenciar todas as reservas do hotel
 */
export default function BookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState("upcoming");
  const [filteredBookings, setFilteredBookings] = useState(bookingData);

  // Função para filtrar reservas com base na pesquisa, filtro de status e aba atual
  useEffect(() => {
    let results = [...bookingData];

    // Filtrar por tipo de status (aba)
    if (currentTab !== "all") {
      if (currentTab === "upcoming") {
        results = results.filter(
          (booking) =>
            booking.status === "Confirmada" || booking.status === "Pendente"
        );
      } else if (currentTab === "current") {
        results = results.filter(
          (booking) => booking.status === "Check-in Feito"
        );
      } else if (currentTab === "past") {
        results = results.filter(
          (booking) => booking.status === "Check-out Feito"
        );
      } else if (currentTab === "cancelled") {
        results = results.filter((booking) => booking.status === "Cancelada");
      }
    }

    // Filtrar por status selecionado
    if (statusFilter !== "all") {
      const statusMap = {
        confirmed: "Confirmada",
        "checked-in": "Check-in Feito",
        "checked-out": "Check-out Feito",
        pending: "Pendente",
        cancelled: "Cancelada",
      };

      if (statusMap[statusFilter as keyof typeof statusMap]) {
        results = results.filter(
          (booking) =>
            booking.status === statusMap[statusFilter as keyof typeof statusMap]
        );
      }
    }

    // Filtrar por pesquisa (nome do hóspede, email, quarto)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (booking) =>
          booking.guestName.toLowerCase().includes(query) ||
          booking.guestEmail.toLowerCase().includes(query) ||
          booking.room.toLowerCase().includes(query) ||
          booking.roomType.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(results);
  }, [searchQuery, statusFilter, currentTab]);

  // Função para limpar filtros
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  // Função para atualizar os filtros manualmente
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  // Função para atualizar a aba atual
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Reservas & Hospedagens
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FilterIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <RefreshCwIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            Limpar Filtros
          </Button>
          <Button size="sm">
            <PlusIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            Nova Reserva
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Reservas
            </CardTitle>
            <CalendarIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground">Reservas ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Check-ins Hoje
            </CardTitle>
            <CheckIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 em relação a ontem
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Check-outs Hoje
            </CardTitle>
            <XIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              -3 em relação a ontem
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Confirmações Pendentes
            </CardTitle>
            <ClockIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Aguardando confirmação
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciar Reservas</CardTitle>
              <CardDescription>
                Visualize e gerencie todas as reservas do hotel
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-[250px]">
                <SearchIcon
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  placeholder="Buscar reservas..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setSearchQuery("")}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="checked-in">Check-in Feito</SelectItem>
                  <SelectItem value="checked-out">Check-out Feito</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="upcoming"
            className="space-y-4"
            onValueChange={handleTabChange}
          >
            <TabsList>
              <TabsTrigger value="upcoming">Próximas</TabsTrigger>
              <TabsTrigger value="current">Estadias Atuais</TabsTrigger>
              <TabsTrigger value="past">Reservas Passadas</TabsTrigger>
              <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
            </TabsList>

            {filteredBookings.length > 0 ? (
              <TabsContent value={currentTab} className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hóspede</TableHead>
                      <TableHead>Quarto</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <BookingRow key={booking.id} booking={booking} />
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="text-muted-foreground mb-4">
                  Nenhuma reserva encontrada com os filtros atuais.
                </div>
                <Button onClick={clearFilters}>
                  <RefreshCwIcon className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Componente que renderiza uma linha da tabela de reservas
 * @param booking - Dados da reserva a ser exibida
 */
function BookingRow({ booking }: { booking: Booking }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={booking.guestAvatar} alt={booking.guestName} />
            <AvatarFallback>{booking.guestInitials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{booking.guestName}</div>
            <div className="text-xs text-muted-foreground">
              {booking.guestEmail}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">Quarto {booking.room}</div>
        <div className="text-xs text-muted-foreground">{booking.roomType}</div>
      </TableCell>
      <TableCell>{booking.checkIn}</TableCell>
      <TableCell>{booking.checkOut}</TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={
            booking.status === "Confirmada"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
              : booking.status === "Check-in Feito"
              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
              : booking.status === "Check-out Feito"
              ? "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800"
              : booking.status === "Pendente"
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
          }
        >
          {booking.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="font-medium">{booking.paymentStatus}</div>
        <div className="text-xs text-muted-foreground">
          {booking.paymentMethod}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm">
            Visualizar
          </Button>
          <Button size="sm">Editar</Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

/**
 * Interface que define a estrutura de dados de uma reserva
 */
interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestAvatar?: string;
  guestInitials: string;
  room: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status:
    | "Confirmada"
    | "Check-in Feito"
    | "Check-out Feito"
    | "Pendente"
    | "Cancelada";
  paymentStatus: string;
  paymentMethod: string;
}

/**
 * Dados de exemplo para exibição na tabela de reservas
 */
const bookingData: Booking[] = [
  {
    id: "1",
    guestName: "Ana Silva",
    guestEmail: "ana.silva@email.com",
    guestInitials: "AS",
    room: "101",
    roomType: "Padrão",
    checkIn: "12/06/2023",
    checkOut: "15/06/2023",
    status: "Check-out Feito",
    paymentStatus: "Pago",
    paymentMethod: "Cartão de Crédito",
  },
  {
    id: "2",
    guestName: "Carlos Oliveira",
    guestEmail: "carlos.oliveira@email.com",
    guestInitials: "CO",
    room: "205",
    roomType: "Luxo",
    checkIn: "14/06/2023",
    checkOut: "20/06/2023",
    status: "Check-out Feito",
    paymentStatus: "Pago",
    paymentMethod: "Dinheiro",
  },
  {
    id: "3",
    guestName: "Juliana Santos",
    guestEmail: "juliana.santos@email.com",
    guestInitials: "JS",
    room: "302",
    roomType: "Suíte",
    checkIn: "18/06/2023",
    checkOut: "22/06/2023",
    status: "Check-out Feito",
    paymentStatus: "Pago",
    paymentMethod: "Cartão de Crédito",
  },
  {
    id: "4",
    guestName: "Marcos Pereira",
    guestEmail: "marcos.pereira@email.com",
    guestInitials: "MP",
    room: "107",
    roomType: "Padrão",
    checkIn: "21/06/2023",
    checkOut: "23/06/2023",
    status: "Check-out Feito",
    paymentStatus: "Pago",
    paymentMethod: "PIX",
  },
  {
    id: "5",
    guestName: "Fernanda Costa",
    guestEmail: "fernanda.costa@email.com",
    guestInitials: "FC",
    room: "208",
    roomType: "Luxo",
    checkIn: "15/06/2023",
    checkOut: "20/06/2023",
    status: "Check-in Feito",
    paymentStatus: "Pago",
    paymentMethod: "Cartão de Débito",
  },
  {
    id: "6",
    guestName: "Ricardo Almeida",
    guestEmail: "ricardo.almeida@email.com",
    guestInitials: "RA",
    room: "304",
    roomType: "Suíte",
    checkIn: "18/06/2023",
    checkOut: "25/06/2023",
    status: "Check-in Feito",
    paymentStatus: "Parcial",
    paymentMethod: "Cartão de Crédito",
  },
  {
    id: "7",
    guestName: "Patricia Lima",
    guestEmail: "patricia.lima@email.com",
    guestInitials: "PL",
    room: "102",
    roomType: "Padrão",
    checkIn: "22/06/2023",
    checkOut: "24/06/2023",
    status: "Confirmada",
    paymentStatus: "Depósito",
    paymentMethod: "Transferência",
  },
  {
    id: "8",
    guestName: "Gabriel Martins",
    guestEmail: "gabriel.martins@email.com",
    guestInitials: "GM",
    room: "201",
    roomType: "Luxo",
    checkIn: "23/06/2023",
    checkOut: "30/06/2023",
    status: "Confirmada",
    paymentStatus: "Não Pago",
    paymentMethod: "Pendente",
  },
  {
    id: "9",
    guestName: "Carolina Souza",
    guestEmail: "carolina.souza@email.com",
    guestInitials: "CS",
    room: "303",
    roomType: "Suíte",
    checkIn: "25/06/2023",
    checkOut: "02/07/2023",
    status: "Confirmada",
    paymentStatus: "Pago",
    paymentMethod: "PIX",
  },
  {
    id: "10",
    guestName: "Lucas Ferreira",
    guestEmail: "lucas.ferreira@email.com",
    guestInitials: "LF",
    room: "106",
    roomType: "Padrão",
    checkIn: "20/06/2023",
    checkOut: "22/06/2023",
    status: "Pendente",
    paymentStatus: "Não Pago",
    paymentMethod: "Pendente",
  },
  {
    id: "11",
    guestName: "Amanda Ribeiro",
    guestEmail: "amanda.ribeiro@email.com",
    guestInitials: "AR",
    room: "204",
    roomType: "Luxo",
    checkIn: "19/06/2023",
    checkOut: "26/06/2023",
    status: "Cancelada",
    paymentStatus: "Reembolsado",
    paymentMethod: "Cartão de Crédito",
  },
  {
    id: "12",
    guestName: "Paulo Moreira",
    guestEmail: "paulo.moreira@email.com",
    guestInitials: "PM",
    room: "301",
    roomType: "Suíte",
    checkIn: "24/06/2023",
    checkOut: "27/06/2023",
    status: "Cancelada",
    paymentStatus: "Reembolsado",
    paymentMethod: "PIX",
  },
];
