/**
 * Serviço para manipulação e sincronização de hóspedes no Supabase
 *
 * Este arquivo contém todas as funções relacionadas aos hóspedes,
 * incluindo sincronização automática de status baseado em reservas ativas.
 */

import { supabase } from "../supabase";
import { Guest, Booking } from "../types";

export const guestService = {
  /**
   * Busca todos os hóspedes cadastrados no sistema
   *
   * @returns Promise com um array de hóspedes
   */
  async getAllGuests(): Promise<Guest[]> {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("name");

    if (error) {
      console.error("Erro ao buscar hóspedes:", error);
      return [];
    }

    return data;
  },

  /**
   * Busca um hóspede específico pelo ID
   *
   * @param id ID único do hóspede
   * @returns Promise com o hóspede encontrado ou null se não existir
   */
  async getGuestById(id: string): Promise<Guest | null> {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar hóspede:", error);
      return null;
    }

    return data;
  },

  /**
   * Atualiza o status de um hóspede
   *
   * @param id ID único do hóspede
   * @param status Novo status do hóspede
   * @returns Promise com boolean indicando sucesso
   */
  async updateGuestStatus(id: string, status: string): Promise<boolean> {
    const { error } = await supabase
      .from("guests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar status do hóspede:", error);
      return false;
    }

    return true;
  },

  /**
   * Sincroniza o status de um hóspede baseado em suas reservas ativas
   *
   * Esta função verifica as reservas do hóspede e atualiza seu status automaticamente:
   * - Se tem check-in feito e não tem check-out: "Hospedado"
   * - Se tem reserva mas não tem check-in: "Reservado"
   * - Se não tem reservas ativas: "Sem estadia"
   *
   * @param guestId ID único do hóspede
   * @returns Promise com boolean indicando sucesso
   */
  async syncGuestStatus(guestId: string): Promise<boolean> {
    try {
      // Busca reservas ativas do hóspede
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("guest_id", guestId)
        .in("status", ["Reservado", "Check-in Feito"])
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reservas para sincronização:", error);
        return false;
      }

      let newStatus = "Sem estadia";

      if (bookings && bookings.length > 0) {
        // Verifica se tem alguma reserva com check-in feito
        const hasCheckedIn = bookings.some(
          (booking) => booking.status === "Check-in Feito"
        );

        if (hasCheckedIn) {
          newStatus = "Hospedado";
        } else {
          // Tem reserva mas não fez check-in ainda
          newStatus = "Reservado";
        }
      }

      // Atualiza o status do hóspede
      return await this.updateGuestStatus(guestId, newStatus);
    } catch (error) {
      console.error("Erro na sincronização de status:", error);
      return false;
    }
  },

  /**
   * Sincroniza o status de todos os hóspedes baseado em suas reservas
   *
   * Esta função verifica todos os hóspedes e sincroniza seus status
   * com base em suas reservas ativas. Útil para correção em massa.
   *
   * @returns Promise com número de hóspedes atualizados
   */
  async syncAllGuestStatuses(): Promise<number> {
    try {
      // Busca todos os hóspedes
      const guests = await this.getAllGuests();
      let updatedCount = 0;

      // Processa cada hóspede
      for (const guest of guests) {
        const success = await this.syncGuestStatus(guest.id);
        if (success) {
          updatedCount++;
        }
      }

      console.log(`${updatedCount} hóspedes tiveram status sincronizado`);
      return updatedCount;
    } catch (error) {
      console.error("Erro na sincronização em massa:", error);
      return 0;
    }
  },

  /**
   * Busca hóspedes por status
   *
   * @param status Status dos hóspedes a serem buscados
   * @returns Promise com array de hóspedes
   */
  async getGuestsByStatus(status: string): Promise<Guest[]> {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("status", status)
      .order("name");

    if (error) {
      console.error("Erro ao buscar hóspedes por status:", error);
      return [];
    }

    return data;
  },

  /**
   * Verifica inconsistências de status entre hóspedes e reservas
   *
   * @returns Promise com array de inconsistências encontradas
   */
  async checkStatusInconsistencies(): Promise<any[]> {
    try {
      // Busca hóspedes com suas reservas ativas
      const { data: guestsWithBookings, error } = await supabase
        .from("guests")
        .select(
          `
          id,
          name,
          status,
          bookings!inner(id, status, check_in, check_out)
        `
        )
        .in("bookings.status", ["Reservado", "Check-in Feito"]);

      if (error) {
        console.error("Erro ao verificar inconsistências:", error);
        return [];
      }

      const inconsistencies = [];

      for (const guest of guestsWithBookings || []) {
        const hasCheckedIn = guest.bookings.some(
          (booking: any) => booking.status === "Check-in Feito"
        );
        const hasReservation = guest.bookings.some(
          (booking: any) => booking.status === "Reservado"
        );

        let expectedStatus = "Sem estadia";
        if (hasCheckedIn) {
          expectedStatus = "Hospedado";
        } else if (hasReservation) {
          expectedStatus = "Reservado";
        }

        if (guest.status !== expectedStatus) {
          inconsistencies.push({
            guestId: guest.id,
            guestName: guest.name,
            currentStatus: guest.status,
            expectedStatus,
            bookings: guest.bookings,
          });
        }
      }

      return inconsistencies;
    } catch (error) {
      console.error("Erro ao verificar inconsistências:", error);
      return [];
    }
  },
};
