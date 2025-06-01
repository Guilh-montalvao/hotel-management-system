import { useState, useEffect, useCallback } from "react";
import { Room } from "@/lib/types";
import { roomService } from "@/lib/services/room-service";

/**
 * Hook personalizado para gerenciar operações relacionadas a quartos
 *
 * Este hook abstrai toda a lógica de gerenciamento de quartos, incluindo:
 * - Buscar todos os quartos do banco de dados
 * - Adicionar novos quartos
 * - Excluir quartos existentes
 * - Gerenciar estados de carregamento e erros
 *
 * @returns Objeto contendo os quartos, estados e funções para manipulá-los
 */
export function useRooms() {
  // Estado para armazenar a lista de quartos
  const [rooms, setRooms] = useState<Room[]>([]);
  // Estado para controlar quando a operação está em andamento
  const [isLoading, setIsLoading] = useState(true);
  // Estado para armazenar erros que possam ocorrer
  const [error, setError] = useState<Error | null>(null);

  /**
   * Função para buscar todos os quartos do banco de dados
   * Esta função é memorizada com useCallback para evitar recriações desnecessárias
   */
  const fetchRooms = useCallback(async () => {
    // Indica que o carregamento começou
    setIsLoading(true);
    try {
      // Tenta buscar os quartos do serviço
      const fetchedRooms = await roomService.getAllRooms();
      // Atualiza o estado com os quartos obtidos
      setRooms(fetchedRooms);
      // Limpa qualquer erro anterior
      setError(null);
    } catch (err) {
      // Em caso de erro, armazena-o no estado
      setError(
        err instanceof Error ? err : new Error("Erro ao buscar quartos")
      );
      console.error("Erro ao buscar quartos:", err);
    } finally {
      // Independente do resultado, finaliza o estado de carregamento
      setIsLoading(false);
    }
  }, []);

  /**
   * Função para adicionar um novo quarto
   * @param roomData Dados do novo quarto a ser criado (sem id e campos de data)
   * @returns Objeto indicando o sucesso da operação e dados adicionais
   */
  const addRoom = useCallback(
    async (roomData: Omit<Room, "id" | "created_at" | "updated_at">) => {
      try {
        // Tenta adicionar o quarto através do serviço
        const newRoom = await roomService.addRoom(roomData);
        if (newRoom) {
          // Se bem-sucedido, atualiza a lista de quartos
          await fetchRooms();
          // Retorna sucesso junto com o quarto criado
          return { success: true, room: newRoom };
        }
        // Se não conseguiu adicionar, retorna falha
        return { success: false, error: "Falha ao adicionar quarto" };
      } catch (err) {
        // Em caso de exceção, registra o erro e retorna falha
        console.error("Erro ao adicionar quarto:", err);
        return {
          success: false,
          error:
            err instanceof Error ? err.message : "Erro ao adicionar quarto",
        };
      }
    },
    [fetchRooms] // Depende da função fetchRooms
  );

  /**
   * Função para excluir um quarto pelo ID
   * @param id ID do quarto a ser excluído
   * @returns Objeto indicando o sucesso da operação
   */
  const deleteRoom = useCallback(
    async (id: string) => {
      try {
        // Tenta excluir o quarto através do serviço
        const success = await roomService.deleteRoom(id);
        if (success) {
          // Se bem-sucedido, atualiza a lista de quartos
          await fetchRooms();
          return { success: true };
        }
        // Se não conseguiu excluir, retorna falha
        return { success: false, error: "Falha ao excluir quarto" };
      } catch (err) {
        // Em caso de exceção, registra o erro e retorna falha
        console.error("Erro ao excluir quarto:", err);
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao excluir quarto",
        };
      }
    },
    [fetchRooms] // Depende da função fetchRooms
  );

  // Efeito que carrega os quartos na montagem do componente
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Retorna todos os estados e funções necessários para o componente
  return {
    rooms, // Lista de quartos
    isLoading, // Estado de carregamento
    error, // Erro, se houver
    fetchRooms, // Função para buscar quartos
    addRoom, // Função para adicionar quarto
    deleteRoom, // Função para excluir quarto
  };
}
