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
import { useBookingStore } from "@/lib/store";
import { useSupabase } from "@/hooks/useSupabase";
import { AddGuestDialog } from "@/components/guests/add-guest-dialog";
import { GuestUI, guestToUI } from "@/lib/types";

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
    guestEmail: z
      .string()
      .email("Email inválido")
      .min(1, "Email é obrigatório"),
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

// Quartos disponíveis (normalmente seria buscado da API)
const availableRooms = [
  { value: "101", label: "101 - Padrão" },
  { value: "102", label: "102 - Padrão" },
  { value: "201", label: "201 - Luxo" },
  { value: "202", label: "202 - Luxo" },
  { value: "301", label: "301 - Suíte" },
  { value: "302", label: "302 - Suíte" },
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
  // Obter o quarto selecionado do store global
  const { selectedRoom } = useBookingStore();

  // Obter os hóspedes do banco de dados Supabase
  const { useGuests } = useSupabase();
  const { data: dbGuests, isLoading, addGuest: addGuestToDb } = useGuests();

  // Estado para armazenar os hóspedes convertidos para o formato UI
  const [guests, setGuests] = useState<GuestUI[]>([]);

  // Estado para controlar o diálogo de adicionar hóspede
  const [showAddGuestDialog, setShowAddGuestDialog] = useState(false);

  // Configuração do formulário com validação
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestId: "",
      guestEmail: "",
      room: selectedRoom?.number || "",
      paymentMethod: "",
    },
  });

  // Estado para controlar a abertura do popover de combobox
  const [guestComboboxOpen, setGuestComboboxOpen] = useState(false);

  // Efeito para converter os dados de hóspedes do banco para o formato UI
  useEffect(() => {
    if (dbGuests) {
      const uiGuests = dbGuests.map(guestToUI);
      setGuests(uiGuests);
    }
  }, [dbGuests]);

  // Efeito para preencher o campo de quarto quando selectedRoom mudar
  useEffect(() => {
    if (selectedRoom) {
      form.setValue("room", selectedRoom.number);
    }
  }, [selectedRoom, form]);

  // Efeito para preencher o e-mail do hóspede quando selecionado
  useEffect(() => {
    const guestId = form.watch("guestId");
    if (guestId) {
      const selectedGuest = guests.find((guest) => guest.id === guestId);
      if (selectedGuest) {
        form.setValue("guestEmail", selectedGuest.email);
      }
    }
  }, [form.watch("guestId"), guests]);

  // Função para lidar com a submissão do formulário
  const onSubmit = (data: FormValues) => {
    // Obtendo os dados do hóspede selecionado
    const selectedGuest = guests.find((guest) => guest.id === data.guestId);

    // Criando um objeto de reserva com os dados do formulário
    const bookingData = {
      ...data,
      guestName: selectedGuest?.name || "",
      checkIn: format(data.checkIn, "dd/MM/yyyy"),
      checkOut: format(data.checkOut, "dd/MM/yyyy"),
      roomType:
        availableRooms
          .find((room) => room.value === data.room)
          ?.label.split(" - ")[1] || "",
    };

    // Chamando a função de callback passada como prop
    onAddBooking?.(bookingData);

    // Resetando o formulário e fechando o diálogo
    form.reset();
    onOpenChange(false);
  };

  // Função para adicionar um novo hóspede
  const handleAddGuest = async (data: any) => {
    // Processando os dados para o formato usado no banco de dados
    const dbGuest = {
      name: `${data.nome} ${data.sobrenome}`,
      email: data.email,
      phone: data.telefone,
      cpf: data.cpf || "",
      status: "Sem estadia", // Valor padrão para novos hóspedes
      birth_date: data.dataNascimento
        ? new Date(data.dataNascimento).toISOString()
        : null,
      gender: data.genero || "",
      address: data.descricao || "",
    };

    try {
      // Adicionar o hóspede ao banco de dados
      const newDbGuest = await addGuestToDb(dbGuest);

      // Converter para formato UI e adicionar ao estado local
      if (newDbGuest) {
        const newUiGuest = guestToUI(newDbGuest);
        setGuests((prev) => [newUiGuest, ...prev]);
      }

      console.log("Novo hóspede adicionado:", newDbGuest);
    } catch (error) {
      console.error("Erro ao adicionar hóspede:", error);
    }

    // Fecha o diálogo de adicionar hóspede
    setShowAddGuestDialog(false);
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
                            {isLoading
                              ? "Carregando hóspedes..."
                              : "Nenhum hóspede encontrado."}
                          </CommandEmpty>
                          <CommandGroup>
                            {guests.map((guest) => (
                              <CommandItem
                                key={guest.id}
                                value={`${guest.id} ${guest.name} ${
                                  guest.cpf || ""
                                }`}
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
                                        guest.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-900 mr-2 text-sm font-medium">
                                      {guest.initials}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium">
                                        {guest.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {guest.cpf || ""}
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className={cn(
                                      "text-xs font-medium px-2 py-1 rounded-full",
                                      guest.status === "Sem estadia"
                                        ? "bg-green-100 text-green-800"
                                        : guest.status === "Reservado"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    )}
                                  >
                                    {guest.status}
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo de email do hóspede */}
              <FormField
                control={form.control}
                name="guestEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo de seleção de quarto */}
              <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quarto</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o quarto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRooms.map((room) => (
                          <SelectItem key={room.value} value={room.value}>
                            {room.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
