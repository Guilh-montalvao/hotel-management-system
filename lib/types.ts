// Tipos para o banco de dados Supabase
export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: Room;
        Insert: Omit<Room, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Room, "id" | "created_at" | "updated_at">>;
      };
      guests: {
        Row: Guest;
        Insert: Omit<Guest, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Guest, "id" | "created_at" | "updated_at">>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Booking, "id" | "created_at" | "updated_at">>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Payment, "id" | "created_at" | "updated_at">>;
      };
      stay_preferences: {
        Row: StayPreference;
        Insert: Omit<StayPreference, "id" | "created_at">;
        Update: Partial<Omit<StayPreference, "id" | "created_at">>;
      };
    };
    Functions: {
      check_room_availability: {
        Args: {
          room_id: string;
          check_in_date: string;
          check_out_date: string;
        };
        Returns: boolean;
      };
      calculate_booking_total: {
        Args: {
          room_id: string;
          check_in_date: string;
          check_out_date: string;
        };
        Returns: number;
      };
    };
  };
}

// Tipos para as tabelas do banco de dados

export interface Room {
  id: string;
  number: string;
  type: "Solteiro" | "Casal";
  status: "Disponível" | "Ocupado" | "Limpeza";
  rate: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  status: "Sem estadia" | "Reservado" | "Hospedado";
  birth_date: string | null;
  gender: string | null;
  address: string | null;
  nationality?: string;
  preferences?: string[];
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  guest_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  status: "Reservado" | "Check-in Feito" | "Check-out Feito" | "Cancelada";
  payment_status: string;
  payment_method: string | null;
  total_amount: number | null;
  created_at: string;
  updated_at: string;

  // Propriedades relacionais
  guests?: Guest;
  rooms?: Room;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  method: string;
  status: "Processando" | "Aprovado" | "Rejeitado" | "Estornado";
  payment_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface StayPreference {
  id: string;
  guest_id: string;
  preference_type: string;
  preference_value: string;
  created_at: string;
}

// Tipos para as respostas do Supabase
export type SupabaseQueryResponse<T> = {
  data: T | null;
  error: Error | null;
};

// Tipos de UI para formulários

export interface RoomFormData {
  number: string;
  type: "Solteiro" | "Casal";
  rate: number;
  description: string;
  image_url?: string;
}

export interface GuestFormData {
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  status: "Ativo" | "Pendente" | "Inativo";
  birth_date?: string;
  gender?: string;
  address?: string;
}

export interface BookingFormData {
  guest_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  status: "Reservado" | "Check-in Feito" | "Check-out Feito" | "Cancelada";
  payment_status: string;
  payment_method?: string;
  total_amount?: number;
}

export interface PaymentFormData {
  booking_id: string;
  amount: number;
  method: string;
  status: "Processando" | "Aprovado" | "Rejeitado" | "Estornado";
  payment_date?: string;
}

export interface StayPreferenceFormData {
  guest_id: string;
  preference_type: string;
  preference_value: string;
}

// Tipos adaptados para o front-end

export interface RoomUI {
  id: string;
  number: string;
  type: "Solteiro" | "Casal";
  status: "Disponível" | "Ocupado" | "Limpeza";
  rate: number;
  description: string;
  image?: string;
}

export interface GuestUI {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  email: string;
  phone: string;
  status: "Hospedado" | "Reservado" | "Sem estadia";
  birthDate?: string;
  cpf?: string;
  genero?: string;
  endereco?: string;
  nationality: string;
  lastStay: string;
  totalStays: number;
  preferences: string[];
}

export interface BookingUI {
  id: string;
  guestName: string;
  guestEmail: string;
  guestAvatar?: string;
  guestInitials: string;
  room: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: "Reservado" | "Check-in Feito" | "Check-out Feito" | "Cancelada";
  paymentStatus: string;
  paymentMethod: string;
}

// Funções para converter entre formatos de banco e UI

export const roomToUI = (room: Room): RoomUI => ({
  id: room.id,
  number: room.number,
  type: room.type,
  status: room.status,
  rate: room.rate,
  description: room.description || "",
  image: room.image_url || undefined,
});

export const guestToUI = (guest: Guest): GuestUI => {
  const nameParts = guest.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

  return {
    id: guest.id,
    name: guest.name,
    initials,
    email: guest.email,
    phone: guest.phone || "",
    status: guest.status,
    birthDate: guest.birth_date || undefined,
    cpf: guest.cpf || undefined,
    genero: guest.gender || undefined,
    endereco: guest.address || undefined,
    nationality: guest.nationality || "Brasil",
    lastStay: "", // Precisaria ser calculado a partir do histórico de reservas
    totalStays: 0, // Precisaria ser calculado a partir do histórico de reservas
    preferences: guest.preferences || [],
  };
};

export const bookingToUI = (
  booking: Booking,
  guest: Guest,
  room: Room
): BookingUI => {
  const nameParts = guest.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

  return {
    id: booking.id,
    guestName: guest.name,
    guestEmail: guest.email,
    guestInitials: initials,
    room: room.number,
    roomType: room.type,
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    status: booking.status,
    paymentStatus: booking.payment_status,
    paymentMethod: booking.payment_method || "Não informado",
  };
};
