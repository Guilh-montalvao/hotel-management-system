"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  CheckIcon,
  ChevronsUpDown,
  PlusIcon,
} from "lucide-react";
import { useBookingStore, useGuestStore } from "@/lib/store";
import { AddGuestDialog } from "@/components/guests/add-guest-dialog";
import { useSupabase } from "@/hooks/useSupabase";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Definição do schema de validação para o formulário
const formSchema = z
  .object({
    guestId: z.string().min(1, "Hóspede é obrigatório"),
    room: z.string().min(1, "Quarto é obrigatório"),
    checkIn: z.date({
      required_error: "Data de check-in é obrigatória",
    }),
    checkOut: z.date({
      required_error: "Data de check-out é obrigatória",
    }),
    paymentMethod: z.string().min(1, "Método de pagamento é obrigatório"),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "A data de check-out deve ser posterior à data de check-in",
    path: ["checkOut"],
  });

type FormValues = z.infer<typeof formSchema>;

// Métodos de pagamento disponíveis
const paymentMethods = [
  { value: "Cartão de Crédito", label: "Cartão de Crédito" },
  { value: "Cartão de Débito", label: "Cartão de Débito" },
  { value: "PIX", label: "PIX" },
  { value: "Dinheiro", label: "Dinheiro" },
  { value: "Transferência", label: "Transferência" },
];

/**
 * Interface para as propriedades do componente
 */
interface AddBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBooking?: (data: any) => void;
}

export function AddBookingDialog({
  open,
  onOpenChange,
  onAddBooking,
}: AddBookingDialogProps) {
  // Obter o quarto selecionado do store global e a função para limpar
  const { selectedRoom, setSelectedRoom } = useBookingStore();

  // Estado local para controlar se estamos vindo da página de quartos
  const [isComingFromRooms, setIsComingFromRooms] = useState(false);

  // Obter os hóspedes do Supabase
  const { useGuests, useRooms } = useSupabase();
  const {
    data: dbGuests,
    isLoading: isLoadingGuests,
    isError: isErrorGuests,
    addGuest: addGuestToDb,
  } = useGuests();

  // Obter quartos do Supabase
  const {
    data: dbRooms,
    isLoading: isLoadingRooms,
    isError: isErrorRooms,
  } = useRooms();

  // Ainda mantemos referência ao store local para compatibilidade, mas não o usamos para leitura
  const addGuestToStore = useGuestStore((state) => state.addGuest);

  // Estado local para armazenar os hóspedes convertidos
  const [guests, setGuests] = useState<any[]>([]);
  // Estado local para armazenar os quartos disponíveis
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);

  // Estado para controlar o diálogo de adicionar hóspede
  const [showAddGuestDialog, setShowAddGuestDialog] = useState(false);

  // Estado para controlar a abertura do popover de combobox para quartos
  const [roomComboboxOpen, setRoomComboboxOpen] = useState(false);

  // Configuração do formulário com validação
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestId: "",
      room: "", // Começamos sem quarto selecionado para mostrar o placeholder
      paymentMethod: "",
    },
  });

  // Estado para controlar a abertura do popover de combobox para hóspedes
  const [guestComboboxOpen, setGuestComboboxOpen] = useState(false);

  // Efeito para identificar se estamos vindo da página de quartos quando o diálogo abre
  useEffect(() => {
    if (open && selectedRoom) {
      // Se o diálogo está abrindo e há um quarto selecionado, estamos vindo da página de quartos
      setIsComingFromRooms(true);
    } else if (!open) {
      // Resetamos este flag quando o diálogo fecha
      setIsComingFromRooms(false);
    }
  }, [open, selectedRoom]);

  // Efeito para carregar hóspedes do banco de dados
  useEffect(() => {
    if (dbGuests && dbGuests.length > 0) {
      setGuests(dbGuests);
    }
  }, [dbGuests]);

  // Efeito para carregar quartos do banco de dados
  useEffect(() => {
    if (dbRooms && dbRooms.length > 0) {
      // Filtrar apenas quartos disponíveis
      const formattedRooms = dbRooms
        .filter((room) => room.status !== "Ocupado")
        .map((room) => ({
          value: room.number,
          label: `${room.number} - ${room.type}`,
          id: room.id, // Garantir que o ID está explicitamente mapeado
          number: room.number,
          type: room.type,
          rate: room.rate,
          status: room.status,
          ...room, // mantém os dados originais para referência
        }));

      console.log("Quartos formatados:", formattedRooms);
      setAvailableRooms(formattedRooms);
    }
  }, [dbRooms]);

  // Efeito para quando o diálogo abre
  useEffect(() => {
    if (open) {
      // Quando abrimos o diálogo, verificamos se viemos da página de quartos
      if (isComingFromRooms && selectedRoom) {
        // Se viemos da página de quartos, preenchemos o quarto selecionado
        form.setValue("room", selectedRoom.number);
      } else {
        // Se não viemos da página de quartos, garantimos que o campo começa vazio
        form.setValue("room", "");
      }
    }
  }, [open, isComingFromRooms, selectedRoom, form]);

  // Efeito para limpar o formulário quando o diálogo é fechado
  useEffect(() => {
    if (!open) {
      // Limpa o formulário ao fechar
      form.reset({
        guestId: "",
        room: "",
        paymentMethod: "",
      });

      // Limpar o quarto selecionado no store global
      setSelectedRoom(null);
    }
  }, [open, form, setSelectedRoom]);

  // Efeito para preencher o e-mail do hóspede quando selecionado
  useEffect(() => {
    const guestId = form.watch("guestId");
    if (guestId && guests.length > 0) {
      const selectedGuest = guests.find((guest) => guest.id === guestId);
      // Armazenamos o email internamente para uso posterior, mas não exibimos no formulário
    }
  }, [form, guests, form.watch("guestId")]);

  // Função para renderizar a lista de hóspedes
  const renderGuestsList = () => {
    if (isLoadingGuests) {
      return (
        <div className="p-4 text-center">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Carregando hóspedes...
          </div>
        </div>
      );
    }

    if (isErrorGuests) {
      return (
        <div className="p-4 text-center text-red-500">
          Erro ao carregar hóspedes. Tente novamente.
        </div>
      );
    }

    if (guests.length === 0) {
      return (
        <div className="p-4 text-center">
          Nenhum hóspede encontrado. Adicione um novo.
        </div>
      );
    }

    return (
      <CommandGroup>
        {guests.map((guest) => (
          <CommandItem
            key={guest.id}
            value={`${guest.id} ${guest.name} ${guest.cpf || ""}`}
            onSelect={(value) => {
              const guestId = value.split(" ")[0];
              form.setValue("guestId", guestId);
              setGuestComboboxOpen(false);
            }}
            className="flex flex-col items-start py-3"
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <CheckIcon
                  className={cn(
                    "mr-2 h-4 w-4",
                    guest.id === form.watch("guestId")
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-900 mr-2 text-sm font-medium">
                  {guest.name
                    .split(" ")
                    .map((name: string) => name[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{guest.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {guest.cpf || "Sem CPF"}
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  guest.status === "Hospedado"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
                    : guest.status === "Reservado"
                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
                    : guest.status === "Sem estadia"
                    ? "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800"
                    : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800"
                )}
              >
                {guest.status}
              </div>
            </div>
          </CommandItem>
        ))}
      </CommandGroup>
    );
  };

  // Função para renderizar a lista de quartos
  const renderRoomsList = () => {
    if (isLoadingRooms) {
      return (
        <div className="p-4 text-center">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Carregando quartos...
          </div>
        </div>
      );
    }

    if (isErrorRooms) {
      return (
        <div className="p-4 text-center text-red-500">
          Erro ao carregar quartos. Tente novamente.
        </div>
      );
    }

    if (availableRooms.length === 0) {
      return <div className="p-4 text-center">Nenhum quarto disponível.</div>;
    }

    return (
      <CommandGroup>
        {availableRooms.map((room) => (
          <CommandItem
            key={room.value}
            value={`${room.value} ${room.type}`}
            onSelect={(value) => {
              const roomNumber = value.split(" ")[0]; // Extrair apenas o número do quarto
              form.setValue("room", roomNumber);
              setRoomComboboxOpen(false);
            }}
            className="flex flex-col items-start py-3"
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <CheckIcon
                  className={cn(
                    "mr-2 h-4 w-4",
                    room.value === form.watch("room")
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-900 mr-2 text-sm font-medium">
                  {room.number}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{room.type}</div>
                  <div className="text-xs text-muted-foreground">
                    R$ {room.rate?.toFixed(2) || "0,00"} /diária
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  room.status === "Disponível"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
                    : room.status === "Limpeza"
                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
                    : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800"
                )}
              >
                {room.status}
              </div>
            </div>
          </CommandItem>
        ))}
      </CommandGroup>
    );
  };

  // Função para lidar com a submissão do formulário
  const onSubmit = (data: FormValues) => {
    // Obtendo os dados do hóspede selecionado
    const selectedGuest = guests.find((guest) => guest.id === data.guestId);

    if (!selectedGuest) {
      toast.error("Selecione um hóspede válido");
      return;
    }

    // Validar que um quarto foi selecionado
    if (!data.room) {
      toast.error("Selecione um quarto");
      return;
    }

    // Obtendo o quarto selecionado dos dados buscados do Supabase
    const selectedRoomData = availableRooms.find(
      (room) => room.value === data.room
    );

    if (!selectedRoomData) {
      toast.error("Selecione um quarto válido");
      return;
    }

    // Debug para ajudar a entender a estrutura do objeto
    console.log("Dados do quarto selecionado:", selectedRoomData);

    // Formatar datas
    const checkInDate = format(data.checkIn, "yyyy-MM-dd");
    const checkOutDate = format(data.checkOut, "yyyy-MM-dd");

    // Criar objeto para o banco de dados
    const dbBookingData = {
      guest_id: selectedGuest.id,
      // Garantir que estamos usando o ID do quarto, não o número
      room_id: selectedRoomData.id || "",
      check_in: checkInDate,
      check_out: checkOutDate,
      payment_method: data.paymentMethod,
      // Valores padrão
      status: "Reservado",
      payment_status: "Pendente",
      total_amount: selectedRoomData.rate || 0,
    };

    console.log("Dados da reserva a serem enviados:", dbBookingData);

    // Criando um objeto de reserva para exibição no frontend
    const uiBookingData = {
      ...data,
      guestName: selectedGuest.name,
      guestEmail: selectedGuest.email, // Obtém o email diretamente do objeto de hóspede
      checkIn: format(data.checkIn, "dd/MM/yyyy"),
      checkOut: format(data.checkOut, "dd/MM/yyyy"),
      roomType: selectedRoomData.type || "",
    };

    // Chamando a função de callback passada como prop
    // Modificando para enviar apenas um objeto combinado para evitar erro de tipos
    const combinedData = {
      ...dbBookingData,
      ...uiBookingData,
      // Garantir que os campos de UI estejam disponíveis
      originalDbData: dbBookingData,
    };

    onAddBooking?.(combinedData);

    // Limpar o formulário e fechar o diálogo
    form.reset({
      guestId: "",
      room: "",
      paymentMethod: "",
    });

    // Limpar completamente o quarto selecionado no store global
    setSelectedRoom(null);

    // Resetar o flag de origem da página de quartos
    setIsComingFromRooms(false);

    onOpenChange(false);
  };

  // Função para adicionar um novo hóspede
  const handleAddGuest = async (data: any) => {
    try {
      // Converte os dados do formulário para o formato esperado pelo banco
      const guestData = {
        name: `${data.nome} ${data.sobrenome}`,
        email: data.email,
        phone: data.telefone || "",
        cpf: data.cpf || "",
        status: "Sem estadia", // Valor direto conforme esperado pelo banco
        birth_date: data.dataNascimento
          ? new Date(data.dataNascimento).toISOString()
          : null,
        gender: data.genero || "",
        address: data.descricao || "",
      };

      // Adicionar ao banco de dados
      const newDbGuest = await addGuestToDb(guestData);

      // Para compatibilidade, também atualiza o store local
      if (newDbGuest) {
        addGuestToStore({
          name: newDbGuest.name,
          email: newDbGuest.email,
          cpf: newDbGuest.cpf || "",
          status: newDbGuest.status,
          telefone: newDbGuest.phone,
          dataNascimento: newDbGuest.birth_date
            ? new Date(newDbGuest.birth_date)
            : undefined,
          genero: newDbGuest.gender,
          descricao: newDbGuest.address,
        });

        // Incluir o novo hóspede na lista local
        setGuests((prev) => [newDbGuest, ...prev]);

        // Selecionar automaticamente o novo hóspede
        form.setValue("guestId", newDbGuest.id);
      }

      console.log("Novo hóspede adicionado:", newDbGuest);

      // Fecha o diálogo de adicionar hóspede
      setShowAddGuestDialog(false);
    } catch (error) {
      console.error("Erro ao adicionar hóspede:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Reserva</DialogTitle>
            <DialogDescription>
              Preencha os detalhes para criar uma nova reserva.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Campo de seleção de hóspede */}
              <FormField
                control={form.control}
                name="guestId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Nome do Hóspede</FormLabel>
                    <Popover
                      open={guestComboboxOpen}
                      onOpenChange={setGuestComboboxOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={guestComboboxOpen}
                            className="w-full justify-between"
                          >
                            {field.value
                              ? guests.find((guest) => guest.id === field.value)
                                  ?.name
                              : "Selecione um hóspede"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <div className="flex items-center border-b relative">
                            <CommandInput
                              placeholder="Buscar hóspede..."
                              className="flex-1"
                            />
                            <div className="absolute right-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="default"
                                className="px-2 min-w-7 h-7 rounded-full"
                                onClick={() => {
                                  // Fechar o popover atual
                                  setGuestComboboxOpen(false);

                                  // Abrir o diálogo de adicionar hóspede
                                  setShowAddGuestDialog(true);
                                }}
                              >
                                <PlusIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <CommandEmpty>
                            Nenhum hóspede encontrado.
                          </CommandEmpty>
                          {renderGuestsList()}
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo de seleção de quarto - Agora com combobox e pesquisa */}
              <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Quarto</FormLabel>
                    <Popover
                      open={roomComboboxOpen}
                      onOpenChange={setRoomComboboxOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={roomComboboxOpen}
                            className="w-full justify-between"
                          >
                            {field.value ? (
                              <>
                                {availableRooms.find(
                                  (room) => room.value === field.value
                                )?.label || field.value}
                              </>
                            ) : (
                              "Selecione um quarto"
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <div className="flex items-center border-b">
                            <CommandInput
                              placeholder="Buscar quarto..."
                              className="flex-1"
                            />
                          </div>
                          <CommandEmpty>Nenhum quarto encontrado.</CommandEmpty>
                          {renderRoomsList()}
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo de data de check-in */}
              <FormField
                control={form.control}
                name="checkIn"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Check-in</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", {
                                locale: ptBR,
                              })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo de data de check-out */}
              <FormField
                control={form.control}
                name="checkOut"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Check-out</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", {
                                locale: ptBR,
                              })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={ptBR}
                          fromDate={form.getValues("checkIn") || new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo de método de pagamento */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método de pagamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Criar Reserva</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para adicionar novo hóspede */}
      <AddGuestDialog
        open={showAddGuestDialog}
        onOpenChange={setShowAddGuestDialog}
        onAddGuest={handleAddGuest}
      />
    </>
  );
}
