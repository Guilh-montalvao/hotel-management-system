"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BedDoubleIcon,
  FilterIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  WrenchIcon,
  XIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddRoomDialog } from "@/components/rooms/add-room-dialog";
import { RoomDetailsDialog } from "@/components/rooms/room-details-dialog";
import { useBookingStore } from "@/lib/store";
import { Room } from "@/lib/types";
import { useRooms } from "@/hooks/useRooms";
import { useRoomFilters } from "@/hooks/useRoomFilters";

/**
 * Página de gerenciamento de quartos
 *
 * Esta página permite ao usuário:
 * - Visualizar todos os quartos do hotel
 * - Filtrar quartos por tipo, status ou texto de busca
 * - Ver estatísticas sobre ocupação dos quartos
 * - Adicionar novos quartos
 * - Visualizar detalhes de um quarto específico
 * - Excluir quartos existentes
 * - Iniciar o processo de reserva de um quarto
 */
export default function RoomsPage() {
  /**
   * Hooks personalizados para separar a lógica da interface
   * useRooms: gerencia operações relacionadas aos quartos (busca, adição, exclusão)
   * useRoomFilters: gerencia a filtragem e estatísticas dos quartos
   */
  const {
    rooms, // Lista completa de quartos
    isLoading, // Estado de carregamento da lista
    error, // Erro, se houver
    addRoom: addRoomToDb, // Função para adicionar quarto
    deleteRoom: deleteRoomFromDb, // Função para excluir quarto
  } = useRooms();

  const {
    searchQuery, // Texto atual da pesquisa
    setSearchQuery, // Função para atualizar pesquisa
    statusFilter, // Filtro atual de status
    setStatusFilter, // Função para atualizar filtro de status
    typeFilter, // Filtro atual de tipo
    setTypeFilter, // Função para atualizar filtro de tipo
    clearFilters, // Função para limpar todos os filtros
    filteredRooms, // Lista de quartos após aplicação dos filtros
    statistics, // Estatísticas calculadas (total, disponíveis, etc.)
  } = useRoomFilters(rooms);

  /**
   * Estados locais para controlar os diálogos e quarto selecionado
   */
  // Estado para controlar a visibilidade do diálogo de adicionar quarto
  const [showAddRoomDialog, setShowAddRoomDialog] = useState(false);
  // Estado para controlar a visibilidade do diálogo de detalhes
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  // Estado para armazenar o quarto selecionado para visualização de detalhes
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  /**
   * Manipulador para adicionar um novo quarto
   * @param data Dados do formulário de criação de quarto
   */
  const handleAddRoom = async (data: any) => {
    // Construindo o objeto do quarto com os dados do formulário
    const newRoom = {
      number: data.number,
      type: data.type as "Solteiro" | "Casal",
      status: "Disponível" as const, // Quartos novos sempre começam disponíveis
      rate: parseFloat(data.rate), // Convertendo string para número
      description: data.description,
      image_url: data.image_url || null, // Usando null se não houver imagem
    };

    // Chamando a função do hook para persistir no banco de dados
    const result = await addRoomToDb(newRoom);
    // Verificando se houve erro na operação
    if (!result.success) {
      console.error("Erro ao adicionar quarto:", result.error);
    }
  };

  /**
   * Manipulador para visualizar detalhes de um quarto
   * @param room Quarto a ser visualizado
   */
  const handleViewRoomDetails = (room: Room) => {
    // Armazena o quarto selecionado no estado
    setSelectedRoom(room);
    // Abre o diálogo de detalhes
    setShowDetailsDialog(true);
  };

  /**
   * Manipulador para excluir um quarto
   * @param id ID do quarto a ser excluído
   */
  const handleDeleteRoom = async (id: string) => {
    // Chamando a função do hook para persistir a exclusão
    const result = await deleteRoomFromDb(id);
    // Verificando se houve erro na operação
    if (!result.success) {
      console.error("Erro ao excluir quarto:", result.error);
    }
  };

  /**
   * Manipulador para mudança de aba (tipo de quarto)
   * @param value Valor da aba selecionada
   */
  const handleTabChange = (value: string) => {
    // Atualiza o filtro de tipo com base na aba selecionada
    setTypeFilter(value as any);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho da página com título e botões de ação */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Gerenciamento de Quartos
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FilterIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            Filtrar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCwIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            Atualizar
          </Button>
          <Button size="sm" onClick={() => setShowAddRoomDialog(true)}>
            <PlusIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            Adicionar Quarto
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas - exibem números de quartos por status */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        {/* Card de total de quartos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Quartos
            </CardTitle>
            <BedDoubleIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">
              Todos os quartos do hotel
            </p>
          </CardContent>
        </Card>

        {/* Card de quartos disponíveis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
            >
              Disponível
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.available}</div>
            <p className="text-xs text-muted-foreground">
              Prontos para reserva
            </p>
          </CardContent>
        </Card>

        {/* Card de quartos ocupados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupados</CardTitle>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
            >
              Ocupado
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.occupied}</div>
            <p className="text-xs text-muted-foreground">Atualmente em uso</p>
          </CardContent>
        </Card>

        {/* Card de quartos em limpeza */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Limpeza</CardTitle>
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
            >
              Limpeza
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.cleaning}</div>
            <p className="text-xs text-muted-foreground">Em limpeza</p>
          </CardContent>
        </Card>
      </div>

      {/* Card principal com a lista de quartos e filtros */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              {/* Título e descrição */}
              <div>
                <CardTitle>Status dos Quartos</CardTitle>
                <CardDescription>
                  Gerencie e atualize o status dos quartos
                </CardDescription>
              </div>

              {/* Controles de filtro - campo de busca e seletor de status */}
              <div className="flex items-center gap-2">
                {/* Campo de busca com ícone e botão para limpar */}
                <div className="relative w-[250px]">
                  <SearchIcon
                    className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    type="search"
                    placeholder="Buscar quartos..."
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

                {/* Seletor de filtro por status */}
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as any)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="occupied">Ocupado</SelectItem>
                    <SelectItem value="cleaning">Limpeza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Tabs para filtrar por tipo de quarto */}
            <Tabs
              defaultValue="all"
              className="space-y-4"
              onValueChange={handleTabChange}
              value={typeFilter}
            >
              <TabsList>
                <TabsTrigger value="all">Todos os Quartos</TabsTrigger>
                <TabsTrigger value="solteiro">Solteiro</TabsTrigger>
                <TabsTrigger value="casal">Casal</TabsTrigger>
              </TabsList>

              {/* Exibição condicional baseada no estado de carregamento e resultados */}
              {isLoading ? (
                // Estado de carregamento
                <div className="flex items-center justify-center p-8">
                  <div className="text-muted-foreground">
                    Carregando quartos...
                  </div>
                </div>
              ) : filteredRooms.length > 0 ? (
                // Lista de quartos filtrados
                <TabsContent value={typeFilter} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredRooms.map((room) => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        onViewDetails={handleViewRoomDetails}
                      />
                    ))}
                  </div>
                </TabsContent>
              ) : (
                // Mensagem de nenhum resultado encontrado
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="text-muted-foreground mb-4">
                    Nenhum quarto encontrado com os filtros atuais.
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

      {/* Diálogo para adicionar novo quarto - exibido quando showAddRoomDialog é true */}
      <AddRoomDialog
        open={showAddRoomDialog}
        onOpenChange={setShowAddRoomDialog}
        onAddRoom={handleAddRoom}
      />

      {/* Diálogo para exibir detalhes do quarto - exibido quando showDetailsDialog é true */}
      <RoomDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        room={selectedRoom}
        onDeleteRoom={
          selectedRoom
            ? handleDeleteRoom.bind(null, selectedRoom.id)
            : undefined
        }
      />
    </div>
  );
}

/**
 * Componente RoomCard - Exibe um cartão com informações de um quarto individual
 *
 * Este componente é responsável por:
 * - Mostrar detalhes visuais do quarto (imagem, número, tipo)
 * - Exibir o status atual com código de cores apropriado
 * - Permitir visualizar detalhes completos do quarto
 * - Iniciar o processo de reserva (se o quarto estiver disponível)
 *
 * @param room Objeto contendo os dados do quarto a ser exibido
 * @param onViewDetails Função de callback chamada quando o usuário clica em "Ver Detalhes"
 */
function RoomCard({
  room,
  onViewDetails,
}: {
  room: Room;
  onViewDetails: (room: Room) => void;
}) {
  const router = useRouter();
  // Obtém funções do store global para o processo de reserva
  const { setSelectedRoom, setShouldOpenBookingDialog } = useBookingStore();

  /**
   * Manipulador para o clique no botão de reserva
   * Inicia o fluxo de reserva armazenando dados no store e redirecionando
   */
  const handleReserveClick = () => {
    // Armazena o quarto selecionado no store global
    setSelectedRoom(room);
    // Indica que o diálogo de reserva deve ser aberto
    setShouldOpenBookingDialog(true);
    // Redireciona para a página de reservas
    router.push("/bookings");
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      {/* Área de imagem do quarto com badge de status */}
      <div className="aspect-video relative bg-muted h-[180px] w-full">
        <img
          src={
            room.image_url ||
            "https://placehold.co/600x400/e2e8f0/1e293b?text=Quarto+" +
              room.number
          }
          alt={`Quarto ${room.number}`}
          className="object-cover w-full h-full"
          style={{ objectFit: "cover" }}
        />
        {/* Badge de status com cores condicionais baseadas no status */}
        <Badge
          className={`absolute top-2 right-2 ${
            room.status === "Disponível"
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300"
              : room.status === "Ocupado"
              ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
              : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300"
          }`}
        >
          {room.status}
        </Badge>
      </div>

      {/* Cabeçalho do cartão com número e tipo de quarto */}
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Quarto {room.number}</CardTitle>
          <Badge variant="outline">{room.type}</Badge>
        </div>
        <CardDescription>{room.description}</CardDescription>
      </CardHeader>

      {/* Rodapé do cartão com preço e botões de ação */}
      <CardContent className="p-4 pt-0 mt-auto">
        <div className="text-lg font-semibold mb-2">R${room.rate}/noite</div>
        <div className="flex gap-2">
          {/* Botão para ver detalhes */}
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onViewDetails(room)}
          >
            Ver Detalhes
          </Button>

          {/* Botão para reservar - desabilitado se o quarto não estiver disponível */}
          <Button
            variant={room.status === "Disponível" ? "default" : "outline"}
            disabled={room.status !== "Disponível"}
            className="flex-1"
            onClick={handleReserveClick}
          >
            Reservar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
