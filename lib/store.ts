import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Room {
  number: string;
  type: "Solteiro" | "Casal";
  status: "Disponível" | "Ocupado" | "Limpeza";
  rate: number;
  description: string;
  image?: string;
}

interface BookingStore {
  selectedRoom: Room | null;
  shouldOpenBookingDialog: boolean;
  setSelectedRoom: (room: Room | null) => void;
  setShouldOpenBookingDialog: (open: boolean) => void;
  resetBookingState: () => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  selectedRoom: null,
  shouldOpenBookingDialog: false,
  setSelectedRoom: (room) => set({ selectedRoom: room }),
  setShouldOpenBookingDialog: (open) => set({ shouldOpenBookingDialog: open }),
  resetBookingState: () =>
    set({ selectedRoom: null, shouldOpenBookingDialog: false }),
}));

// Interface para o hóspede
export interface Guest {
  id: string;
  name: string;
  email: string;
  cpf: string;
  status: string;
  telefone?: string;
  dataNascimento?: Date;
  genero?: string;
  descricao?: string;
  nome?: string;
  sobrenome?: string;
}

// Interface para o gerenciador de estado de hóspedes
interface GuestStore {
  guests: Guest[];
  addGuest: (guest: Omit<Guest, "id">) => void;
  updateGuest: (id: string, guest: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  getGuestById: (id: string) => Guest | undefined;
}

// Criação do store persistente para hóspedes
export const useGuestStore = create<GuestStore>()(
  persist(
    (set, get) => ({
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
      addGuest: (guest) =>
        set((state) => ({
          guests: [...state.guests, { ...guest, id: Date.now().toString() }],
        })),
      updateGuest: (id, updatedGuest) =>
        set((state) => ({
          guests: state.guests.map((guest) =>
            guest.id === id ? { ...guest, ...updatedGuest } : guest
          ),
        })),
      deleteGuest: (id) =>
        set((state) => ({
          guests: state.guests.filter((guest) => guest.id !== id),
        })),
      getGuestById: (id) => {
        return get().guests.find((guest) => guest.id === id);
      },
    }),
    {
      name: "guest-storage", // nome usado para o localStorage
    }
  )
);
