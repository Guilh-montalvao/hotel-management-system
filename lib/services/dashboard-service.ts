/**
 * Serviço para dados do dashboard
 *
 * Este arquivo contém todas as funções relacionadas à coleta e processamento
 * de dados para exibição no dashboard principal do sistema.
 *
 * O serviço agrega informações de múltiplas tabelas (quartos, reservas, pagamentos, hóspedes)
 * para fornecer métricas consolidadas e dados para gráficos.
 */

import { supabase } from "../supabase";

/**
 * Objeto que contém todos os métodos para coleta de dados do dashboard
 */
export const dashboardService = {
  /**
   * Busca métricas principais do dashboard
   *
   * Esta função coleta e calcula as principais métricas exibidas no dashboard:
   * - Total de quartos e ocupação
   * - Receita total e do mês
   * - Número de hóspedes ativos
   * - Reservas pendentes
   *
   * @returns Promise com objeto contendo todas as métricas
   */
  async getDashboardMetrics() {
    try {
      // Buscar dados de quartos
      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("id, status");

      if (roomsError) throw roomsError;

      // Buscar dados de reservas
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, status, total_amount, check_in, check_out, payment_status, created_at");

      if (bookingsError) throw bookingsError;

      // Buscar dados de pagamentos
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("amount, status, created_at");

      if (paymentsError) throw paymentsError;

      // Buscar dados de hóspedes
      const { data: guests, error: guestsError } = await supabase
        .from("guests")
        .select("id, status");

      if (guestsError) throw guestsError;

      // Calcular métricas de quartos
      const totalRooms = rooms?.length || 0;
      const occupiedRooms =
        rooms?.filter((room) => room.status === "Ocupado").length || 0;
      const availableRooms =
        rooms?.filter((room) => room.status === "Disponível").length || 0;
      const occupancyRate =
        totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

      // Calcular receita total (pagamentos aprovados + reservas pagas)
      const paymentsRevenue =
        payments
          ?.filter((payment) => payment.status === "Aprovado")
          .reduce((sum, payment) => sum + payment.amount, 0) || 0;

      const bookingsRevenue =
        bookings
          ?.filter((booking) => booking.payment_status === "Pago")
          .reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;

      const totalRevenue = paymentsRevenue + bookingsRevenue;

      // Calcular receita do mês atual
      const currentMonth = new Date().toISOString().slice(0, 7);

      const monthlyPaymentsRevenue =
        payments
          ?.filter(
            (payment) =>
              payment.status === "Aprovado" &&
              payment.created_at.startsWith(currentMonth)
          )
          .reduce((sum, payment) => sum + payment.amount, 0) || 0;

      const monthlyBookingsRevenue =
        bookings
          ?.filter(
            (booking) =>
              booking.payment_status === "Pago" &&
              booking.created_at.startsWith(currentMonth)
          )
          .reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;

      const monthlyRevenue = monthlyPaymentsRevenue + monthlyBookingsRevenue;

      // Calcular hóspedes ativos
      const activeGuests =
        guests?.filter((guest) => guest.status === "Hospedado").length || 0;

      // Calcular reservas pendentes (incluindo status de pagamento Pendente)
      const pendingBookings =
        bookings?.filter((booking) =>
          booking.status === "Reservado" ||
          booking.status === "Pendente"
        ).length || 0;

      // Calcular reservas com check-in hoje
      const today = new Date().toISOString().split("T")[0];
      const todayCheckIns =
        bookings?.filter(
          (booking) =>
            booking.check_in.startsWith(today) && booking.status === "Reservado"
        ).length || 0;

      // Calcular reservas com check-out hoje
      const todayCheckOuts =
        bookings?.filter(
          (booking) =>
            booking.check_out.startsWith(today) &&
            booking.status === "Check-in Feito"
        ).length || 0;

      return {
        totalRooms,
        occupiedRooms,
        availableRooms,
        occupancyRate,
        totalRevenue,
        monthlyRevenue,
        activeGuests,
        pendingBookings,
        todayCheckIns,
        todayCheckOuts,
      };
    } catch (error) {
      console.error("Erro ao buscar métricas do dashboard:", error);
      return {
        totalRooms: 0,
        occupiedRooms: 0,
        availableRooms: 0,
        occupancyRate: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        activeGuests: 0,
        pendingBookings: 0,
        todayCheckIns: 0,
        todayCheckOuts: 0,
      };
    }
  },

  /**
   * Busca dados para o gráfico de ocupação dos últimos 7 dias
   *
   * @returns Promise com array de dados para o gráfico de ocupação
   */
  async getOccupancyChartData() {
    try {
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("check_in, check_out, status")
        .gte(
          "check_in",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        );

      if (error) throw error;

      // Gerar dados dos últimos 7 dias
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split("T")[0];
        const dayName = date.toLocaleDateString("pt-BR", { weekday: "short" });

        // Calcular ocupação para este dia
        const occupiedCount =
          bookings?.filter((booking) => {
            const checkIn = new Date(booking.check_in);
            const checkOut = new Date(booking.check_out);
            const currentDate = new Date(dateStr);

            return (
              booking.status !== "Cancelada" &&
              checkIn <= currentDate &&
              checkOut > currentDate
            );
          }).length || 0;

        chartData.push({
          day: dayName,
          date: dateStr,
          occupied: occupiedCount,
          available: Math.max(0, 20 - occupiedCount), // Assumindo 20 quartos total
          occupancyRate: (occupiedCount / 20) * 100,
        });
      }

      return chartData;
    } catch (error) {
      console.error("Erro ao buscar dados do gráfico de ocupação:", error);
      return [];
    }
  },

  /**
   * Busca dados para o gráfico de receita dos últimos 30 dias
   *
   * @returns Promise com array de dados para o gráfico de receita
   */
  async getRevenueChartData() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("amount, status, payment_date, created_at")
        .gte("created_at", thirtyDaysAgo)
        .eq("status", "Aprovado");

      if (paymentsError) throw paymentsError;

      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("total_amount, payment_status, created_at")
        .gte("created_at", thirtyDaysAgo)
        .eq("payment_status", "Pago");

      if (bookingsError) throw bookingsError;

      // Agrupar pagamentos por semana
      const weeklyData = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(
          Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000
        );
        const weekEnd = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);

        const weekStartStr = weekStart.toISOString().split("T")[0];
        const weekEndStr = weekEnd.toISOString().split("T")[0];

        const weekPaymentsRevenue =
          payments
            ?.filter((payment) => {
              const paymentDate = payment.payment_date || payment.created_at;
              return paymentDate >= weekStartStr && paymentDate < weekEndStr;
            })
            .reduce((sum, payment) => sum + payment.amount, 0) || 0;

        const weekBookingsRevenue =
          bookings
            ?.filter((booking) => {
              const bookingDate = booking.created_at;
              return bookingDate >= weekStartStr && bookingDate < weekEndStr;
            })
            .reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;

        const weekRevenue = weekPaymentsRevenue + weekBookingsRevenue;

        weeklyData.push({
          week: `Sem ${4 - i}`,
          revenue: weekRevenue,
          period: `${weekStart.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          })} - ${weekEnd.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          })}`,
        });
      }

      return weeklyData;
    } catch (error) {
      console.error("Erro ao buscar dados do gráfico de receita:", error);
      return [];
    }
  },


  /**
   * Busca reservas recentes para exibição no dashboard
   *
   * @returns Promise com array das 5 reservas mais recentes
   */
  async getRecentBookings() {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          check_in,
          check_out,
          status,
          total_amount,
          guests (name, email),
          rooms (number, type)
        `
        )
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      return (
        data?.map((booking) => ({
          id: booking.id,
          guestName: (booking.guests as any)?.name || "Nome não disponível",
          guestEmail: (booking.guests as any)?.email || "",
          roomNumber: (booking.rooms as any)?.number || "N/A",
          roomType: (booking.rooms as any)?.type || "N/A",
          checkIn: new Date(booking.check_in).toLocaleDateString("pt-BR"),
          checkOut: new Date(booking.check_out).toLocaleDateString("pt-BR"),
          status: booking.status,
          amount: booking.total_amount,
        })) || []
      );
    } catch (error) {
      console.error("Erro ao buscar reservas recentes:", error);
      return [];
    }
  },

  /**
   * Busca estatísticas de métodos de pagamento
   *
   * @returns Promise com distribuição dos métodos de pagamento
   */
  async getPaymentMethodStats() {
    try {
      const { data: payments, error } = await supabase
        .from("payments")
        .select("method, amount")
        .eq("status", "Aprovado");

      if (error) throw error;

      const methodStats =
        payments?.reduce((acc: any, payment) => {
          const method = payment.method;
          if (!acc[method]) {
            acc[method] = { count: 0, total: 0 };
          }
          acc[method].count += 1;
          acc[method].total += payment.amount;
          return acc;
        }, {}) || {};

      return Object.entries(methodStats).map(
        ([method, stats]: [string, any]) => ({
          method,
          count: stats.count,
          total: stats.total,
          percentage: payments?.length
            ? (stats.count / payments.length) * 100
            : 0,
        })
      );
    } catch (error) {
      console.error(
        "Erro ao buscar estatísticas de métodos de pagamento:",
        error
      );
      return [];
    }
  },
};
