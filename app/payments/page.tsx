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
import { useSupabase } from "@/hooks/useSupabase";
import { paymentService } from "@/lib/services/payment-service";
import { format } from "date-fns";
import { toast } from "sonner";

/**
 * Página de gerenciamento de pagamentos
 * Permite visualizar e gerenciar todas as transações financeiras do hotel
 */
export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState("all");
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentMetrics, setPaymentMetrics] = useState<any>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados reais dos pagamentos
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setIsLoading(true);

        // Buscar pagamentos e reservas pendentes
        const paymentsData = await paymentService.getAllTransactions();

        // Buscar métricas
        const metricsData = await paymentService.getPaymentMetrics();

        setPayments(paymentsData);
        setPaymentMetrics(metricsData);
        setFilteredTransactions(paymentsData);
      } catch (error) {
        console.error("Erro ao buscar dados de pagamentos:", error);
        toast.error("Erro ao carregar dados de pagamentos");
        // Fallback para dados vazios se não conseguir buscar
        setPayments([]);
        setPaymentMetrics({
          totalRevenue: 0,
          pendingPayments: 0,
          todayTransactions: 0,
          monthlyTransactions: 0,
          revenueGrowth: 0,
          pendingGrowth: 0,
        });
        setFilteredTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  // Função para filtrar transações com base na pesquisa, filtro de status e aba atual
  useEffect(() => {
    if (!payments || payments.length === 0) {
      setFilteredTransactions([]);
      return;
    }

    let results = [...payments];

    // Filtrar por tipo de aba
    if (currentTab !== "all") {
      if (currentTab === "recent") {
        results = results.slice(0, 3); // Mostrar apenas as 3 transações mais recentes
      } else if (currentTab === "pending") {
        results = results.filter(
          (payment) =>
            payment.status === "Processando" || payment.status === "Pendente"
        );
      } else if (currentTab === "refunds") {
        results = results.filter((payment) => payment.status === "Estornado");
      }
    }

    // Filtrar por status selecionado
    if (statusFilter !== "all") {
      const statusMap = {
        completed: "Aprovado",
        pending: ["Processando", "Pendente"], // Incluir ambos os status
        failed: "Rejeitado",
        refunded: "Estornado",
      };

      const targetStatus = statusMap[statusFilter as keyof typeof statusMap];
      if (targetStatus) {
        if (Array.isArray(targetStatus)) {
          results = results.filter((payment) =>
            targetStatus.includes(payment.status)
          );
        } else {
          results = results.filter(
            (payment) => payment.status === targetStatus
          );
        }
      }
    }

    // Filtrar por pesquisa (ID, nome do hóspede, método)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (payment) =>
          payment.id.toLowerCase().includes(query) ||
          (payment.bookings?.guests?.name || "")
            .toLowerCase()
            .includes(query) ||
          payment.method.toLowerCase().includes(query)
      );
    }

    setFilteredTransactions(results);
  }, [searchQuery, statusFilter, currentTab, payments]);

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
            <div className="text-2xl font-bold">
              {isLoading
                ? "R$ 0,00"
                : `R$ ${(paymentMetrics?.totalRevenue || 0).toLocaleString(
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
              {isLoading
                ? "0.0% em relação ao mês anterior"
                : `${
                    paymentMetrics?.revenueGrowth?.toFixed(1) || 0
                  }% em relação ao mês anterior`}
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
            <div className="text-2xl font-bold">
              {isLoading
                ? "R$ 0,00"
                : `R$ ${(paymentMetrics?.pendingPayments || 0).toLocaleString(
                    "pt-BR",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading
                ? "0.0% em relação à semana anterior"
                : "Aguardando pagamento"}
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
            <div className="text-2xl font-bold">
              {isLoading ? "0" : paymentMetrics?.todayTransactions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Neste mês" : "Neste mês"}
            </p>
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
              +2.5% em relação ao mês anterior
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
function TransactionRow({ transaction }: { transaction: any }) {
  // Gerar iniciais do nome do hóspede
  const getInitials = (name: string) => {
    if (!name) return "N/A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Para reservas pendentes, os dados estão diretamente no bookings
  const guestName = transaction.is_pending_booking
    ? transaction.bookings?.guests?.name || "Hóspede não identificado"
    : transaction.bookings?.guests?.name || "Hóspede não identificado";

  const formattedDate = transaction.payment_date
    ? format(new Date(transaction.payment_date), "dd/MM/yyyy")
    : format(new Date(transaction.created_at), "dd/MM/yyyy");

  // ID da transação: para reservas pendentes, usar ID da reserva
  const transactionId = transaction.is_pending_booking
    ? `booking-${transaction.booking_id}`
    : transaction.id;

  return (
    <TableRow>
      <TableCell className="font-medium">
        #{transactionId.toString().slice(0, 8)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials(guestName)}</AvatarFallback>
          </Avatar>
          <div className="font-medium">{guestName}</div>
        </div>
      </TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell className="font-medium">
        R${" "}
        {(transaction.amount || 0).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <CreditCardIcon
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          {transaction.method || "Pendente"}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={
            transaction.status === "Aprovado"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
              : transaction.status === "Processando"
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
              : transaction.status === "Pendente"
              ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800"
              : transaction.status === "Rejeitado"
              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
              : transaction.status === "Estornado"
              ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800"
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
          {transaction.status === "Pendente" ? (
            <Button size="sm">Processar</Button>
          ) : (
            <Button size="sm">Imprimir</Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
