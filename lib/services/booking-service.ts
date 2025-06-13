/**
 * Serviço para manipulação de reservas no Supabase
 *
 * Este arquivo contém todas as funções relacionadas às operações CRUD
 * (Create, Read, Update, Delete) para a entidade Reserva no banco de dados,
 * além de operações específicas como check-in e check-out.
 *
 * O serviço abstrai a complexidade das chamadas à API do Supabase e
 * gerencia as relações entre reservas, quartos e hóspedes.
 */

import { supabase } from "../supabase";
import { Booking } from "../types";
import { roomService } from "./room-service";
import { guestService } from "./guest-service";

/**
 * Objeto que contém todos os métodos para manipulação de reservas
 * Implementado como um objeto para facilitar a organização e possível
 * substituição por uma implementação alternativa no futuro.
 */
export const bookingService = {
  /**
   * Busca todas as reservas cadastradas no sistema
   *
   * Esta função recupera todas as reservas do banco de dados,
   * incluindo os dados relacionados de hóspedes e quartos através de joins.
   * Os resultados são ordenados por data de check-in decrescente (mais recentes primeiro).
   *
   * @returns Promise com um array de reservas com dados relacionados
   * @throws Erro de console se a operação falhar, mas retorna array vazio para evitar quebra de UI
   */
  async getAllBookings(): Promise<Booking[]> {
    // Consulta a tabela 'bookings' com joins para guests e rooms
    const { data, error } = await supabase
      .from("bookings")
      .select("*, guests(*), rooms(*)")
      .order("check_in", { ascending: false });

    // Se ocorrer um erro, registra no console e retorna array vazio
    if (error) {
      console.error("Erro ao buscar reservas:", error);
      return [];
    }

    // Retorna os dados recuperados
    return data;
  },

  /**
   * Busca uma reserva específica pelo seu ID
   *
   * Esta função recupera os detalhes de uma única reserva com base no ID fornecido,
   * incluindo os dados relacionados de hóspedes e quartos.
   *
   * @param id ID único da reserva a ser buscada
   * @returns Promise com a reserva encontrada ou null se não existir
   * @throws Erro de console se a operação falhar
   */
  async getBookingById(id: string): Promise<Booking | null> {
    // Consulta a tabela 'bookings' com joins, filtrando pelo ID
    const { data, error } = await supabase
      .from("bookings")
      .select("*, guests(*), rooms(*)")
      .eq("id", id)
      .single();

    // Se ocorrer um erro, registra no console e retorna null
    if (error) {
      console.error("Erro ao buscar reserva:", error);
      return null;
    }

    // Retorna a reserva encontrada
    return data;
  },

  /**
   * Busca apenas as reservas ativas (confirmadas ou com check-in feito)
   *
   * Esta função é útil para visualizar apenas as reservas que estão em andamento
   * ou confirmadas, mas que ainda não tiveram check-out.
   *
   * @returns Promise com um array de reservas ativas com dados relacionados
   * @throws Erro de console se a operação falhar, mas retorna array vazio para evitar quebra de UI
   */
  async getActiveBookings(): Promise<Booking[]> {
    // Consulta a tabela 'bookings' filtrando por status ativos
    const { data, error } = await supabase
      .from("bookings")
      .select("*, guests(*), rooms(*)")
      .in("status", ["Confirmada", "Check-in Feito"])
      .order("check_in");

    // Se ocorrer um erro, registra no console e retorna array vazio
    if (error) {
      console.error("Erro ao buscar reservas ativas:", error);
      return [];
    }

    // Retorna as reservas ativas
    return data;
  },

  /**
   * Adiciona uma nova reserva ao sistema
   *
   * Esta função insere um novo registro de reserva no banco de dados e
   * atualiza automaticamente o status do hóspede relacionado.
   * IMPORTANTE: O quarto permanece "Disponível" até o check-in ser realizado.
   *
   * @param booking Objeto com os dados da reserva a ser adicionada (sem id, created_at e updated_at)
   * @returns Promise com a reserva adicionada (incluindo o ID gerado) ou null se falhar
   * @throws Erro de console se a operação falhar
   */
  async addBooking(
    booking: Omit<Booking, "id" | "created_at" | "updated_at">
  ): Promise<Booking | null> {
    // Insere a nova reserva e retorna o registro completo após a inserção
    const { data, error } = await supabase
      .from("bookings")
      .insert([booking])
      .select()
      .single();

    // Se ocorrer um erro, registra no console e retorna null
    if (error) {
      console.error("Erro ao adicionar reserva:", error);
      return null;
    }

    // CORREÇÃO: Quarto permanece "Disponível" até o check-in
    // O status do quarto só mudará para "Ocupado" durante o check-in

    // Sincroniza automaticamente o status do hóspede baseado nas reservas
    await guestService.syncGuestStatus(booking.guest_id);

    // Retorna a reserva adicionada, incluindo o ID gerado
    return data;
  },

  /**
   * Atualiza o status de uma reserva existente
   *
   * Esta função modifica apenas o status de uma reserva, mantendo as demais
   * propriedades inalteradas. Se o status for alterado para "Check-out Feito",
   * o quarto relacionado terá seu status alterado para "Limpeza" automaticamente.
   *
   * @param id ID único da reserva a ser atualizada
   * @param status Novo status da reserva
   * @returns Promise com boolean indicando sucesso (true) ou falha (false)
   * @throws Erro de console se a operação falhar
   */
  async updateBookingStatus(id: string, status: string): Promise<boolean> {
    // Atualiza apenas o status e o timestamp da reserva com o ID especificado
    const { error } = await supabase
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    // Se ocorrer um erro, registra no console e retorna false
    if (error) {
      console.error("Erro ao atualizar status da reserva:", error);
      return false;
    }

    // Se o status for de check-out, atualiza o status do quarto para limpeza
    if (status === "Check-out Feito") {
      const booking = await this.getBookingById(id);
      if (booking) {
        await roomService.updateRoomStatus(booking.room_id, "Limpeza");
      }
    }

    // Retorna true indicando sucesso
    return true;
  },

  /**
   * Realiza o check-in de uma reserva
   *
   * Esta função executa todo o processo de check-in:
   * 1. Atualiza o status da reserva para "Check-in Feito"
   * 2. Atualiza o status do quarto para "Ocupado"
   * 3. Atualiza o status do hóspede para "Hospedado"
   *
   * @param id ID único da reserva para fazer check-in
   * @returns Promise com boolean indicando sucesso (true) ou falha (false)
   * @throws Erro de console se a operação falhar
   */
  async checkIn(id: string): Promise<boolean> {
    // Atualiza o status da reserva para "Check-in Feito"
    const result = await this.updateBookingStatus(id, "Check-in Feito");

    // Se a atualização da reserva for bem-sucedida, prossegue com as outras atualizações
    if (result) {
      const booking = await this.getBookingById(id);
      if (booking) {
        // Garante que o status do quarto está como "Ocupado"
        await roomService.updateRoomStatus(booking.room_id, "Ocupado");

        // Sincroniza automaticamente o status do hóspede
        await guestService.syncGuestStatus(booking.guest_id);
      }
    }

    // Retorna o resultado da operação
    return result;
  },

  /**
   * Realiza o check-out de uma reserva
   *
   * Esta função executa todo o processo de check-out:
   * 1. Atualiza o status da reserva para "Check-out Feito"
   * 2. Atualiza o status do quarto para "Limpeza" (feito no updateBookingStatus)
   * 3. Atualiza o status do hóspede para "Sem estadia"
   *
   * @param id ID único da reserva para fazer check-out
   * @returns Promise com boolean indicando sucesso (true) ou falha (false)
   * @throws Erro de console se a operação falhar
   */
  async checkOut(id: string): Promise<boolean> {
    // Busca os dados da reserva antes de atualizar (para ter acesso ao guest_id)
    const booking = await this.getBookingById(id);

    // Atualiza o status da reserva para "Check-out Feito"
    // (isso também atualizará o status do quarto para "Limpeza" via updateBookingStatus)
    const result = await this.updateBookingStatus(id, "Check-out Feito");

    // Se a atualização da reserva for bem-sucedida e a reserva existir, atualiza o hóspede
    if (result && booking) {
      // A atualização do status do quarto para limpeza é feita no updateBookingStatus

      // Sincroniza automaticamente o status do hóspede
      await guestService.syncGuestStatus(booking.guest_id);
    }

    // Retorna o resultado da operação
    return result;
  },

  /**
   * Atualiza o status de pagamento de uma reserva
   *
   * Esta função é usada para refletir alterações no status de pagamento,
   * quando um pagamento é processado através do sistema de pagamentos.
   *
   * @param id ID da reserva
   * @param paymentStatus novo status de pagamento
   * @returns Promise com boolean indicando sucesso (true) ou falha (false)
   * @throws Erro de console se a operação falhar
   */
  async updateBookingPaymentStatus(
    id: string,
    paymentStatus: "Pendente" | "Parcial" | "Pago" | "Reembolsado"
  ): Promise<boolean> {
    try {
      // Atualiza apenas o status de pagamento da reserva
      const { error } = await supabase
        .from("bookings")
        .update({
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      // Se ocorrer um erro, registra no console e retorna false
      if (error) {
        console.error(
          "Erro ao atualizar status de pagamento da reserva:",
          error
        );
        return false;
      }

      // Retorna true indicando sucesso
      return true;
    } catch (error) {
      console.error("Erro ao atualizar status de pagamento:", error);
      return false;
    }
  },

  /**
   * Atualiza uma reserva existente e seus detalhes
   *
   * Esta função permite editar as informações da reserva, incluindo datas,
   * valores e informações gerais.
   *
   * @param id ID da reserva a ser atualizada
   * @param bookingData dados da reserva a serem atualizados
   * @returns Promise com a reserva atualizada ou null se falhar
   * @throws Erro de console se a operação falhar
   */
  async updateBooking(
    id: string,
    bookingData: Partial<Booking>
  ): Promise<Booking | null> {
    try {
      // Adiciona timestamp de atualização
      bookingData.updated_at = new Date().toISOString();

      // Atualiza a reserva com os novos dados
      const { data, error } = await supabase
        .from("bookings")
        .update(bookingData)
        .eq("id", id)
        .select("*")
        .single();

      // Se ocorrer um erro, registra no console e retorna null
      if (error) {
        console.error("Erro ao atualizar reserva:", error);
        return null;
      }

      // Retorna a reserva atualizada
      return data;
    } catch (error) {
      console.error("Erro ao atualizar reserva:", error);
      return null;
    }
  },
};
