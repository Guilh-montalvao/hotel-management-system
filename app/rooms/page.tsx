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

/**
 * Página de gerenciamento de quartos
 * Permite visualizar, filtrar e gerenciar todos os quartos do hotel
 */
export default function RoomsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState("all");
  const [filteredRooms, setFilteredRooms] = useState(roomData);
  const [showAddRoomDialog, setShowAddRoomDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Função para filtrar quartos com base na pesquisa, filtro de status e aba atual
  useEffect(() => {
    let results = [...roomData];

    // Filtrar por tipo (aba)
    if (currentTab !== "all") {
      const typeMap = {
        solteiro: "Solteiro",
        casal: "Casal",
      };
      results = results.filter(
        (room) => room.type === typeMap[currentTab as keyof typeof typeMap]
      );
    }

    // Filtrar por status
    if (statusFilter !== "all") {
      const statusMap = {
        available: "Disponível",
        occupied: "Ocupado",
        maintenance: "Manutenção",
        cleaning: "Limpeza",
      };
      results = results.filter(
        (room) =>
          room.status === statusMap[statusFilter as keyof typeof statusMap]
      );
    }

    // Filtrar por pesquisa (número ou descrição)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (room) =>
          room.number.toLowerCase().includes(query) ||
          room.description.toLowerCase().includes(query)
      );
    }

    setFilteredRooms(results);
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

  // Função para adicionar um novo quarto
  const handleAddRoom = (data: any) => {
    // Criando um novo quarto com os dados do formulário
    const newRoom: Room = {
      number: data.number,
      type: data.type === "Solteiro" ? "Solteiro" : "Casal", // Mapeando tipos
      status: "Disponível", // Por padrão, novos quartos são disponíveis
      rate: data.type === "Solteiro" ? 100 : 150, // Definindo o preço com base no tipo
      description: data.description,
      image: data.image || "/placeholder.svg?height=200&width=300",
    };

    // Adicionando o novo quarto ao início da lista
    roomData.unshift(newRoom);

    // Atualizando a lista filtrada
    setFilteredRooms([...roomData]);
  };

  // Função para abrir o diálogo de detalhes do quarto
  const handleViewRoomDetails = (room: Room) => {
    setSelectedRoom(room);
    setShowDetailsDialog(true);
  };

  // Disponibilizando a função para o componente RoomCard
  useEffect(() => {
    window.roomDetailsHandler = handleViewRoomDetails;
    return () => {
      window.roomDetailsHandler = undefined;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Gerenciamento de Quartos
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FilterIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <RefreshCwIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            Atualizar
          </Button>
          <Button size="sm" onClick={() => setShowAddRoomDialog(true)}>
            <PlusIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            Adicionar Quarto
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <div className="text-2xl font-bold">120</div>
            <p className="text-xs text-muted-foreground">
              Todos os quartos do hotel
            </p>
          </CardContent>
        </Card>
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
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Prontos para reserva
            </p>
          </CardContent>
        </Card>
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
            <div className="text-2xl font-bold">86</div>
            <p className="text-xs text-muted-foreground">Atualmente em uso</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenção</CardTitle>
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
            >
              Manutenção
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-xs text-muted-foreground">Em reparo</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Status dos Quartos</CardTitle>
                <CardDescription>
                  Gerencie e atualize o status dos quartos
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
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="occupied">Ocupado</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="cleaning">Limpeza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="all"
              className="space-y-4"
              onValueChange={handleTabChange}
            >
              <TabsList>
                <TabsTrigger value="all">Todos os Quartos</TabsTrigger>
                <TabsTrigger value="solteiro">Solteiro</TabsTrigger>
                <TabsTrigger value="casal">Casal</TabsTrigger>
              </TabsList>

              {filteredRooms.length > 0 ? (
                <TabsContent value={currentTab} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRooms.map((room) => (
                      <RoomCard
                        key={room.number}
                        room={room}
                        onViewDetails={handleViewRoomDetails}
                      />
                    ))}
                  </div>
                </TabsContent>
              ) : (
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

      {/* Dialog para adicionar novo quarto */}
      <AddRoomDialog
        open={showAddRoomDialog}
        onOpenChange={setShowAddRoomDialog}
        onAddRoom={handleAddRoom}
      />

      {/* Dialog para exibir detalhes do quarto */}
      <RoomDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        room={selectedRoom}
      />
    </div>
  );
}

/**
 * Componente para exibir o cartão de um quarto
 * @param room - Dados do quarto a ser exibido
 * @param onViewDetails - Função chamada quando o botão "Ver Detalhes" é clicado
 */
function RoomCard({
  room,
  onViewDetails,
}: {
  room: Room;
  onViewDetails: (room: Room) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative bg-muted">
        <img
          src={room.image || "/placeholder.svg?height=200&width=300"}
          alt={`Quarto ${room.number}`}
          className="object-cover w-full h-full"
        />
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
      <CardHeader className="p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Quarto {room.number}</CardTitle>
          <Badge variant="outline">{room.type}</Badge>
        </div>
        <CardDescription>{room.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">R${room.rate}</span> / noite
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <WrenchIcon className="h-4 w-4 mr-1" aria-hidden="true" />
              Gerenciar
            </Button>
            <Button size="sm" onClick={() => onViewDetails(room)}>
              Ver Detalhes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Interface que define a estrutura de dados de um quarto
 */
interface Room {
  number: string;
  type: "Solteiro" | "Casal";
  status: "Disponível" | "Ocupado" | "Manutenção";
  rate: number;
  description: string;
  image?: string;
}

/**
 * Dados de exemplo de quartos para exibição na interface
 */
const roomData: Room[] = [
  {
    number: "101",
    type: "Solteiro",
    status: "Disponível",
    rate: 100,
    description: "Cama de solteiro, vista para cidade, 20m²",
  },
  {
    number: "102",
    type: "Solteiro",
    status: "Ocupado",
    rate: 100,
    description: "Cama de solteiro, vista para jardim, 20m²",
  },
  {
    number: "201",
    type: "Casal",
    status: "Ocupado",
    rate: 150,
    description: "Cama de casal, vista para cidade, 30m²",
  },
  {
    number: "202",
    type: "Casal",
    status: "Manutenção",
    rate: 150,
    description: "Cama de casal, vista para o mar, 30m²",
  },
  {
    number: "301",
    type: "Casal",
    status: "Disponível",
    rate: 150,
    description: "Cama de casal, vista panorâmica, 35m²",
  },
  {
    number: "302",
    type: "Solteiro",
    status: "Disponível",
    rate: 100,
    description: "Duas camas de solteiro, varanda, 25m²",
  },
  {
    number: "303",
    type: "Casal",
    status: "Ocupado",
    rate: 150,
    description: "Cama de casal king size, terraço, 40m²",
  },
  {
    number: "401",
    type: "Solteiro",
    status: "Disponível",
    rate: 100,
    description: "Duas camas de solteiro, vista para cidade, 25m²",
  },
  {
    number: "402",
    type: "Casal",
    status: "Ocupado",
    rate: 150,
    description: "Cama king, hidromassagem, 35m²",
  },
];

// Hack para permitir que o RoomCard acesse a função handleViewRoomDetails
declare global {
  interface Window {
    roomDetailsHandler?: (room: Room) => void;
  }
}
