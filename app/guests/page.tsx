"use client";

import { useState, useEffect, createContext, useContext } from "react";
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
import { AddGuestDialog } from "@/components/guests/add-guest-dialog";
import { EditGuestDialog } from "@/components/guests/edit-guest-dialog";
import { GuestDetailsDialog } from "@/components/guests/guest-details-dialog";
import { format } from "date-fns";
import { useSupabase } from "@/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { BreadcrumbNavigation } from "@/components/ui/breadcrumb-navigation";
import { guestService } from "@/lib/services/guest-service";

// Interface que define a estrutura de dados de um hóspede
export interface Guest {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  email: string;
  phone: string;
  status: "Hospedado" | "Reservado" | "Sem estadia";
  birthDate?: string;
  cpf?: string;
  genero?: string;
  endereco?: string;
  // Campos mantidos para compatibilidade
  nationality: string;
  lastStay: string;
  totalStays: number;
  preferences: string[];
}

// Conversores para traduzir entre os formatos Guest (UI) e Supabase Guest
const convertDbGuestToUIGuest = (dbGuest: any): Guest => {
  const nameParts = dbGuest.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  // Solução para o problema de fuso horário com datas
  let birthDateFormatted = "";
  if (dbGuest.birth_date) {
    // Para garantir que a data seja interpretada corretamente sem problemas de fuso horário
    const dateStr = dbGuest.birth_date;
    if (typeof dateStr === "string") {
      // Extrair a data diretamente da string, sem depender de new Date()
      // Formato esperado do banco: YYYY-MM-DD
      const parts = dateStr.split("-");
      if (parts.length >= 3) {
        // Formatar como DD/MM/YYYY
        birthDateFormatted = `${parts[2].substring(0, 2)}/${parts[1]}/${
          parts[0]
        }`;
      }
    } else {
      // Fallback para o método anterior
      birthDateFormatted = format(new Date(dbGuest.birth_date), "dd/MM/yyyy");
    }
  }

  return {
    id: dbGuest.id,
    name: dbGuest.name,
    initials: `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase(),
    email: dbGuest.email,
    phone: dbGuest.phone || "",
    status: dbGuest.status,
    cpf: dbGuest.cpf,
    birthDate: birthDateFormatted,
    genero: dbGuest.gender || "",
    endereco: dbGuest.address || "",
    // Campos mantidos apenas para compatibilidade com a interface
    nationality: "Brasil", // Valor padrão - não está mais no banco
    lastStay: "", // Valor padrão
    totalStays: 0, // Valor padrão
    preferences: [], // Valor padrão - não está mais no banco
  };
};

const convertUIGuestToDbGuest = (uiGuest: Guest): any => {
  // Processando a data - se estiver no formato DD/MM/YYYY, converte para Date
  let birthDate = null;
  if (uiGuest.birthDate) {
    try {
      // Verifica se está no formato DD/MM/YYYY
      if (uiGuest.birthDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        // Converter de DD/MM/YYYY para formato válido YYYY-MM-DD
        const [day, month, year] = uiGuest.birthDate.split("/");
        // Usar a string diretamente para evitar problemas de fuso horário
        birthDate = `${year}-${month}-${day}`;
      } else {
        // Tenta converter diretamente se estiver em outro formato
        const date = new Date(uiGuest.birthDate);
        // Formatar como YYYY-MM-DD para evitar problemas de fuso horário
        birthDate = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      }
    } catch (error) {
      console.error("Erro ao converter data de nascimento:", error);
      birthDate = null;
    }
  }

  return {
    name: uiGuest.name,
    email: uiGuest.email,
    cpf: uiGuest.cpf || "",
    status: uiGuest.status,
    phone: uiGuest.phone,
    birth_date: birthDate,
    gender: uiGuest.genero,
    address: uiGuest.endereco,
  };
};

// Criar o contexto para compartilhar funções com os componentes filhos
interface GuestsPageContextType {
  handleEditGuest: (guest: Guest) => void;
  handleViewGuestDetails: (guest: Guest) => void;
}

const GuestsPageContext = createContext<GuestsPageContextType | undefined>(
  undefined
);

/**
 * Página de gerenciamento de hóspedes
 * Permite visualizar e gerenciar informações de todos os hóspedes do hotel
 */
export default function GuestsPage() {
  // Obter os hooks do Supabase para lidar com hóspedes
  const { useGuests } = useSupabase();
  const {
    data: dbGuests,
    isLoading,
    isError,
    addGuest: addGuestToDb,
    updateGuest: updateGuestInDb,
    deleteGuest: deleteGuestFromDb,
  } = useGuests();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState("all");
  const [guestData, setGuestData] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [showAddGuestDialog, setShowAddGuestDialog] = useState(false);
  const [showEditGuestDialog, setShowEditGuestDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // Carregar dados do Supabase quando o componente montar
  useEffect(() => {
    if (dbGuests) {
      console.log("Dados recebidos do Supabase:", dbGuests);
      // Converter os hóspedes do banco para o formato usado na UI
      const uiGuests = dbGuests.map(convertDbGuestToUIGuest);
      setGuestData(uiGuests);
      // Inicializa a lista filtrada com todos os hóspedes
      setFilteredGuests(uiGuests);
    }
  }, [dbGuests]);

  // Função para filtrar hóspedes com base na pesquisa, filtro de status e aba atual
  useEffect(() => {
    // Aplicando os filtros
    let results = [...guestData];

    // Filtrar por tipo de status (aba)
    if (currentTab !== "all") {
      const statusMappings = {
        current: "Hospedado",
        recent: "Reservado",
        past: "Sem estadia",
      };

      const tabStatus =
        statusMappings[currentTab as keyof typeof statusMappings];
      if (tabStatus) {
        results = results.filter((guest) => guest.status === tabStatus);
      }
    }

    // Filtrar por status selecionado
    if (statusFilter !== "all") {
      const statusMappings = {
        current: "Hospedado",
        recent: "Reservado",
        past: "Sem estadia",
      };

      const filterStatus =
        statusMappings[statusFilter as keyof typeof statusMappings];
      if (filterStatus) {
        results = results.filter((guest) => guest.status === filterStatus);
      }
    }

    // Filtrar por pesquisa (nome, email, telefone, CPF)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (guest) =>
          guest.name.toLowerCase().includes(query) ||
          guest.email.toLowerCase().includes(query) ||
          guest.phone.toLowerCase().includes(query) ||
          (guest.cpf && guest.cpf.toLowerCase().includes(query))
      );
    }

    setFilteredGuests(results);
  }, [searchQuery, statusFilter, currentTab, guestData]);

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

  // Função para adicionar um novo hóspede
  const handleAddGuest = async (data: any) => {
    // Converter para o formato esperado pelo banco de dados
    console.log("Dados recebidos do formulário:", data);

    // Verificar se os dados obrigatórios estão presentes
    if (!data.nome || !data.sobrenome || !data.email) {
      toast.error(
        "Faltam dados obrigatórios: nome, sobrenome e email são necessários"
      );
      return;
    }

    // Formatar os dados para o formato esperado pelo Supabase
    const dbGuest = {
      name: `${data.nome} ${data.sobrenome}`,
      email: data.email,
      phone: data.telefone || "",
      cpf: data.cpf || "",
      status: "Sem estadia", // Valor direto conforme esperado pelo banco
      birth_date: data.dataNascimento
        ? new Date(data.dataNascimento).toISOString()
        : null,
      gender: data.genero || "",
      address: data.descricao || "",
    };

    console.log("Dados formatados para envio ao Supabase:", dbGuest);

    try {
      // Adicionar o hóspede ao banco de dados
      const newDbGuest = await addGuestToDb(dbGuest);
      console.log("Resposta do Supabase:", newDbGuest);

      // Converter para formato UI e adicionar ao estado local
      if (newDbGuest) {
        const newUiGuest = convertDbGuestToUIGuest(newDbGuest);

        // Atualizar o estado dos hóspedes
        const updatedGuestData = [newUiGuest, ...guestData];
        setGuestData(updatedGuestData);

        // Atualizar a lista filtrada também, considerando os filtros atuais
        if (
          currentTab === "all" ||
          (currentTab === "past" && newUiGuest.status === "Sem estadia") ||
          (currentTab === "recent" && newUiGuest.status === "Reservado") ||
          (currentTab === "current" && newUiGuest.status === "Hospedado")
        ) {
          if (
            statusFilter === "all" ||
            (statusFilter === "past" && newUiGuest.status === "Sem estadia") ||
            (statusFilter === "recent" && newUiGuest.status === "Reservado") ||
            (statusFilter === "current" && newUiGuest.status === "Hospedado")
          ) {
            // Sem filtro de pesquisa ou o hóspede corresponde ao filtro
            if (
              searchQuery.trim() === "" ||
              newUiGuest.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              newUiGuest.email
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              (newUiGuest.phone &&
                newUiGuest.phone
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())) ||
              (newUiGuest.cpf &&
                newUiGuest.cpf
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()))
            ) {
              setFilteredGuests((prev) => [newUiGuest, ...prev]);
            }
          }
        }

        toast.success(`Hóspede ${newDbGuest.name} adicionado com sucesso!`);
      }
    } catch (error: any) {
      console.error("Erro ao adicionar hóspede:", error);
      console.error("Dados que tentamos enviar:", dbGuest);

      // Verifica problemas comuns
      if (error.message?.includes("duplicate")) {
        toast.error(
          "Este hóspede já existe no sistema (e-mail ou CPF duplicado)."
        );
      } else if (error.message?.includes("violates")) {
        toast.error("Dados inválidos: violação de regras do banco.");
      } else if (error.message?.includes("não configurado")) {
        toast.error(
          "Problema de conexão com o banco de dados. Verifique se o Supabase está configurado corretamente."
        );
      } else {
        toast.error(
          `Erro ao adicionar hóspede: ${
            error.message || "Problema de conexão com o banco"
          }`
        );
      }
    }
  };

  // Função para atualizar um hóspede existente
  const handleUpdateGuest = async (updatedGuest: Guest) => {
    try {
      // Converter para o formato do banco de dados
      const dbGuest = convertUIGuestToDbGuest(updatedGuest);

      // Atualizar no banco de dados
      const updatedDbGuest = await updateGuestInDb(updatedGuest.id, dbGuest);

      // Atualizar no estado local se a atualização for bem-sucedida
      if (updatedDbGuest) {
        setGuestData((prev) =>
          prev.map((guest) =>
            guest.id === updatedGuest.id ? updatedGuest : guest
          )
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar hóspede:", error);
    }
  };

  const handleEditGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowEditGuestDialog(true);
  };

  const handleViewGuestDetails = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowDetailsDialog(true);
  };

  const handleDeleteGuest = async (id: string) => {
    try {
      // Remover do banco de dados
      await deleteGuestFromDb(id);

      // Remover do estado local
      setGuestData((prev) => prev.filter((guest) => guest.id !== id));
    } catch (error) {
      console.error("Erro ao excluir hóspede:", error);
    }
  };

  // Função para recarregar dados do banco de dados
  const reloadData = async () => {
    try {
      toast.info("Recarregando dados dos hóspedes...");

      // Buscar novamente os dados do Supabase com cache=false para garantir dados atualizados
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        console.log("Dados atualizados recebidos do Supabase:", data);

        // Converter os hóspedes do banco para o formato usado na UI
        const uiGuests = data.map(convertDbGuestToUIGuest);
        setGuestData(uiGuests);

        // Resetar os filtros
        setSearchQuery("");
        setStatusFilter("all");
        setCurrentTab("all");
        setFilteredGuests(uiGuests);

        toast.success(`${data.length} hóspedes carregados com sucesso!`);
      }
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
      toast.error("Erro ao recarregar os dados dos hóspedes");
    }
  };

  return (
    <GuestsPageContext.Provider
      value={{ handleEditGuest, handleViewGuestDetails }}
    >
      <div className="flex flex-col gap-4">
        <BreadcrumbNavigation />
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
            <Button variant="outline" size="sm" onClick={reloadData}>
              <RefreshCwIcon className="mr-2 h-4 w-4" aria-hidden="true" />
              Recarregar Dados
            </Button>

            <Button size="sm" onClick={() => setShowAddGuestDialog(true)}>
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
              <div className="text-2xl font-bold">{guestData.length}</div>
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
              <div className="text-2xl font-bold">
                {
                  guestData.filter((guest) => guest.status === "Hospedado")
                    .length
                }
              </div>
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
              <div className="text-2xl font-bold">
                {
                  guestData.filter((guest) => guest.status === "Reservado")
                    .length
                }
              </div>
              <p className="text-xs text-muted-foreground">Reservados</p>
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
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="current">Hospedados</SelectItem>
                    <SelectItem value="recent">Reservados</SelectItem>
                    <SelectItem value="past">Sem Estadia</SelectItem>
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
                <TabsTrigger value="current">Hospedados</TabsTrigger>
                <TabsTrigger value="recent">Reservados</TabsTrigger>
              </TabsList>

              {filteredGuests.length > 0 ? (
                <TabsContent value={currentTab} className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hóspede</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data de Nascimento</TableHead>
                        <TableHead>Gênero</TableHead>
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

        {/* Diálogo para adicionar novo hóspede */}
        <AddGuestDialog
          open={showAddGuestDialog}
          onOpenChange={setShowAddGuestDialog}
          onAddGuest={handleAddGuest}
        />

        {/* Diálogo para editar hóspede */}
        {selectedGuest && (
          <EditGuestDialog
            open={showEditGuestDialog}
            onOpenChange={setShowEditGuestDialog}
            guest={selectedGuest}
            onUpdateGuest={handleUpdateGuest}
          />
        )}

        {/* Diálogo para visualizar detalhes do hóspede */}
        {selectedGuest && (
          <GuestDetailsDialog
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
            guest={selectedGuest}
            onDeleteGuest={handleDeleteGuest}
          />
        )}
      </div>
    </GuestsPageContext.Provider>
  );
}

/**
 * Componente que renderiza uma linha da tabela de hóspedes
 * @param guest - Dados do hóspede a ser exibido
 */
function GuestRow({ guest }: { guest: Guest }) {
  // Obter a função de edição do contexto da página
  const guestsPageContext = useContext(GuestsPageContext);

  if (!guestsPageContext) {
    throw new Error("GuestRow deve ser usado dentro de um GuestsPageContext");
  }

  const { handleEditGuest, handleViewGuestDetails } = guestsPageContext;

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
              {guest.cpf || "000.000.000-00"}
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
            guest.status === "Hospedado"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
              : guest.status === "Reservado"
              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
              : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800"
          }
        >
          {guest.status}
        </Badge>
      </TableCell>
      <TableCell>{guest.birthDate || "01/01/1990"}</TableCell>
      <TableCell>{guest.genero || "Não informado"}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewGuestDetails(guest)}
          >
            Ver detalhes
          </Button>
          <Button size="sm" onClick={() => handleEditGuest(guest)}>
            Editar
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
/**
 * Dados de exemplo para exibição na tabela de hóspedes
 */
const initialGuestData: Guest[] = [
  {
    id: "1",
    name: "Ana Silva",
    initials: "AS",
    email: "ana.silva@email.com",
    phone: "(11) 98765-4321",
    nationality: "Brasil",
    status: "Hospedado",
    lastStay: "12/06/2023 - 15/06/2023",
    totalStays: 5,
    preferences: ["Vista para o mar", "Andar alto", "Café da manhã"],
    cpf: "123.456.789-00",
    birthDate: "10/05/1990",
    genero: "Feminino",
  },
  {
    id: "2",
    name: "Carlos Oliveira",
    initials: "CO",
    email: "carlos.oliveira@email.com",
    phone: "(21) 99876-5432",
    nationality: "Portugal",
    status: "Reservado",
    lastStay: "05/06/2023 - 10/06/2023",
    totalStays: 3,
    preferences: ["Quarto silencioso", "Academia"],
    cpf: "234.567.890-00",
    birthDate: "01/01/1985",
    genero: "Masculino",
  },
  {
    id: "3",
    name: "Juliana Santos",
    initials: "JS",
    email: "juliana.santos@email.com",
    phone: "(31) 98765-1234",
    nationality: "Brasil",
    status: "Sem estadia",
    lastStay: "20/05/2023 - 25/05/2023",
    totalStays: 2,
    preferences: ["Cama king", "Serviço de quarto"],
    cpf: "345.678.901-00",
    birthDate: "05/05/1995",
    genero: "Feminino",
  },
];
