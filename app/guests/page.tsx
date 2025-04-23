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
import {
  FilterIcon,
  PlusIcon,
  SearchIcon,
  UserIcon,
  UsersIcon,
  XIcon,
  RefreshCwIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Página de gerenciamento de hóspedes
 * Permite visualizar e gerenciar informações de todos os hóspedes do hotel
 */
export default function GuestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState("all");
  const [filteredGuests, setFilteredGuests] = useState(guestData);

  // Função para filtrar hóspedes com base na pesquisa, filtro de status e aba atual
  useEffect(() => {
    let results = [...guestData];

    // Filtrar por tipo de status (aba)
    if (currentTab !== "all") {
      const statusMap = {
        current: "Atual",
        recent: "Recente",
      };

      if (statusMap[currentTab as keyof typeof statusMap]) {
        results = results.filter(
          (guest) =>
            guest.status === statusMap[currentTab as keyof typeof statusMap]
        );
      }
    }

    // Filtrar por status selecionado
    if (statusFilter !== "all") {
      const statusMap = {
        current: "Atual",
        past: "Anterior",
      };

      if (statusMap[statusFilter as keyof typeof statusMap]) {
        results = results.filter(
          (guest) =>
            guest.status === statusMap[statusFilter as keyof typeof statusMap]
        );
      }
    }

    // Filtrar por pesquisa (nome, email, telefone, nacionalidade)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (guest) =>
          guest.name.toLowerCase().includes(query) ||
          guest.email.toLowerCase().includes(query) ||
          guest.phone.toLowerCase().includes(query) ||
          guest.nationality.toLowerCase().includes(query)
      );
    }

    setFilteredGuests(results);
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
          Gerenciamento de Hóspedes
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
            Adicionar Hóspede
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Hóspedes
            </CardTitle>
            <UsersIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.248</div>
            <p className="text-xs text-muted-foreground">
              Todos os hóspedes registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hóspedes Atuais
            </CardTitle>
            <UserIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86</div>
            <p className="text-xs text-muted-foreground">
              Atualmente hospedados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novos Registros
            </CardTitle>
            <PlusIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Diretório de Hóspedes</CardTitle>
              <CardDescription>
                Visualize e gerencie perfis de hóspedes
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
                  placeholder="Buscar hóspedes..."
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
                  <SelectItem value="all">Todos os Hóspedes</SelectItem>
                  <SelectItem value="current">Hóspedes Atuais</SelectItem>
                  <SelectItem value="past">Hóspedes Anteriores</SelectItem>
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
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="current">Atuais</TabsTrigger>
              <TabsTrigger value="recent">Recentes</TabsTrigger>
            </TabsList>

            {filteredGuests.length > 0 ? (
              <TabsContent value={currentTab} className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hóspede</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Última Estadia</TableHead>
                      <TableHead>Total de Estadias</TableHead>
                      <TableHead>Preferências</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGuests.map((guest) => (
                      <GuestRow key={guest.id} guest={guest} />
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="text-muted-foreground mb-4">
                  Nenhum hóspede encontrado com os filtros atuais.
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
 * Componente que renderiza uma linha da tabela de hóspedes
 * @param guest - Dados do hóspede a ser exibido
 */
function GuestRow({ guest }: { guest: Guest }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={guest.avatar} alt={guest.name} />
            <AvatarFallback>{guest.initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium flex items-center gap-1">
              {guest.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {guest.nationality}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{guest.email}</div>
        <div className="text-xs text-muted-foreground">{guest.phone}</div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={
            guest.status === "Atual"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
              : guest.status === "Recente"
              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
              : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800"
          }
        >
          {guest.status}
        </Badge>
      </TableCell>
      <TableCell>{guest.lastStay}</TableCell>
      <TableCell>{guest.totalStays}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {guest.preferences.map((pref, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {pref}
            </Badge>
          ))}
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
 * Interface que define a estrutura de dados de um hóspede
 */
interface Guest {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  email: string;
  phone: string;
  nationality: string;
  status: "Atual" | "Recente" | "Anterior";
  lastStay: string;
  totalStays: number;
  preferences: string[];
}

/**
 * Dados de exemplo para exibição na tabela de hóspedes
 */
const guestData: Guest[] = [
  {
    id: "1",
    name: "Ana Silva",
    initials: "AS",
    email: "ana.silva@email.com",
    phone: "(11) 98765-4321",
    nationality: "Brasil",
    status: "Atual",
    lastStay: "12/06/2023 - 15/06/2023",
    totalStays: 5,
    preferences: ["Vista para o mar", "Andar alto", "Café da manhã"],
  },
  {
    id: "2",
    name: "Carlos Oliveira",
    initials: "CO",
    email: "carlos.oliveira@email.com",
    phone: "(21) 99876-5432",
    nationality: "Portugal",
    status: "Recente",
    lastStay: "05/06/2023 - 10/06/2023",
    totalStays: 3,
    preferences: ["Quarto silencioso", "Academia"],
  },
  {
    id: "3",
    name: "Juliana Santos",
    initials: "JS",
    email: "juliana.santos@email.com",
    phone: "(31) 98765-1234",
    nationality: "Brasil",
    status: "Anterior",
    lastStay: "20/05/2023 - 25/05/2023",
    totalStays: 2,
    preferences: ["Cama king", "Serviço de quarto"],
  },
  {
    id: "4",
    name: "Rafael Mendes",
    initials: "RM",
    email: "rafael.mendes@email.com",
    phone: "(11) 97654-3210",
    nationality: "Brasil",
    status: "Atual",
    lastStay: "10/06/2023 - 17/06/2023",
    totalStays: 7,
    preferences: ["Suite luxo", "Champagne", "Transfer"],
  },
  {
    id: "5",
    name: "Fernanda Costa",
    initials: "FC",
    email: "fernanda.costa@email.com",
    phone: "(41) 98765-8765",
    nationality: "Brasil",
    status: "Recente",
    lastStay: "01/06/2023 - 05/06/2023",
    totalStays: 4,
    preferences: ["Vista para cidade", "Vegetariano"],
  },
  {
    id: "6",
    name: "Miguel Pereira",
    initials: "MP",
    email: "miguel.pereira@email.com",
    phone: "+351 912 345 678",
    nationality: "Portugal",
    status: "Anterior",
    lastStay: "10/05/2023 - 15/05/2023",
    totalStays: 1,
    preferences: ["Quarto para fumantes", "Bar"],
  },
  {
    id: "7",
    name: "Sophia Almeida",
    initials: "SA",
    email: "sophia.almeida@email.com",
    phone: "(11) 99876-1234",
    nationality: "Brasil",
    status: "Atual",
    lastStay: "08/06/2023 - 18/06/2023",
    totalStays: 10,
    preferences: ["Babá", "Menu infantil", "Piscina"],
  },
  {
    id: "8",
    name: "Lucas Ferreira",
    initials: "LF",
    email: "lucas.ferreira@email.com",
    phone: "(21) 98712-3456",
    nationality: "Brasil",
    status: "Recente",
    lastStay: "03/06/2023 - 07/06/2023",
    totalStays: 2,
    preferences: ["Academia 24h", "Café da manhã"],
  },
  {
    id: "9",
    name: "Amanda Ribeiro",
    initials: "AR",
    email: "amanda.ribeiro@email.com",
    phone: "(51) 99876-5432",
    nationality: "Brasil",
    status: "Anterior",
    lastStay: "15/05/2023 - 20/05/2023",
    totalStays: 3,
    preferences: ["Spa", "Serviço de quarto", "Late check-out"],
  },
  {
    id: "10",
    name: "Diego Rocha",
    initials: "DR",
    email: "diego.rocha@email.com",
    phone: "(31) 98888-7777",
    nationality: "Brasil",
    status: "Atual",
    lastStay: "09/06/2023 - 19/06/2023",
    totalStays: 6,
    preferences: ["Wi-Fi premium", "Estacionamento"],
  },
];
