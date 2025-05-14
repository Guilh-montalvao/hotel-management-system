import { supabase } from "../supabase";
import { Room } from "../types";

/**
 * Serviço para manipulação de quartos no Supabase
 */
export const roomService = {
  /**
   * Busca todos os quartos
   */
  async getAllRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("number");

    if (error) {
      console.error("Erro ao buscar quartos:", error);
      return [];
    }

    return data;
  },

  /**
   * Busca um quarto pelo ID
   */
  async getRoomById(id: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar quarto:", error);
      return null;
    }

    return data;
  },

  /**
   * Atualiza o status de um quarto
   */
  async updateRoomStatus(
    id: string,
    status: "Disponível" | "Ocupado" | "Limpeza"
  ): Promise<boolean> {
    const { error } = await supabase
      .from("rooms")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar status do quarto:", error);
      return false;
    }

    return true;
  },

  /**
   * Adiciona um novo quarto
   */
  async addRoom(
    room: Omit<Room, "id" | "created_at" | "updated_at">
  ): Promise<Room | null> {
    const { data, error } = await supabase
      .from("rooms")
      .insert([room])
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar quarto:", error);
      return null;
    }

    return data;
  },

  /**
   * Remove um quarto pelo ID
   */
  async deleteRoom(id: string): Promise<boolean> {
    const { error } = await supabase.from("rooms").delete().eq("id", id);

    if (error) {
      console.error("Erro ao excluir quarto:", error);
      return false;
    }

    return true;
  },
};
