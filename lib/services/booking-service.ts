import { supabase } from "../supabase";
import { Booking } from "../types";
import { roomService } from "./room-service";

/**
 * Serviço para manipulação de reservas no Supabase
 */
export const bookingService = {
  /**
   * Busca todas as reservas
   */
  async getAllBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, guests(*), rooms(*)")
      .order("check_in", { ascending: false });

    if (error) {
      console.error("Erro ao buscar reservas:", error);
      return [];
    }

    return data;
  },

  /**
   * Busca uma reserva pelo ID
   */
  async getBookingById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, guests(*), rooms(*)")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar reserva:", error);
      return null;
    }

    return data;
  },

  /**
   * Busca reservas ativas (confirmadas ou com check-in feito)
   */
  async getActiveBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, guests(*), rooms(*)")
      .in("status", ["Confirmada", "Check-in Feito"])
      .order("check_in");

    if (error) {
      console.error("Erro ao buscar reservas ativas:", error);
      return [];
    }

    return data;
  },

  /**
   * Adiciona uma nova reserva
   */
  async addBooking(
    booking: Omit<Booking, "id" | "created_at" | "updated_at">
  ): Promise<Booking | null> {
    const { data, error } = await supabase
      .from("bookings")
      .insert([booking])
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar reserva:", error);
      return null;
    }

    // Atualiza o status do quarto para ocupado
    await roomService.updateRoomStatus(booking.room_id, "Ocupado");

    return data;
  },

  /**
   * Atualiza o status de uma reserva
   */
  async updateBookingStatus(id: string, status: string): Promise<boolean> {
    const { error } = await supabase
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

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

    return true;
  },

  /**
   * Realizar check-in de uma reserva
   */
  async checkIn(id: string): Promise<boolean> {
    const result = await this.updateBookingStatus(id, "Check-in Feito");

    if (result) {
      const booking = await this.getBookingById(id);
      if (booking) {
        await roomService.updateRoomStatus(booking.room_id, "Ocupado");
      }
    }

    return result;
  },

  /**
   * Realizar check-out de uma reserva
   */
  async checkOut(id: string): Promise<boolean> {
    return await this.updateBookingStatus(id, "Check-out Feito");
    // A atualização do status do quarto para limpeza é feita no updateBookingStatus
  },
};
