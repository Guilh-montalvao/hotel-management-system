"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, CheckIcon, ChevronsUpDown } from "lucide-react";
import { useBookingStore } from "@/lib/store";

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

// Lista de hóspedes (normalmente seria buscada da API)
// Em produção, isso seria carregado de uma API ou serviço
const guests = [
  { id: "1", name: "João Silva", email: "joao@exemplo.com" },
  { id: "2", name: "Maria Souza", email: "maria@exemplo.com" },
  { id: "3", name: "Pedro Santos", email: "pedro@exemplo.com" },
  { id: "4", name: "Ana Oliveira", email: "ana@exemplo.com" },
  { id: "5", name: "Carlos Ferreira", email: "carlos@exemplo.com" },
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
  }, [form.watch("guestId")]);

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

  return (
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
                        <CommandInput placeholder="Buscar hóspede..." />
                        <CommandEmpty>Nenhum hóspede encontrado.</CommandEmpty>
                        <CommandGroup>
                          {guests.map((guest) => (
                            <CommandItem
                              key={guest.id}
                              value={guest.id}
                              onSelect={(value) => {
                                form.setValue("guestId", value);
                                setGuestComboboxOpen(false);
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  guest.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {guest.name}
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
                            format(field.value, "dd/MM/yyyy", { locale: ptBR })
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
                            format(field.value, "dd/MM/yyyy", { locale: ptBR })
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
  );
}
