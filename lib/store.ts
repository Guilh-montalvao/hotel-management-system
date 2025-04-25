import { create } from "zustand";

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
