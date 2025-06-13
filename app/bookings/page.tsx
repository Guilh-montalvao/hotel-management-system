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
  FileTextIcon,
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
import { AddBookingDialog } from "@/components/bookings/add-booking-dialog";
import { BookingDetailsDialog } from "@/components/bookings/booking-details-dialog";
import { useSupabase } from "@/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import { bookingService } from "@/lib/services/booking-service";
import { format } from "date-fns";
import { toast } from "sonner";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PDFService } from "@/lib/services/pdf-service";

/**
 * Página de gerenciamento de reservas
 * Permite visualizar, criar e gerenciar todas as reservas do hotel
 */
export default function BookingsPage() {
  // Usar o supabase diretamente para evitar problemas de tipo
  const [bookingData, setBookingData] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState("upcoming");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAddBookingDialog, setShowAddBookingDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Hook de paginação
  const pagination = usePagination({
    data: filteredBookings,
    itemsPerPage: itemsPerPage,
  });

  // Estatísticas das reservas
  const [bookingStats, setBookingStats] = useState({
    totalBookings: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
    cancelledBookings: 0,
    checkInsDiff: 0,
    checkOutsDiff: 0,
  });

  // Função para adicionar uma reserva ao banco de dados
  const addBookingToDb = async (booking: any) => {
    try {
      // Verificar se todos os campos obrigatórios estão presentes
      if (
        !booking.guest_id ||
        !booking.room_id ||
        !booking.check_in ||
        !booking.check_out
      ) {
        console.error("Campos obrigatórios faltando:", booking);
        toast.error("Erro: campos obrigatórios faltando na reserva");
        return null;
      }

      // Certificar-se de que o status e payment_status estão definidos
      const bookingData = {
        ...booking,
        status: booking.status || "Reservado",
        payment_status: booking.payment_status || "Pendente",
        updated_at: new Date().toISOString(),
      };

      // Fazer a inserção no Supabase
      const { data, error } = await supabase
        .from("bookings")
        .insert([bookingData])
        .select()
        .single();

      if (error) {
        console.error("Erro ao adicionar reserva:", error);
        toast.error(
          `Erro ao adicionar reserva: ${error.message || "Erro desconhecido"}`
        );
        return null;
      }

      // Também atualizar o status do hóspede
      const { error: guestError } = await supabase
        .from("guests")
        .update({ status: "Reservado", updated_at: new Date().toISOString() })
        .eq("id", booking.guest_id);

      if (guestError) {
        console.error("Erro ao atualizar status do hóspede:", guestError);
        // Continuar mesmo com erro, já que a reserva foi criada
      }

      return data;
    } catch (exception) {
      console.error("Exceção ao adicionar reserva:", exception);
      toast.error("Erro inesperado ao adicionar reserva");
      return null;
    }
  };

  // Função para carregar dados do Supabase
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Buscar todas as reservas com dados dos hóspedes e quartos
        const { data: bookingsData, error } = await supabase
          .from("bookings")
          .select("*, guests(*), rooms(*)")
          .order("check_in", { ascending: true });

        if (error) {
          console.error("Erro ao buscar reservas:", error);
          return;
        }

        // Converter dados do banco para o formato UI
        const bookings = bookingsData.map(convertDbBookingToUIBooking);
        setBookingData(bookings);

        // Calcular estatísticas
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split("T")[0];

        // Total de reservas ativas
        const activeBookings = bookingsData.filter((b: any) =>
          ["Reservado", "Check-in Feito"].includes(b.status)
        ).length;

        // Check-ins hoje
        const todayCheckIns = bookingsData.filter(
          (b: any) => b.check_in === today
        ).length;
        const yesterdayCheckIns = bookingsData.filter(
          (b: any) => b.check_in === yesterday
        ).length;
        const checkInsDiff = todayCheckIns - yesterdayCheckIns;

        // Check-outs hoje
        const todayCheckOuts = bookingsData.filter(
          (b: any) => b.check_out === today
        ).length;
        const yesterdayCheckOuts = bookingsData.filter(
          (b: any) => b.check_out === yesterday
        ).length;
        const checkOutsDiff = todayCheckOuts - yesterdayCheckOuts;

        // Reservas canceladas
        const cancelledBookings = bookingsData.filter(
          (b: any) => b.status === "Cancelada"
        ).length;

        setBookingStats({
          totalBookings: activeBookings,
          checkInsToday: todayCheckIns,
          checkOutsToday: todayCheckOuts,
          cancelledBookings,
          checkInsDiff,
          checkOutsDiff,
        });
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchBookings();
  }, []);

  // Função para converter booking do banco para o formato UI
  const convertDbBookingToUIBooking = (dbBooking: any): Booking => {
    return {
      id: dbBooking.id,
      guestName: dbBooking.guests?.name || "Hóspede não encontrado",
      guestEmail: dbBooking.guests?.email || "Email não disponível",
      guestInitials: getInitials(dbBooking.guests?.name || ""),
      room: dbBooking.rooms?.number || "Quarto não encontrado",
      roomType: dbBooking.rooms?.type || "Tipo não disponível",
      checkIn: format(new Date(dbBooking.check_in), "dd/MM/yyyy"),
      checkOut: format(new Date(dbBooking.check_out), "dd/MM/yyyy"),
      status: dbBooking.status || "Pendente",
      paymentStatus: dbBooking.payment_status || "Pendente",
      paymentMethod: dbBooking.payment_method || "Não informado",
    };
  };

  // Função para converter booking UI para o formato do banco
  const convertUIBookingToDbBooking = (
    uiBooking: any,
    guestId: string,
    roomId: string
  ): any => {
    return {
      guest_id: guestId,
      room_id: roomId,
      check_in: new Date(uiBooking.checkIn).toISOString(),
      check_out: new Date(uiBooking.checkOut).toISOString(),
      status: uiBooking.status,
      payment_status: uiBooking.paymentStatus,
      payment_method: uiBooking.paymentMethod,
    };
  };

  // Função para obter iniciais do nome
  const getInitials = (name: string): string => {
    const nameParts = name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName =
      nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  // Função para filtrar reservas com base na pesquisa, filtro de status e aba atual
  useEffect(() => {
    let results = [...bookingData];

    // Filtrar por tipo de status (aba)
    if (currentTab !== "all") {
      if (currentTab === "upcoming") {
        results = results.filter((booking) => booking.status === "Reservado");
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
        confirmed: "Reservado",
        "checked-in": "Check-in Feito",
        "checked-out": "Check-out Feito",
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
  }, [searchQuery, statusFilter, currentTab, bookingData]);

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

  // Função para adicionar uma nova reserva
  const handleAddBooking = async (data: any) => {
    try {
      console.log("Dados completos recebidos do diálogo:", data);

      // Se recebemos o objeto combinado com originalDbData
      if (data.originalDbData) {
        // Usar diretamente os dados já formatados para o banco
        const dbBooking = data.originalDbData;
        console.log("Dados formatados para o banco:", dbBooking);

        // Verificar campos críticos
        if (
          !dbBooking.guest_id ||
          !dbBooking.room_id ||
          !dbBooking.check_in ||
          !dbBooking.check_out
        ) {
          console.error("Campos obrigatórios faltando:", {
            guest_id: dbBooking.guest_id,
            room_id: dbBooking.room_id,
            check_in: dbBooking.check_in,
            check_out: dbBooking.check_out,
          });
          toast.error("Erro: Campos obrigatórios faltando na reserva");
          return;
        }

        // Adicionar ao banco de dados
        const newDbBooking = await addBookingToDb(dbBooking);

        if (newDbBooking) {
          // Buscar detalhes completos da reserva
          const bookingWithDetails = {
            ...newDbBooking,
            guests: {
              name: data.guestName,
              email: data.guestEmail,
            },
            rooms: {
              number: data.room,
              type: data.roomType,
            },
          };

          // Converter para formato UI
          const newBooking = convertDbBookingToUIBooking(bookingWithDetails);

          // Atualizar o estado local
          setBookingData((prev) => [newBooking, ...prev]);

          toast.success("Reserva adicionada com sucesso!");
        } else {
          toast.error("Falha ao adicionar reserva ao banco de dados");
        }
      } else {
        // Código anterior para compatibilidade
        // Converter para formato do banco de dados
        const dbBooking = {
          guest_id: data.guestId,
          room_id: data.roomId,
          check_in: new Date(data.checkIn).toISOString().split("T")[0],
          check_out: new Date(data.checkOut).toISOString().split("T")[0],
          status: data.status || "Reservado",
          payment_status: data.paymentStatus || "Pendente",
          payment_method: data.paymentMethod || "Dinheiro",
        };

        console.log("Dados antigos formatados para o banco:", dbBooking);

        // Verificar campos críticos
        if (!dbBooking.guest_id || !dbBooking.room_id) {
          console.error("Campos obrigatórios faltando no formato antigo:", {
            guest_id: dbBooking.guest_id,
            room_id: dbBooking.room_id,
          });
          toast.error("Erro: ID do hóspede ou do quarto faltando");
          return;
        }

        // Adicionar ao banco de dados
        const newDbBooking = await addBookingToDb(dbBooking);

        if (newDbBooking) {
          // Buscar detalhes completos da reserva
          const bookingWithDetails = {
            ...newDbBooking,
            guests: { name: data.guestName, email: data.guestEmail },
            rooms: { number: data.room, type: data.roomType },
          };

          // Converter para formato UI
          const newBooking = convertDbBookingToUIBooking(bookingWithDetails);

          // Atualizar o estado local
          setBookingData((prev) => [newBooking, ...prev]);

          toast.success("Reserva adicionada com sucesso!");
        } else {
          toast.error("Falha ao adicionar reserva ao banco de dados");
        }
      }
    } catch (error) {
      console.error("Erro ao adicionar reserva:", error);
      toast.error(
        `Erro ao adicionar reserva: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  };

  // Função para visualizar detalhes de uma reserva
  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsDialog(true);
  };

  // Função para fazer check-in
  const handleCheckIn = async (bookingId: string) => {
    try {
      const success = await bookingService.checkIn(bookingId);
      if (success) {
        // Recarregar dados
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("*, guests(*), rooms(*)")
          .order("check_in", { ascending: true });

        if (bookingsData) {
          const bookings = bookingsData.map(convertDbBookingToUIBooking);
          setBookingData(bookings);
        }

        toast.success("Check-in realizado com sucesso!");
        setShowDetailsDialog(false);
      } else {
        toast.error("Erro ao realizar check-in");
      }
    } catch (error) {
      console.error("Erro ao fazer check-in:", error);
      toast.error("Erro inesperado ao realizar check-in");
    }
  };

  // Função para fazer check-out
  const handleCheckOut = async (bookingId: string) => {
    try {
      const success = await bookingService.checkOut(bookingId);
      if (success) {
        // Recarregar dados
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("*, guests(*), rooms(*)")
          .order("check_in", { ascending: true });

        if (bookingsData) {
          const bookings = bookingsData.map(convertDbBookingToUIBooking);
          setBookingData(bookings);
        }

        toast.success("Check-out realizado com sucesso!");
        setShowDetailsDialog(false);
      } else {
        toast.error("Erro ao realizar check-out");
      }
    } catch (error) {
      console.error("Erro ao fazer check-out:", error);
      toast.error("Erro inesperado ao realizar check-out");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Reservas & Hospedagens
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <RefreshCwIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            Limpar Filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                // Buscar dados atualizados do banco
                const { data: bookingsData, error } = await supabase
                  .from("bookings")
                  .select("*, guests(*), rooms(*)")
                  .order("check_in", { ascending: false });

                if (error) {
                  toast.error("Erro ao buscar dados para o relatório");
                  return;
                }

                if (bookingsData && bookingsData.length > 0) {
                  PDFService.generateBookingsReport(bookingsData);
                  toast.success(
                    "Relatório PDF de reservas gerado com sucesso!"
                  );
                } else {
                  toast.error(
                    "Nenhuma reserva encontrada para gerar relatório"
                  );
                }
              } catch (error) {
                console.error("Erro ao gerar relatório:", error);
                toast.error("Erro ao gerar relatório");
              }
            }}
          >
            <FileTextIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            Gerar PDF
          </Button>
          <Button size="sm" onClick={() => setShowAddBookingDialog(true)}>
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
            <div className="text-2xl font-bold">
              {bookingStats.totalBookings}
            </div>
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
            <div className="text-2xl font-bold">
              {bookingStats.checkInsToday}
            </div>
            <p className="text-xs text-muted-foreground">
              {bookingStats.checkInsDiff > 0 ? "+" : ""}
              {bookingStats.checkInsDiff} em relação a ontem
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
            <div className="text-2xl font-bold">
              {bookingStats.checkOutsToday}
            </div>
            <p className="text-xs text-muted-foreground">
              {bookingStats.checkOutsDiff > 0 ? "+" : ""}
              {bookingStats.checkOutsDiff} em relação a ontem
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reservas Canceladas
            </CardTitle>
            <XIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookingStats.cancelledBookings}
            </div>
            <p className="text-xs text-muted-foreground">Reservas canceladas</p>
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
                  <SelectItem value="confirmed">Reservado</SelectItem>
                  <SelectItem value="checked-in">Check-in Feito</SelectItem>
                  <SelectItem value="checked-out">Check-out Feito</SelectItem>
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

            {pagination.totalItems > 0 ? (
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
                    {pagination.paginatedData.map((booking) => (
                      <BookingRow
                        key={booking.id}
                        booking={booking}
                        onView={handleViewBooking}
                      />
                    ))}
                  </TableBody>
                </Table>

                {/* Controles de paginação */}
                {pagination.totalPages > 1 && (
                  <div className="mt-4">
                    <PaginationControls
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={pagination.goToPage}
                      canGoNext={pagination.canGoNext}
                      canGoPrevious={pagination.canGoPrevious}
                      startIndex={pagination.startIndex}
                      endIndex={pagination.endIndex}
                      totalItems={pagination.totalItems}
                      itemsPerPage={itemsPerPage}
                      onItemsPerPageChange={setItemsPerPage}
                    />
                  </div>
                )}
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

      {/* Diálogo para adicionar nova reserva */}
      <AddBookingDialog
        open={showAddBookingDialog}
        onOpenChange={setShowAddBookingDialog}
        onAddBooking={handleAddBooking}
      />

      {/* Diálogo para visualizar detalhes da reserva */}
      {selectedBooking && (
        <BookingDetailsDialog
          booking={selectedBooking}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />
      )}
    </div>
  );
}

/**
 * Componente que renderiza uma linha da tabela de reservas
 * @param booking - Dados da reserva a ser exibida
 * @param onView - Função para visualizar os detalhes da reserva
 */
function BookingRow({
  booking,
  onView,
}: {
  booking: Booking;
  onView: (booking: Booking) => void;
}) {
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
            booking.status === "Reservado"
              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
              : booking.status === "Check-in Feito"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
              : booking.status === "Check-out Feito"
              ? "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800"
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
          <Button variant="outline" size="sm" onClick={() => onView(booking)}>
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
    | "Reservado"
    | "Check-in Feito"
    | "Check-out Feito"
    | "Pendente"
    | "Cancelada";
  paymentStatus: string;
  paymentMethod: string;
}
