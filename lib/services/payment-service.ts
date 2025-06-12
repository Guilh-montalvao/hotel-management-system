/**
 * Serviço para manipulação de pagamentos no Supabase
 *
 * Este arquivo contém todas as funções relacionadas às operações CRUD
 * (Create, Read, Update, Delete) para a entidade Pagamento no banco de dados.
 *
 * O serviço abstrai a complexidade das chamadas à API do Supabase,
 * fornecendo uma interface limpa e padronizada para os componentes.
 */

import { supabase } from "../supabase";
import { Payment } from "../types";

/**
 * Objeto que contém todos os métodos para manipulação de pagamentos
 * Implementado como um objeto para facilitar a organização e possível
 * substituição por uma implementação alternativa no futuro.
 */
export const paymentService = {
  /**
   * Busca todos os pagamentos cadastrados no sistema
   *
   * Esta função recupera todos os pagamentos do banco de dados,
   * incluindo os dados relacionados de reservas através de joins.
   * Os resultados são ordenados por data de criação decrescente (mais recentes primeiro).
   *
   * @returns Promise com um array de pagamentos com dados relacionados
   * @throws Erro de console se a operação falhar, mas retorna array vazio para evitar quebra de UI
   */
  async getAllPayments(): Promise<Payment[]> {
    // Consulta a tabela 'payments' com joins para bookings, guests e rooms
    const { data, error } = await supabase
      .from("payments")
      .select("*, bookings(*, guests(*), rooms(*))")
      .order("created_at", { ascending: false });

    // Se ocorrer um erro, registra no console e retorna array vazio
    if (error) {
      console.error("Erro ao buscar pagamentos:", error);
      return [];
    }

    // Retorna os dados recuperados
    return data;
  },

  /**
   * Busca um pagamento específico pelo seu ID
   *
   * Esta função recupera os detalhes de um único pagamento com base no ID fornecido,
   * incluindo os dados relacionados de reservas.
   *
   * @param id ID único do pagamento a ser buscado
   * @returns Promise com o pagamento encontrado ou null se não existir
   * @throws Erro de console se a operação falhar
   */
  async getPaymentById(id: string): Promise<Payment | null> {
    // Consulta a tabela 'payments' com joins, filtrando pelo ID
    const { data, error } = await supabase
      .from("payments")
      .select("*, bookings(*, guests(*), rooms(*))")
      .eq("id", id)
      .single();

    // Se ocorrer um erro, registra no console e retorna null
    if (error) {
      console.error("Erro ao buscar pagamento:", error);
      return null;
    }

    // Retorna o pagamento encontrado
    return data;
  },

  /**
   * Adiciona um novo pagamento ao sistema
   *
   * Esta função insere um novo registro de pagamento no banco de dados.
   * Os campos id, created_at e updated_at são gerados automaticamente pelo Supabase.
   *
   * @param payment Objeto com os dados do pagamento a ser adicionado (sem id, created_at e updated_at)
   * @returns Promise com o pagamento adicionado (incluindo o ID gerado) ou null se falhar
   * @throws Erro de console se a operação falhar
   */
  async addPayment(
    payment: Omit<Payment, "id" | "created_at" | "updated_at">
  ): Promise<Payment | null> {
    // Insere o novo pagamento e retorna o registro completo após a inserção
    const { data, error } = await supabase
      .from("payments")
      .insert([payment])
      .select()
      .single();

    // Se ocorrer um erro, registra no console e retorna null
    if (error) {
      console.error("Erro ao adicionar pagamento:", error);
      return null;
    }

    // Retorna o pagamento adicionado, incluindo o ID gerado
    return data;
  },

  /**
   * Atualiza o status de um pagamento existente
   *
   * Esta função modifica apenas o status de um pagamento, mantendo as demais
   * propriedades inalteradas. Também atualiza o campo updated_at automaticamente.
   *
   * @param id ID único do pagamento a ser atualizado
   * @param status Novo status do pagamento
   * @returns Promise com boolean indicando sucesso (true) ou falha (false)
   * @throws Erro de console se a operação falhar
   */
  async updatePaymentStatus(
    id: string,
    status: "Processando" | "Aprovado" | "Rejeitado" | "Estornado"
  ): Promise<boolean> {
    // Atualiza apenas o status e o timestamp do pagamento com o ID especificado
    const { error } = await supabase
      .from("payments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    // Se ocorrer um erro, registra no console e retorna false
    if (error) {
      console.error("Erro ao atualizar status do pagamento:", error);
      return false;
    }

    // Retorna true indicando sucesso
    return true;
  },

  /**
   * Busca pagamentos por reserva específica
   *
   * Esta função é útil para visualizar todos os pagamentos relacionados
   * a uma reserva específica.
   *
   * @param bookingId ID da reserva
   * @returns Promise com um array de pagamentos da reserva
   * @throws Erro de console se a operação falhar, mas retorna array vazio para evitar quebra de UI
   */
  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    // Consulta a tabela 'payments' filtrando por booking_id
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: false });

    // Se ocorrer um erro, registra no console e retorna array vazio
    if (error) {
      console.error("Erro ao buscar pagamentos da reserva:", error);
      return [];
    }

    // Retorna os pagamentos da reserva
    return data;
  },

  /**
   * Remove um pagamento do sistema pelo ID
   *
   * Esta função exclui permanentemente um pagamento do banco de dados.
   * ATENÇÃO: Esta operação não pode ser desfeita.
   *
   * @param id ID único do pagamento a ser excluído
   * @returns Promise com boolean indicando sucesso (true) ou falha (false)
   * @throws Erro de console se a operação falhar
   */
  async deletePayment(id: string): Promise<boolean> {
    // Exclui o pagamento com o ID especificado
    const { error } = await supabase.from("payments").delete().eq("id", id);

    // Se ocorrer um erro, registra no console e retorna false
    if (error) {
      console.error("Erro ao excluir pagamento:", error);
      return false;
    }

    // Retorna true indicando sucesso
    return true;
  },

  /**
   * Calcula métricas financeiras e estatísticas de pagamentos
   *
   * Esta função gera um resumo completo das métricas financeiras do hotel,
   * incluindo receita total, pagamentos pendentes, transações por período, etc.
   * Agora também inclui reservas com payment_status pendente.
   *
   * @returns Promise com objeto contendo todas as métricas calculadas
   * @throws Erro de console se a operação falhar
   */
  async getPaymentMetrics() {
    try {
      // Busca todos os pagamentos para cálculos
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("amount, status, created_at, method, payment_date");

      if (paymentsError) throw paymentsError;

      // Busca reservas com payment_status pendente (que ainda não têm pagamento criado)
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("total_amount, payment_status, created_at")
        .eq("payment_status", "Pendente");

      if (bookingsError) throw bookingsError;

      const payments = paymentsData || [];
      const pendingBookings = bookingsData || [];

      if (payments.length === 0 && pendingBookings.length === 0) {
        return {
          totalRevenue: 0,
          pendingPayments: 0,
          todayTransactions: 0,
          monthlyTransactions: 0,
          paymentMethods: {},
          statusBreakdown: {},
          revenueGrowth: 0,
          pendingGrowth: 0,
        };
      }

      // Definir datas para cálculos
      const today = new Date().toISOString().split("T")[0];
      const thisMonth = new Date().toISOString().slice(0, 7);
      const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 7);

      // Calcular métricas principais
      const totalRevenue = payments
        .filter((p) => p.status === "Aprovado")
        .reduce((sum, p) => sum + p.amount, 0);

      // Incluir tanto pagamentos processando quanto reservas pendentes
      const pendingPayments =
        payments
          .filter((p) => p.status === "Processando")
          .reduce((sum, p) => sum + p.amount, 0) +
        pendingBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

      const todayTransactions =
        payments.filter((p) => p.created_at.startsWith(today)).length +
        pendingBookings.filter((b) => b.created_at.startsWith(today)).length;

      const monthlyTransactions =
        payments.filter((p) => p.created_at.startsWith(thisMonth)).length +
        pendingBookings.filter((b) => b.created_at.startsWith(thisMonth))
          .length;

      // Distribuição por método de pagamento
      const paymentMethods = payments.reduce((acc: any, p) => {
        acc[p.method] = (acc[p.method] || 0) + 1;
        return acc;
      }, {});

      // Incluir reservas pendentes na contagem
      if (pendingBookings.length > 0) {
        paymentMethods["Pendente"] = pendingBookings.length;
      }

      // Distribuição por status (incluindo reservas pendentes)
      const statusBreakdown = payments.reduce((acc: any, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {});

      if (pendingBookings.length > 0) {
        statusBreakdown["Pendente"] = pendingBookings.length;
      }

      // Calcular crescimento da receita (comparar com mês anterior)
      const thisMonthRevenue = payments
        .filter(
          (p) => p.status === "Aprovado" && p.created_at.startsWith(thisMonth)
        )
        .reduce((sum, p) => sum + p.amount, 0);

      const lastMonthRevenue = payments
        .filter(
          (p) => p.status === "Aprovado" && p.created_at.startsWith(lastMonth)
        )
        .reduce((sum, p) => sum + p.amount, 0);

      const revenueGrowth =
        lastMonthRevenue > 0
          ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

      // Calcular crescimento de pagamentos pendentes
      const thisMonthPending =
        payments
          .filter(
            (p) =>
              p.status === "Processando" && p.created_at.startsWith(thisMonth)
          )
          .reduce((sum, p) => sum + p.amount, 0) +
        pendingBookings
          .filter((b) => b.created_at.startsWith(thisMonth))
          .reduce((sum, b) => sum + (b.total_amount || 0), 0);

      const lastMonthPending = payments
        .filter(
          (p) =>
            p.status === "Processando" && p.created_at.startsWith(lastMonth)
        )
        .reduce((sum, p) => sum + p.amount, 0);

      const pendingGrowth =
        lastMonthPending > 0
          ? ((thisMonthPending - lastMonthPending) / lastMonthPending) * 100
          : 0;

      return {
        totalRevenue,
        pendingPayments,
        todayTransactions,
        monthlyTransactions,
        paymentMethods,
        statusBreakdown,
        revenueGrowth,
        pendingGrowth,
      };
    } catch (error) {
      console.error("Erro ao buscar métricas de pagamentos:", error);
      return null;
    }
  },

  /**
   * Busca todos os pagamentos e reservas pendentes
   *
   * Esta função retorna uma lista unificada de transações incluindo:
   * - Pagamentos já processados (tabela payments)
   * - Reservas com payment_status pendente (tabela bookings)
   *
   * @returns Promise com array unificado de transações
   */
  async getAllTransactions() {
    try {
      // Buscar pagamentos existentes
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*, bookings(*, guests(*), rooms(*))")
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Buscar reservas com payment_status pendente
      const { data: pendingBookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("*, guests(*), rooms(*)")
        .eq("payment_status", "Pendente")
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      const transactions = [];

      // Adicionar pagamentos existentes
      if (paymentsData) {
        transactions.push(...paymentsData);
      }

      // Converter reservas pendentes para formato de transação
      if (pendingBookings) {
        const pendingTransactions = pendingBookings.map((booking: any) => ({
          id: `booking-${booking.id}`,
          booking_id: booking.id,
          amount: booking.total_amount || 0,
          method: "Pendente",
          status: "Pendente",
          payment_date: null,
          created_at: booking.created_at,
          updated_at: booking.updated_at,
          bookings: booking,
          is_pending_booking: true, // Flag para identificar
        }));

        transactions.push(...pendingTransactions);
      }

      // Ordenar por data de criação (mais recentes primeiro)
      transactions.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return transactions;
    } catch (error) {
      console.error("Erro ao buscar todas as transações:", error);
      return [];
    }
  },
};
