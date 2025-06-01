import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Room, Guest } from "./types";

/**
 * Interface que define a estrutura do store de reservas
 * Contém estados e métodos para gerenciar o processo de reserva de quartos
 */
interface BookingStore {
  selectedRoom: Room | null; // Quarto selecionado para reserva
  shouldOpenBookingDialog: boolean; // Controla se o diálogo de reserva deve ser aberto
  setSelectedRoom: (room: Room | null) => void; // Função para atualizar o quarto selecionado
  setShouldOpenBookingDialog: (open: boolean) => void; // Função para controlar a visibilidade do diálogo
}

/**
 * Store Zustand para gerenciar o estado da reserva entre páginas
 *
 * Utiliza o middleware 'persist' para manter o estado no localStorage,
 * permitindo que a seleção de quarto persista entre navegações e recargas da página.
 */
export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      // Estado inicial
      selectedRoom: null, // Nenhum quarto selecionado inicialmente
      shouldOpenBookingDialog: false, // Diálogo de reserva fechado inicialmente

      // Função para atualizar o quarto selecionado
      setSelectedRoom: (room) => set({ selectedRoom: room }),

      // Função para controlar a visibilidade do diálogo de reserva
      setShouldOpenBookingDialog: (open) =>
        set({ shouldOpenBookingDialog: open }),
    }),
    {
      name: "booking-store", // Nome da chave usada no localStorage
    }
  )
);

/**
 * Interface que define a estrutura de um item no store de hóspedes
 * Versão simplificada para uso na UI, diferente do modelo completo do banco de dados
 */
interface GuestStoreItem {
  id: string; // Identificador único do hóspede
  name: string; // Nome completo do hóspede
  email: string; // Email para contato
  cpf: string; // CPF (documento de identificação)
  status: string; // Status do hóspede (Ativo, Pendente, Inativo, etc.)
  telefone?: string; // Número de telefone (opcional)
  dataNascimento?: Date; // Data de nascimento (opcional)
  genero?: string; // Gênero (opcional)
  descricao?: string; // Observações ou notas (opcional)
  nome?: string; // Nome (para separação de nome/sobrenome) (opcional)
  sobrenome?: string; // Sobrenome (opcional)
}

/**
 * Interface que define a estrutura do store de hóspedes
 * Contém estados e métodos para gerenciar hóspedes no sistema
 */
interface GuestStore {
  guests: GuestStoreItem[]; // Lista de hóspedes
  addGuest: (guest: Omit<GuestStoreItem, "id">) => void; // Adicionar novo hóspede
  updateGuest: (id: string, guest: Partial<GuestStoreItem>) => void; // Atualizar hóspede existente
  deleteGuest: (id: string) => void; // Remover hóspede
  getGuestById: (id: string) => GuestStoreItem | undefined; // Buscar hóspede por ID
}

/**
 * Store Zustand para gerenciar o estado de hóspedes
 *
 * Utiliza o middleware 'persist' para manter o estado no localStorage,
 * permitindo que os dados de hóspedes persistam entre navegações e recargas da página.
 *
 * Nota: Em um ambiente de produção, estes dados viriam do banco de dados ao invés de
 * serem armazenados no localStorage, mas esta implementação permite demonstrar
 * o funcionamento do sistema mesmo sem uma conexão de backend ativa.
 */
export const useGuestStore = create<GuestStore>()(
  persist(
    (set, get) => ({
      // Lista inicial de hóspedes de exemplo
      guests: [
        {
          id: "1",
          name: "João Silva",
          email: "joao@exemplo.com",
          cpf: "123.456.789-00",
          status: "Ativo",
        },
        {
          id: "2",
          name: "Maria Souza",
          email: "maria@exemplo.com",
          cpf: "234.567.890-00",
          status: "Ativo",
        },
        {
          id: "3",
          name: "Pedro Santos",
          email: "pedro@exemplo.com",
          cpf: "345.678.901-00",
          status: "Pendente",
        },
        {
          id: "4",
          name: "Ana Oliveira",
          email: "ana@exemplo.com",
          cpf: "456.789.012-00",
          status: "Ativo",
        },
        {
          id: "5",
          name: "Carlos Ferreira",
          email: "carlos@exemplo.com",
          cpf: "567.890.123-00",
          status: "Inativo",
        },
      ],

      // Função para adicionar um novo hóspede
      addGuest: (guest) =>
        set((state) => ({
          // Adiciona o novo hóspede à lista existente, gerando um ID baseado no timestamp atual
          guests: [...state.guests, { ...guest, id: Date.now().toString() }],
        })),

      // Função para atualizar um hóspede existente
      updateGuest: (id, updatedGuest) =>
        set((state) => ({
          // Mapeia a lista de hóspedes, substituindo apenas o que corresponde ao ID
          guests: state.guests.map((guest) =>
            guest.id === id ? { ...guest, ...updatedGuest } : guest
          ),
        })),

      // Função para excluir um hóspede
      deleteGuest: (id) =>
        set((state) => ({
          // Filtra a lista de hóspedes, removendo o que corresponde ao ID
          guests: state.guests.filter((guest) => guest.id !== id),
        })),

      // Função para buscar um hóspede pelo ID
      getGuestById: (id) => {
        // Utiliza a função get() do Zustand para acessar o estado atual
        return get().guests.find((guest) => guest.id === id);
      },
    }),
    {
      name: "guest-storage", // Nome da chave usada no localStorage
    }
  )
);
