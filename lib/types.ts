/**
 * Arquivo de definição dos tipos principais do sistema de gerenciamento de hotel
 *
 * Este arquivo contém:
 * - Interfaces para o banco de dados Supabase
 * - Tipos para as tabelas do banco de dados
 * - Tipos para as respostas do Supabase
 * - Tipos para formulários de UI
 * - Tipos adaptados para o front-end
 * - Funções para converter entre formatos de banco e UI
 */

/**
 * Interface principal que define a estrutura do banco de dados Supabase
 * Serve como contrato entre a aplicação e o banco de dados
 */
export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: Room; // Estrutura da linha completa
        Insert: Omit<Room, "id" | "created_at" | "updated_at">; // Estrutura para inserção (sem campos automáticos)
        Update: Partial<Omit<Room, "id" | "created_at" | "updated_at">>; // Estrutura para atualização (parcial e sem campos automáticos)
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
      /**
       * Função RPC do Supabase para verificar a disponibilidade de um quarto em um período específico
       */
      check_room_availability: {
        Args: {
          room_id: string; // ID do quarto a verificar
          check_in_date: string; // Data de check-in no formato ISO
          check_out_date: string; // Data de check-out no formato ISO
        };
        Returns: boolean; // true se disponível, false se não
      };
      /**
       * Função RPC do Supabase para calcular o valor total de uma reserva
       */
      calculate_booking_total: {
        Args: {
          room_id: string; // ID do quarto
          check_in_date: string; // Data de check-in no formato ISO
          check_out_date: string; // Data de check-out no formato ISO
        };
        Returns: number; // Valor total da reserva em reais
      };
    };
  };
}

/**
 * Interfaces para as tabelas do banco de dados
 * Cada interface representa a estrutura exata de uma tabela no Supabase
 */

/**
 * Interface que representa um quarto no hotel
 */
export interface Room {
  id: string; // Identificador único do quarto
  number: string; // Número do quarto (ex: "101")
  type: "Solteiro" | "Casal"; // Tipo de quarto
  status: "Disponível" | "Ocupado" | "Limpeza"; // Status atual do quarto
  rate: number; // Valor da diária em reais
  description: string | null; // Descrição do quarto
  image_url: string | null; // URL da imagem do quarto
  created_at: string; // Data de criação no formato ISO
  updated_at: string; // Data da última atualização no formato ISO
}

/**
 * Interface que representa um hóspede no sistema
 */
export interface Guest {
  id: string; // Identificador único do hóspede
  name: string; // Nome completo do hóspede
  email: string; // Email para contato
  phone: string | null; // Telefone para contato
  cpf: string | null; // CPF (documento de identificação brasileiro)
  status: "Sem estadia" | "Reservado" | "Hospedado"; // Status atual do hóspede
  birth_date: string | null; // Data de nascimento no formato ISO
  gender: string | null; // Gênero do hóspede
  address: string | null; // Endereço completo
  nationality?: string; // País de origem
  preferences?: string[]; // Lista de preferências do hóspede
  created_at: string; // Data de criação no formato ISO
  updated_at: string; // Data da última atualização no formato ISO
}

/**
 * Interface que representa uma reserva no sistema
 */
export interface Booking {
  id: string; // Identificador único da reserva
  guest_id: string; // ID do hóspede (chave estrangeira)
  room_id: string; // ID do quarto (chave estrangeira)
  check_in: string; // Data de check-in no formato ISO
  check_out: string; // Data de check-out no formato ISO
  status: "Reservado" | "Check-in Feito" | "Check-out Feito" | "Cancelada"; // Status da reserva
  payment_status: string; // Status do pagamento
  payment_method: string | null; // Método de pagamento
  total_amount: number | null; // Valor total da reserva
  created_at: string; // Data de criação no formato ISO
  updated_at: string; // Data da última atualização no formato ISO

  // Propriedades relacionais (para junções no Supabase)
  guests?: Guest; // Dados do hóspede relacionado
  rooms?: Room; // Dados do quarto relacionado
}

/**
 * Interface que representa um pagamento no sistema
 */
export interface Payment {
  id: string; // Identificador único do pagamento
  booking_id: string; // ID da reserva (chave estrangeira)
  amount: number; // Valor do pagamento
  method: string; // Método de pagamento (PIX, Cartão, etc.)
  status: "Processando" | "Aprovado" | "Rejeitado" | "Estornado"; // Status do pagamento
  payment_date: string | null; // Data em que o pagamento foi realizado
  created_at: string; // Data de criação no formato ISO
  updated_at: string; // Data da última atualização no formato ISO
}

/**
 * Interface que representa uma preferência de estadia de um hóspede
 */
export interface StayPreference {
  id: string; // Identificador único da preferência
  guest_id: string; // ID do hóspede (chave estrangeira)
  preference_type: string; // Tipo de preferência (ex: "Travesseiro")
  preference_value: string; // Valor da preferência (ex: "Extra macio")
  created_at: string; // Data de criação no formato ISO
}

/**
 * Tipo que representa a resposta de uma consulta do Supabase
 * Usado para padronizar a manipulação de erros e dados
 *
 * @template T Tipo de dados esperado na resposta
 */
export type SupabaseQueryResponse<T> = {
  data: T | null; // Dados retornados (ou null se houver erro)
  error: Error | null; // Erro (ou null se sucesso)
};

/**
 * Interfaces para os formulários de UI
 * Estas interfaces são usadas para tipar os dados nos formulários da aplicação
 */

/**
 * Interface para o formulário de cadastro/edição de quarto
 */
export interface RoomFormData {
  number: string; // Número do quarto
  type: "Solteiro" | "Casal"; // Tipo de quarto
  rate: number; // Valor da diária
  description: string; // Descrição do quarto
  image_url?: string; // URL da imagem (opcional)
}

/**
 * Interface para o formulário de cadastro/edição de hóspede
 */
export interface GuestFormData {
  name: string; // Nome completo
  email: string; // Email
  phone?: string; // Telefone (opcional)
  cpf?: string; // CPF (opcional)
  status: "Ativo" | "Pendente" | "Inativo"; // Status
  birth_date?: string; // Data de nascimento (opcional)
  gender?: string; // Gênero (opcional)
  address?: string; // Endereço (opcional)
}

/**
 * Interface para o formulário de cadastro/edição de reserva
 */
export interface BookingFormData {
  guest_id: string; // ID do hóspede
  room_id: string; // ID do quarto
  check_in: string; // Data de check-in
  check_out: string; // Data de check-out
  status: "Reservado" | "Check-in Feito" | "Check-out Feito" | "Cancelada"; // Status
  payment_status: string; // Status do pagamento
  payment_method?: string; // Método de pagamento (opcional)
  total_amount?: number; // Valor total (opcional)
}

/**
 * Interface para o formulário de cadastro/edição de pagamento
 */
export interface PaymentFormData {
  booking_id: string; // ID da reserva
  amount: number; // Valor do pagamento
  method: string; // Método de pagamento
  status: "Processando" | "Aprovado" | "Rejeitado" | "Estornado"; // Status
  payment_date?: string; // Data do pagamento (opcional)
}

/**
 * Interface para o formulário de cadastro/edição de preferência de estadia
 */
export interface StayPreferenceFormData {
  guest_id: string; // ID do hóspede
  preference_type: string; // Tipo de preferência
  preference_value: string; // Valor da preferência
}

/**
 * Interfaces adaptadas para o front-end
 * Estas interfaces são otimizadas para uso nos componentes da UI,
 * contendo dados formatados e/ou calculados
 */

/**
 * Interface do quarto adaptada para a UI
 */
export interface RoomUI {
  id: string; // Identificador único
  number: string; // Número do quarto
  type: "Solteiro" | "Casal"; // Tipo de quarto
  status: "Disponível" | "Ocupado" | "Limpeza"; // Status atual
  rate: number; // Valor da diária
  description: string; // Descrição (nunca null na UI)
  image?: string; // URL da imagem (opcional)
}

/**
 * Interface do hóspede adaptada para a UI
 */
export interface GuestUI {
  id: string; // Identificador único
  name: string; // Nome completo
  initials: string; // Iniciais para avatar (ex: "JS" para "João Silva")
  avatar?: string; // URL do avatar (opcional)
  email: string; // Email
  phone: string; // Telefone (nunca null na UI)
  status: "Hospedado" | "Reservado" | "Sem estadia"; // Status atual
  birthDate?: string; // Data de nascimento formatada (opcional)
  cpf?: string; // CPF (opcional)
  genero?: string; // Gênero (opcional)
  endereco?: string; // Endereço (opcional)
  nationality: string; // Nacionalidade
  lastStay: string; // Data da última hospedagem
  totalStays: number; // Total de hospedagens
  preferences: string[]; // Lista de preferências
}

/**
 * Interface da reserva adaptada para a UI
 */
export interface BookingUI {
  id: string; // Identificador único
  guestName: string; // Nome do hóspede
  guestEmail: string; // Email do hóspede
  guestAvatar?: string; // URL do avatar do hóspede (opcional)
  guestInitials: string; // Iniciais do hóspede para avatar
  room: string; // Número do quarto
  roomType: string; // Tipo do quarto
  checkIn: string; // Data de check-in formatada
  checkOut: string; // Data de check-out formatada
  status: "Reservado" | "Check-in Feito" | "Check-out Feito" | "Cancelada"; // Status
  paymentStatus: string; // Status do pagamento
  paymentMethod: string; // Método de pagamento
}

/**
 * Funções para converter entre formatos de banco e UI
 * Estas funções transformam os dados brutos do banco em formatos
 * mais amigáveis para uso na interface do usuário
 */

/**
 * Converte um quarto do formato do banco para o formato da UI
 * @param room Objeto de quarto do banco de dados
 * @returns Objeto de quarto formatado para a UI
 */
export const roomToUI = (room: Room): RoomUI => ({
  id: room.id,
  number: room.number,
  type: room.type,
  status: room.status,
  rate: room.rate,
  description: room.description || "", // Converte null para string vazia
  image: room.image_url || undefined, // Converte null para undefined
});

/**
 * Converte um hóspede do formato do banco para o formato da UI
 * @param guest Objeto de hóspede do banco de dados
 * @returns Objeto de hóspede formatado para a UI
 */
export const guestToUI = (guest: Guest): GuestUI => {
  // Extrai iniciais do nome para uso no avatar
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

/**
 * Converte uma reserva do formato do banco para o formato da UI
 * @param booking Objeto de reserva do banco de dados
 * @param guest Objeto de hóspede relacionado
 * @param room Objeto de quarto relacionado
 * @returns Objeto de reserva formatado para a UI
 */
export const bookingToUI = (
  booking: Booking,
  guest: Guest,
  room: Room
): BookingUI => {
  // Extrai iniciais do nome para uso no avatar
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
