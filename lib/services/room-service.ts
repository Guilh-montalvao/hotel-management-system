/**
 * Serviço para manipulação de quartos no Supabase
 *
 * Este arquivo contém todas as funções relacionadas às operações CRUD
 * (Create, Read, Update, Delete) para a entidade Quarto no banco de dados.
 *
 * O serviço abstrai a complexidade das chamadas à API do Supabase,
 * fornecendo uma interface limpa e padronizada para os componentes.
 */

import { supabase } from "../supabase";
import { Room } from "../types";

/**
 * Objeto que contém todos os métodos para manipulação de quartos
 * Implementado como um objeto para facilitar a organização e possível
 * substituição por uma implementação alternativa no futuro.
 */
export const roomService = {
  /**
   * Busca todos os quartos cadastrados no sistema
   *
   * Esta função recupera todos os quartos do banco de dados,
   * ordenados pelo número do quarto.
   *
   * @returns Promise com um array de quartos
   * @throws Erro de console se a operação falhar, mas retorna array vazio para evitar quebra de UI
   */
  async getAllRooms(): Promise<Room[]> {
    // Consulta a tabela 'rooms' e ordena os resultados pelo número do quarto
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("number");

    // Se ocorrer um erro, registra no console e retorna array vazio
    if (error) {
      console.error("Erro ao buscar quartos:", error);
      return [];
    }

    // Retorna os dados recuperados
    return data;
  },

  /**
   * Busca um quarto específico pelo seu ID
   *
   * Esta função recupera os detalhes de um único quarto com base no ID fornecido.
   *
   * @param id ID único do quarto a ser buscado
   * @returns Promise com o quarto encontrado ou null se não existir
   * @throws Erro de console se a operação falhar
   */
  async getRoomById(id: string): Promise<Room | null> {
    // Consulta a tabela 'rooms' filtrando pelo ID e espera um único resultado
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", id)
      .single();

    // Se ocorrer um erro, registra no console e retorna null
    if (error) {
      console.error("Erro ao buscar quarto:", error);
      return null;
    }

    // Retorna o quarto encontrado
    return data;
  },

  /**
   * Atualiza o status de um quarto existente
   *
   * Esta função modifica apenas o status de um quarto, mantendo as demais
   * propriedades inalteradas. Também atualiza o campo updated_at automaticamente.
   *
   * @param id ID único do quarto a ser atualizado
   * @param status Novo status do quarto (Disponível, Ocupado ou Limpeza)
   * @returns Promise com boolean indicando sucesso (true) ou falha (false)
   * @throws Erro de console se a operação falhar
   */
  async updateRoomStatus(
    id: string,
    status: "Disponível" | "Ocupado" | "Limpeza"
  ): Promise<boolean> {
    // Atualiza apenas o status e o timestamp do quarto com o ID especificado
    const { error } = await supabase
      .from("rooms")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    // Se ocorrer um erro, registra no console e retorna false
    if (error) {
      console.error("Erro ao atualizar status do quarto:", error);
      return false;
    }

    // Retorna true indicando sucesso
    return true;
  },

  /**
   * Adiciona um novo quarto ao sistema
   *
   * Esta função insere um novo registro de quarto no banco de dados.
   * Os campos id, created_at e updated_at são gerados automaticamente pelo Supabase.
   *
   * @param room Objeto com os dados do quarto a ser adicionado (sem id, created_at e updated_at)
   * @returns Promise com o quarto adicionado (incluindo o ID gerado) ou null se falhar
   * @throws Erro de console se a operação falhar
   */
  async addRoom(
    room: Omit<Room, "id" | "created_at" | "updated_at">
  ): Promise<Room | null> {
    // Insere o novo quarto e retorna o registro completo após a inserção
    const { data, error } = await supabase
      .from("rooms")
      .insert([room])
      .select()
      .single();

    // Se ocorrer um erro, registra no console e retorna null
    if (error) {
      console.error("Erro ao adicionar quarto:", error);
      return null;
    }

    // Retorna o quarto adicionado, incluindo o ID gerado
    return data;
  },

  /**
   * Remove um quarto do sistema pelo ID
   *
   * Esta função exclui permanentemente um quarto do banco de dados.
   * ATENÇÃO: Esta operação não pode ser desfeita.
   *
   * @param id ID único do quarto a ser excluído
   * @returns Promise com boolean indicando sucesso (true) ou falha (false)
   * @throws Erro de console se a operação falhar
   */
  async deleteRoom(id: string): Promise<boolean> {
    // Exclui o quarto com o ID especificado
    const { error } = await supabase.from("rooms").delete().eq("id", id);

    // Se ocorrer um erro, registra no console e retorna false
    if (error) {
      console.error("Erro ao excluir quarto:", error);
      return false;
    }

    // Retorna true indicando sucesso
    return true;
  },
};
