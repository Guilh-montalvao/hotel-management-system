import { useState, useMemo } from "react";
import { Room } from "@/lib/types";

/**
 * Tipos personalizados para os filtros de quartos
 */
// Tipo para filtro de tipo de quarto
type RoomType = "all" | "solteiro" | "casal";
// Tipo para filtro de status de quarto
type RoomStatus = "all" | "available" | "occupied" | "cleaning";

/**
 * Hook personalizado para gerenciar filtros de quartos
 *
 * Este hook abstrai toda a lógica de filtragem e cálculo de estatísticas dos quartos,
 * evitando que essa lógica fique no componente da página.
 *
 * @param rooms Array de quartos a serem filtrados
 * @returns Objeto contendo estados de filtro, métodos para alterá-los, quartos filtrados e estatísticas
 */
export function useRoomFilters(rooms: Room[]) {
  // Estados para controlar os diferentes filtros
  // Filtro de texto para pesquisa
  const [searchQuery, setSearchQuery] = useState("");
  // Filtro de status (disponível, ocupado, etc.)
  const [statusFilter, setStatusFilter] = useState<RoomStatus>("all");
  // Filtro de tipo (solteiro, casal)
  const [typeFilter, setTypeFilter] = useState<RoomType>("all");

  /**
   * Mapeamento de valores de UI para valores internos do modelo de dados
   */
  // Mapa para converter valores de filtro de tipo em valores do modelo
  const typeMap = {
    solteiro: "Solteiro",
    casal: "Casal",
  };

  // Mapa para converter valores de filtro de status em valores do modelo
  const statusMap = {
    available: "Disponível",
    occupied: "Ocupado",
    cleaning: "Limpeza",
  };

  /**
   * Filtragem de quartos baseada nos filtros selecionados
   * Utiliza useMemo para evitar recálculos desnecessários quando outros estados não relacionados mudam
   */
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Filtra por tipo de quarto (se um tipo específico estiver selecionado)
      if (
        typeFilter !== "all" &&
        room.type !== typeMap[typeFilter as keyof typeof typeMap]
      ) {
        return false;
      }

      // Filtra por status do quarto (se um status específico estiver selecionado)
      if (
        statusFilter !== "all" &&
        room.status !== statusMap[statusFilter as keyof typeof statusMap]
      ) {
        return false;
      }

      // Filtra por texto de pesquisa (número ou descrição do quarto)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        return (
          room.number.toLowerCase().includes(query) ||
          room.description?.toLowerCase().includes(query) ||
          false
        );
      }

      // Se passou por todos os filtros, inclui o quarto nos resultados
      return true;
    });
  }, [rooms, typeFilter, statusFilter, searchQuery]); // Dependências do useMemo

  /**
   * Cálculo de estatísticas dos quartos
   * Também utiliza useMemo para evitar recálculos desnecessários
   */
  const statistics = useMemo(() => {
    return {
      // Total de quartos
      total: rooms.length,
      // Quartos disponíveis
      available: rooms.filter((room) => room.status === "Disponível").length,
      // Quartos ocupados
      occupied: rooms.filter((room) => room.status === "Ocupado").length,
      // Quartos em limpeza
      cleaning: rooms.filter((room) => room.status === "Limpeza").length,
    };
  }, [rooms]); // Recalcula apenas quando a lista de quartos muda

  /**
   * Função para limpar todos os filtros de uma vez
   * Retorna aos valores padrão (sem filtros)
   */
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  // Retorna todos os estados e funções necessários para o componente
  return {
    // Estados e setters para os filtros
    searchQuery, // Texto de pesquisa atual
    setSearchQuery, // Função para atualizar texto de pesquisa
    statusFilter, // Filtro de status atual
    setStatusFilter, // Função para atualizar filtro de status
    typeFilter, // Filtro de tipo atual
    setTypeFilter, // Função para atualizar filtro de tipo
    clearFilters, // Função para limpar todos os filtros

    // Resultados dos cálculos
    filteredRooms, // Lista de quartos após aplicação dos filtros
    statistics, // Estatísticas calculadas a partir dos quartos
  };
}
