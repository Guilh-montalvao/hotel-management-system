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
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PDFService } from "@/lib/services/pdf-service";
import { FileTextIcon } from "lucide-react";
import { PaymentProcessDialog } from "@/components/payments/payment-process-dialog";
import { CreateInvoiceDialog } from "@/components/payments/create-invoice-dialog";

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
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados para diálogos
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [showCreateInvoiceDialog, setShowCreateInvoiceDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Hook de paginação
  const pagination = usePagination({
    data: filteredTransactions,
    itemsPerPage: itemsPerPage,
  });

  // Buscar dados reais dos pagamentos
  useEffect(() => {
    fetchPaymentData();
  }, []);

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

  // Função para abrir o diálogo de processamento com a transação selecionada
  const openProcessDialog = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowProcessDialog(true);
  };

  // Função para abrir o diálogo de criação de fatura
  const openCreateInvoiceDialog = () => {
    setShowCreateInvoiceDialog(true);
  };

  // Handler quando o processamento for concluído
  const handleProcessComplete = () => {
    fetchPaymentData(); // Recarregar dados
    toast.success("Pagamento atualizado com sucesso!");
  };

  // Handler quando a criação de fatura for concluída
  const handleCreateInvoiceComplete = () => {
    fetchPaymentData(); // Recarregar dados
    toast.success("Fatura criada com sucesso!");
  };

  // Função para gerar um relatório PDF
  const handleGeneratePdf = async () => {
    try {
      if (payments && payments.length > 0) {
        PDFService.generateFinancialReport(payments);
        toast.success("Relatório PDF financeiro gerado com sucesso!");
      } else {
        toast.error("Nenhuma transação encontrada para gerar relatório");
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Pagamentos & Faturamento
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <RefreshCwIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            Limpar Filtros
          </Button>
          <Button variant="outline" size="sm" onClick={handleGeneratePdf}>
            <FileTextIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            Gerar PDF
          </Button>
          <Button size="sm" onClick={openCreateInvoiceDialog}>
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
            <p className="text-xs text-muted-foreground">
              {paymentMetrics?.revenueGrowth > 0 ? (
                <span className="flex items-center text-emerald-600">
                  <ArrowUpIcon className="mr-1 h-3 w-3" aria-hidden="true" />+
                  {paymentMetrics?.revenueGrowth.toFixed(1)}%
                </span>
              ) : paymentMetrics?.revenueGrowth < 0 ? (
                <span className="flex items-center text-red-600">
                  <ArrowDownIcon className="mr-1 h-3 w-3" aria-hidden="true" />
                  {paymentMetrics?.revenueGrowth.toFixed(1)}%
                </span>
              ) : (
                "Estável"
              )}
              {" desde o mês passado"}
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
              {paymentMetrics?.pendingGrowth > 0 ? (
                <span className="flex items-center text-amber-600">
                  <ArrowUpIcon className="mr-1 h-3 w-3" aria-hidden="true" />+
                  {paymentMetrics?.pendingGrowth.toFixed(1)}%
                </span>
              ) : paymentMetrics?.pendingGrowth < 0 ? (
                <span className="flex items-center text-emerald-600">
                  <ArrowDownIcon className="mr-1 h-3 w-3" aria-hidden="true" />
                  {paymentMetrics?.pendingGrowth.toFixed(1)}%
                </span>
              ) : (
                "Estável"
              )}
              {" desde o mês passado"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transações Hoje
            </CardTitle>
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
              Transações nas últimas 24h
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transações do Mês
            </CardTitle>
            <CreditCardIcon
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "0" : paymentMetrics?.monthlyTransactions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Transações no mês atual
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transações</CardTitle>
              <CardDescription>
                Gerencie todas as transações financeiras do hotel.
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
              <Select
                value={statusFilter}
                onValueChange={handleStatusChange}
                defaultValue="all"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="completed">Aprovados</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="failed">Rejeitados</SelectItem>
                  <SelectItem value="refunded">Estornados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            value={currentTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todas as transações</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="refunds">Estornos</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-medium">Carregando dados...</div>
                  <p className="text-sm text-muted-foreground">
                    Buscando transações e pagamentos
                  </p>
                </div>
              </div>
            ) : filteredTransactions.length > 0 ? (
              <TabsContent value={currentTab} className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">ID / Data</TableHead>
                      <TableHead>Hóspede</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagination.paginatedData.map((transaction) => (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        onProcess={openProcessDialog}
                      />
                    ))}
                  </TableBody>
                </Table>

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

      {/* Diálogos */}
      {showProcessDialog && (
        <PaymentProcessDialog
          open={showProcessDialog}
          onOpenChange={setShowProcessDialog}
          transaction={selectedTransaction}
          onProcessComplete={handleProcessComplete}
        />
      )}

      <CreateInvoiceDialog
        open={showCreateInvoiceDialog}
        onOpenChange={setShowCreateInvoiceDialog}
        onCreateComplete={handleCreateInvoiceComplete}
      />
    </div>
  );
}

function TransactionRow({
  transaction,
  onProcess,
}: {
  transaction: any;
  onProcess: (transaction: any) => void;
}) {
  // Função para obter as iniciais do nome
  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (
      (parts[0] ? parts[0][0] : "") +
      (parts[parts.length - 1] ? parts[parts.length - 1][0] : "")
    ).toUpperCase();
  };

  // Função para formatar data
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd/MM/yyyy");
    } catch (error) {
      return "Data inválida";
    }
  };

  // ID da transação: usar formato mais legível baseado no tipo
  const transactionId = transaction.is_pending_booking
    ? `RES-${transaction.booking_id.slice(-6).toUpperCase()}`
    : `PAG-${transaction.id.slice(-6).toUpperCase()}`;

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="font-mono text-xs">#{transactionId}</div>
        <div className="text-xs text-muted-foreground">
          {transaction.created_at
            ? formatDate(transaction.created_at)
            : "Sem data"}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {transaction.bookings?.guests?.name
                ? getInitials(transaction.bookings.guests.name)
                : "??"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {transaction.bookings?.guests?.name || "Hóspede não encontrado"}
            </div>
            <div className="text-xs text-muted-foreground">
              {transaction.bookings?.rooms?.number
                ? `Quarto ${transaction.bookings.rooms.number}`
                : "Quarto não especificado"}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="font-medium">
        R$ {transaction.amount?.toFixed(2) || "0,00"}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <CreditCardIcon
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          {transaction.method || "Não especificado"}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => onProcess(transaction)}
          >
            Visualizar
          </Button>
          {transaction.status === "Pendente" ||
          transaction.status === "Processando" ? (
            <Button size="sm" onClick={() => onProcess(transaction)}>
              Processar
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Gerar o PDF de apenas este pagamento
                try {
                  const transactionForPdf = {
                    ...transaction,
                  };
                  PDFService.generateFinancialReport([transactionForPdf]);
                  toast.success("Recibo gerado com sucesso!");
                } catch (error) {
                  console.error("Erro ao gerar recibo:", error);
                  toast.error("Erro ao gerar recibo");
                }
              }}
            >
              Imprimir
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
