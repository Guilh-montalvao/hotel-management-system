import { useState } from "react";
import { Room } from "@/lib/types";
import { roomService } from "@/lib/services/room-service";

/**
 * Interface que define o resultado de uma operação assíncrona
 * Utilizada para padronizar o retorno das chamadas de serviço
 *
 * @template T Tipo de dados retornado pela operação (opcional)
 */
interface OperationResult<T = void> {
  data?: T; // Dados retornados pela operação (se bem-sucedida)
  error?: string; // Mensagem de erro (se a operação falhar)
  isLoading: boolean; // Indicador se a operação está em andamento
}

/**
 * Hook personalizado para abstrair as chamadas ao serviço de quartos
 *
 * Este hook cria uma camada de abstração entre os componentes e o serviço,
 * fornecendo um padrão consistente para gerenciar estados de carregamento e erros.
 * Isso reduz o acoplamento entre a UI e a camada de serviço.
 *
 * @returns Objeto contendo métodos para interagir com o serviço e estados associados
 */
export function useRoomService() {
  /**
   * Estados para armazenar os resultados de cada tipo de operação
   * Cada operação tem seu próprio estado para permitir controle independente
   */
  // Estado para a operação de buscar todos os quartos
  const [fetchRoomsResult, setFetchRoomsResult] = useState<
    OperationResult<Room[]>
  >({
    isLoading: false,
  });

  // Estado para a operação de buscar um quarto específico
  const [fetchRoomResult, setFetchRoomResult] = useState<OperationResult<Room>>(
    {
      isLoading: false,
    }
  );

  // Estado para a operação de atualizar o status de um quarto
  const [updateStatusResult, setUpdateStatusResult] = useState<
    OperationResult<boolean>
  >({
    isLoading: false,
  });

  // Estado para a operação de adicionar um quarto
  const [addRoomResult, setAddRoomResult] = useState<OperationResult<Room>>({
    isLoading: false,
  });

  // Estado para a operação de excluir um quarto
  const [deleteRoomResult, setDeleteRoomResult] = useState<
    OperationResult<boolean>
  >({
    isLoading: false,
  });

  /**
   * Busca todos os quartos do serviço
   * @returns Array com todos os quartos disponíveis
   */
  const getAllRooms = async () => {
    // Atualiza o estado para indicar que a operação está em andamento
    setFetchRoomsResult({ isLoading: true });
    try {
      // Chama o serviço para buscar os quartos
      const rooms = await roomService.getAllRooms();
      // Atualiza o estado com os quartos recebidos
      setFetchRoomsResult({ data: rooms, isLoading: false });
      return rooms;
    } catch (error) {
      // Em caso de erro, formata a mensagem apropriadamente
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao buscar quartos";
      // Atualiza o estado com o erro
      setFetchRoomsResult({ error: errorMessage, isLoading: false });
      // Retorna um array vazio como fallback
      return [];
    }
  };

  /**
   * Busca um quarto específico pelo ID
   * @param id ID do quarto a ser buscado
   * @returns O quarto encontrado ou null se não existir
   */
  const getRoomById = async (id: string) => {
    // Atualiza o estado para indicar que a operação está em andamento
    setFetchRoomResult({ isLoading: true });
    try {
      // Chama o serviço para buscar o quarto pelo ID
      const room = await roomService.getRoomById(id);
      // Atualiza o estado com o quarto recebido
      setFetchRoomResult({ data: room || undefined, isLoading: false });
      return room;
    } catch (error) {
      // Em caso de erro, formata a mensagem apropriadamente
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao buscar quarto";
      // Atualiza o estado com o erro
      setFetchRoomResult({ error: errorMessage, isLoading: false });
      // Retorna null como fallback
      return null;
    }
  };

  /**
   * Atualiza o status de um quarto
   * @param id ID do quarto a ser atualizado
   * @param status Novo status do quarto
   * @returns Boolean indicando se a operação foi bem-sucedida
   */
  const updateRoomStatus = async (
    id: string,
    status: "Disponível" | "Ocupado" | "Limpeza"
  ) => {
    // Atualiza o estado para indicar que a operação está em andamento
    setUpdateStatusResult({ isLoading: true });
    try {
      // Chama o serviço para atualizar o status
      const success = await roomService.updateRoomStatus(id, status);
      // Atualiza o estado com o resultado da operação
      setUpdateStatusResult({ data: success, isLoading: false });
      return success;
    } catch (error) {
      // Em caso de erro, formata a mensagem apropriadamente
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao atualizar status";
      // Atualiza o estado com o erro
      setUpdateStatusResult({ error: errorMessage, isLoading: false });
      // Retorna false como fallback
      return false;
    }
  };

  /**
   * Adiciona um novo quarto
   * @param room Dados do quarto a ser adicionado
   * @returns O quarto adicionado ou null se a operação falhar
   */
  const addRoom = async (
    room: Omit<Room, "id" | "created_at" | "updated_at">
  ) => {
    // Atualiza o estado para indicar que a operação está em andamento
    setAddRoomResult({ isLoading: true });
    try {
      // Chama o serviço para adicionar o quarto
      const newRoom = await roomService.addRoom(room);
      // Atualiza o estado com o quarto adicionado
      setAddRoomResult({ data: newRoom || undefined, isLoading: false });
      return newRoom;
    } catch (error) {
      // Em caso de erro, formata a mensagem apropriadamente
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao adicionar quarto";
      // Atualiza o estado com o erro
      setAddRoomResult({ error: errorMessage, isLoading: false });
      // Retorna null como fallback
      return null;
    }
  };

  /**
   * Remove um quarto pelo ID
   * @param id ID do quarto a ser removido
   * @returns Boolean indicando se a operação foi bem-sucedida
   */
  const deleteRoom = async (id: string) => {
    // Atualiza o estado para indicar que a operação está em andamento
    setDeleteRoomResult({ isLoading: true });
    try {
      // Chama o serviço para excluir o quarto
      const success = await roomService.deleteRoom(id);
      // Atualiza o estado com o resultado da operação
      setDeleteRoomResult({ data: success, isLoading: false });
      return success;
    } catch (error) {
      // Em caso de erro, formata a mensagem apropriadamente
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao excluir quarto";
      // Atualiza o estado com o erro
      setDeleteRoomResult({ error: errorMessage, isLoading: false });
      // Retorna false como fallback
      return false;
    }
  };

  // Retorna todas as funções e estados necessários
  return {
    // Métodos para interação com o serviço
    getAllRooms, // Buscar todos os quartos
    getRoomById, // Buscar um quarto específico
    updateRoomStatus, // Atualizar status de um quarto
    addRoom, // Adicionar um novo quarto
    deleteRoom, // Excluir um quarto

    // Estados das operações para controle na UI
    fetchRoomsResult, // Estado da operação de buscar todos os quartos
    fetchRoomResult, // Estado da operação de buscar um quarto
    updateStatusResult, // Estado da operação de atualizar status
    addRoomResult, // Estado da operação de adicionar quarto
    deleteRoomResult, // Estado da operação de excluir quarto
  };
}
