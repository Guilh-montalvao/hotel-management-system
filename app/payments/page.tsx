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
  ArrowDownIcon,
  ArrowUpIcon,
  CreditCardIcon,
  DollarSignIcon,
  FilterIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  WalletIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Página de gerenciamento de pagamentos
 * Permite visualizar e gerenciar todas as transações financeiras do hotel
 */
export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState("all");
  const [filteredTransactions, setFilteredTransactions] =
    useState(transactionData);

  // Função para filtrar transações com base na pesquisa, filtro de status e aba atual
  useEffect(() => {
    let results = [...transactionData];

    // Filtrar por tipo de aba
    if (currentTab !== "all") {
      if (currentTab === "recent") {
        results = results.slice(0, 3); // Mostrar apenas as 3 transações mais recentes
      } else if (currentTab === "pending") {
        results = results.filter(
          (transaction) => transaction.status === "Pendente"
        );
      } else if (currentTab === "refunds") {
        results = results.filter(
          (transaction) => transaction.status === "Reembolsado"
        );
      }
    }

    // Filtrar por status selecionado
    if (statusFilter !== "all") {
      const statusMap = {
        completed: "Concluído",
        pending: "Pendente",
        failed: "Falha",
        refunded: "Reembolsado",
      };

      if (statusMap[statusFilter as keyof typeof statusMap]) {
        results = results.filter(
          (transaction) =>
            transaction.status ===
            statusMap[statusFilter as keyof typeof statusMap]
        );
      }
    }

    // Filtrar por pesquisa (ID, nome do hóspede)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (transaction) =>
          transaction.id.toLowerCase().includes(query) ||
          transaction.guestName.toLowerCase().includes(query) ||
          transaction.method.toLowerCase().includes(query)
      );
    }

    setFilteredTransactions(results);
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
          Pagamentos & Faturamento
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
            Nova Fatura
          </Button>
        </div>
      </div>

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
              Pagamentos Pendentes
            </CardTitle>
            <WalletIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$5.946,00</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowDownIcon
                className="mr-1 h-4 w-4 text-red-500"
                aria-hidden="true"
              />
              -4,3% em relação à semana anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
            <CreditCardIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.248</div>
            <p className="text-xs text-muted-foreground">Neste mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transação Média
            </CardTitle>
            <DollarSignIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$189,43</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpIcon
                className="mr-1 h-4 w-4 text-emerald-500"
                aria-hidden="true"
              />
              +2,5% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transações de Pagamento</CardTitle>
              <CardDescription>
                Visualize e gerencie todas as transações de pagamento
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
                  placeholder="Buscar transações..."
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
                  <SelectItem value="all">Todas as Transações</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="failed">Falhas</SelectItem>
                  <SelectItem value="refunded">Reembolsadas</SelectItem>
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
              <TabsTrigger value="all">Todas as Transações</TabsTrigger>
              <TabsTrigger value="recent">Recentes</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="refunds">Reembolsos</TabsTrigger>
            </TabsList>

            {filteredTransactions.length > 0 ? (
              <TabsContent value={currentTab} className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID da Transação</TableHead>
                      <TableHead>Hóspede</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="text-muted-foreground mb-4">
                  Nenhuma transação encontrada com os filtros atuais.
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
 * Componente que renderiza uma linha da tabela de transações
 * @param transaction - Dados da transação a ser exibida
 */
function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{transaction.id}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={transaction.guestAvatar}
              alt={transaction.guestName}
            />
            <AvatarFallback>{transaction.guestInitials}</AvatarFallback>
          </Avatar>
          <div className="font-medium">{transaction.guestName}</div>
        </div>
      </TableCell>
      <TableCell>{transaction.date}</TableCell>
      <TableCell className="font-medium">
        R${transaction.amount.toFixed(2).replace(".", ",")}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <CreditCardIcon
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          {transaction.method}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={
            transaction.status === "Concluído"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
              : transaction.status === "Pendente"
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
              : transaction.status === "Falha"
              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
              : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800"
          }
        >
          {transaction.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm">
            Visualizar
          </Button>
          <Button size="sm">Imprimir</Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

/**
 * Interface que define a estrutura de dados de uma transação
 */
interface Transaction {
  id: string;
  guestName: string;
  guestInitials: string;
  guestAvatar?: string;
  date: string;
  amount: number;
  method: string;
  status: "Concluído" | "Pendente" | "Falha" | "Reembolsado";
}

/**
 * Dados de exemplo para exibição na tabela de transações
 */
const transactionData: Transaction[] = [
  {
    id: "T-1234",
    guestName: "Ana Silva",
    guestInitials: "AS",
    date: "15/06/2023",
    amount: 456.78,
    method: "Cartão de Crédito",
    status: "Concluído",
  },
  {
    id: "T-1235",
    guestName: "Carlos Oliveira",
    guestInitials: "CO",
    date: "15/06/2023",
    amount: 789.5,
    method: "Transferência",
    status: "Pendente",
  },
  {
    id: "T-1236",
    guestName: "Juliana Santos",
    guestInitials: "JS",
    date: "14/06/2023",
    amount: 345.0,
    method: "PIX",
    status: "Concluído",
  },
  {
    id: "T-1237",
    guestName: "Rafael Mendes",
    guestInitials: "RM",
    date: "14/06/2023",
    amount: 1250.0,
    method: "Cartão de Crédito",
    status: "Reembolsado",
  },
  {
    id: "T-1238",
    guestName: "Fernanda Costa",
    guestInitials: "FC",
    date: "13/06/2023",
    amount: 678.9,
    method: "Cartão de Débito",
    status: "Concluído",
  },
  {
    id: "T-1239",
    guestName: "Lucas Ferreira",
    guestInitials: "LF",
    date: "13/06/2023",
    amount: 123.45,
    method: "Dinheiro",
    status: "Concluído",
  },
  {
    id: "T-1240",
    guestName: "Mariana Alves",
    guestInitials: "MA",
    date: "12/06/2023",
    amount: 890.0,
    method: "PIX",
    status: "Falha",
  },
  {
    id: "T-1241",
    guestName: "Gabriel Santos",
    guestInitials: "GS",
    date: "12/06/2023",
    amount: 567.8,
    method: "Cartão de Crédito",
    status: "Concluído",
  },
  {
    id: "T-1242",
    guestName: "Carolina Lima",
    guestInitials: "CL",
    date: "11/06/2023",
    amount: 432.1,
    method: "Transferência",
    status: "Pendente",
  },
  {
    id: "T-1243",
    guestName: "Diego Pereira",
    guestInitials: "DP",
    date: "11/06/2023",
    amount: 975.6,
    method: "Cartão de Crédito",
    status: "Concluído",
  },
];
