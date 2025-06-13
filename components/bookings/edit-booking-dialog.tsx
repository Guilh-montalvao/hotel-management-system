"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { bookingService } from "@/lib/services/booking-service";
import { Booking } from "@/lib/types";

// Métodos de pagamento disponíveis
const paymentMethods = [
  { value: "Cartão de Crédito", label: "Cartão de Crédito" },
  { value: "Cartão de Débito", label: "Cartão de Débito" },
  { value: "PIX", label: "PIX" },
  { value: "Dinheiro", label: "Dinheiro" },
  { value: "Transferência", label: "Transferência" },
];

// Status de pagamento disponíveis
const paymentStatuses = [
  { value: "Pendente", label: "Pendente" },
  { value: "Parcial", label: "Parcial" },
  { value: "Pago", label: "Pago" },
  { value: "Reembolsado", label: "Reembolsado" },
];

// Schema de validação para o formulário
const formSchema = z.object({
  guest_id: z.string().min(1, "Hóspede é obrigatório"),
  room_id: z.string().min(1, "Quarto é obrigatório"),
  check_in: z.date({
    required_error: "Data de check-in é obrigatória",
  }),
  check_out: z.date({
    required_error: "Data de check-out é obrigatória",
  }),
  payment_status: z.string().min(1, "Status de pagamento é obrigatório"),
  payment_method: z.string().min(1, "Método de pagamento é obrigatório"),
  total_amount: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking;
  onUpdateBooking?: (data: any) => void;
}

export function EditBookingDialog({
  open,
  onOpenChange,
  booking,
  onUpdateBooking,
}: EditBookingDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guests, setGuests] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<any>(null);
  const [stayPeriod, setStayPeriod] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  // Inicializar formulário com os dados da reserva
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guest_id: booking?.guest_id || "",
      room_id: booking?.room_id || "",
      check_in: booking?.check_in ? new Date(booking.check_in) : new Date(),
      check_out: booking?.check_out
        ? new Date(booking.check_out)
        : addDays(new Date(), 1),
      payment_status: booking?.payment_status || "Pendente",
      payment_method: booking?.payment_method || "",
      total_amount: booking?.total_amount
        ? booking.total_amount.toString()
        : "",
      notes: booking?.notes || "",
    },
  });

  // Carregar dados necessários quando o diálogo for aberto
  useEffect(() => {
    if (open) {
      // Carregar hóspedes e quartos
      loadGuestsAndRooms();

      // Preparar valores da reserva para edição
      form.reset({
        guest_id: booking?.guest_id || "",
        room_id: booking?.room_id || "",
        check_in: booking?.check_in ? new Date(booking.check_in) : new Date(),
        check_out: booking?.check_out
          ? new Date(booking.check_out)
          : addDays(new Date(), 1),
        payment_status: booking?.payment_status || "Pendente",
        payment_method: booking?.payment_method || "",
        total_amount: booking?.total_amount
          ? booking.total_amount.toString()
          : "",
        notes: booking?.notes || "",
      });

      // Iniciar cálculos
      if (booking) {
        const checkIn = booking.check_in
          ? new Date(booking.check_in)
          : new Date();
        const checkOut = booking.check_out
          ? new Date(booking.check_out)
          : addDays(new Date(), 1);
        calculateStayDetails(checkIn, checkOut, booking.room_id);
      }
    }
  }, [open, booking, form]);

  // Carregar hóspedes e quartos do banco de dados
  const loadGuestsAndRooms = async () => {
    try {
      setIsLoading(true);

      // Buscar hóspedes
      const { data: guestsData, error: guestsError } = await supabase
        .from("guests")
        .select("*")
        .order("name");

      if (guestsError) throw guestsError;

      // Buscar quartos
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("*")
        .order("number");

      if (roomsError) throw roomsError;

      setGuests(guestsData || []);

      // Filtrar quartos: apenas mostrar quartos livres ou o quarto atual da reserva
      const filteredRooms =
        roomsData?.filter(
          (room) => room.status === "Disponível" || room.id === booking.room_id
        ) || [];

      setRooms(filteredRooms);

      // Buscar detalhes do quarto selecionado
      if (booking?.room_id) {
        const roomDetails = roomsData?.find((r) => r.id === booking.room_id);
        setSelectedRoomDetails(roomDetails);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular detalhes da estadia (período e valor total)
  const calculateStayDetails = (
    checkIn: Date,
    checkOut: Date,
    roomId: string
  ) => {
    // Calcular o número de diárias
    const days = Math.max(1, differenceInDays(checkOut, checkIn));
    setStayPeriod(days);

    // Calcular o valor total se tivermos o quarto selecionado
    const roomDetails =
      rooms.find((r) => r.id === roomId) || selectedRoomDetails;
    if (roomDetails && roomDetails.price_per_night) {
      const total = days * roomDetails.price_per_night;
      setTotalValue(total);
      form.setValue("total_amount", total.toString());
    }
  };

  // Observadores para alterações nas datas e quarto selecionado
  useEffect(() => {
    const checkIn = form.watch("check_in");
    const checkOut = form.watch("check_out");
    const roomId = form.watch("room_id");

    if (checkIn && checkOut && roomId) {
      calculateStayDetails(checkIn, checkOut, roomId);
    }
  }, [form.watch("check_in"), form.watch("check_out"), form.watch("room_id")]);

  // Handler de alteração de quarto
  const handleRoomChange = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    setSelectedRoomDetails(room);

    // Recalcular valor total
    const checkIn = form.getValues("check_in");
    const checkOut = form.getValues("check_out");
    if (checkIn && checkOut && room) {
      calculateStayDetails(checkIn, checkOut, roomId);
    }
  };

  // Salvar alterações
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      // Construir o objeto com os dados da reserva
      const bookingData = {
        guest_id: values.guest_id,
        room_id: values.room_id,
        check_in: values.check_in.toISOString(),
        check_out: values.check_out.toISOString(),
        payment_status: values.payment_status,
        payment_method: values.payment_method,
        total_amount: values.total_amount
          ? parseFloat(values.total_amount)
          : totalValue,
        notes: values.notes,
      };

      // Atualizar a reserva
      const updatedBooking = await bookingService.updateBooking(
        booking.id,
        bookingData
      );

      if (!updatedBooking) {
        throw new Error("Erro ao atualizar reserva");
      }

      toast.success("Reserva atualizada com sucesso!");

      // Fechar diálogo e notificar o componente pai
      if (onUpdateBooking) {
        onUpdateBooking(updatedBooking);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar reserva:", error);
      toast.error("Erro ao atualizar reserva");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Reserva</DialogTitle>
          <DialogDescription>
            Modifique os detalhes da reserva. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campos da esquerda */}
              <div className="space-y-4">
                {/* Campo de seleção de hóspede */}
                <FormField
                  control={form.control}
                  name="guest_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hóspede *</FormLabel>
                      <Select
                        disabled={isSubmitting || isLoading}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o hóspede" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {guests.map((guest) => (
                            <SelectItem key={guest.id} value={guest.id}>
                              {guest.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo de seleção do quarto */}
                <FormField
                  control={form.control}
                  name="room_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quarto *</FormLabel>
                      <Select
                        disabled={isSubmitting || isLoading}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleRoomChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o quarto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.number} - {room.type} (R${" "}
                              {room.price_per_night}/noite)
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
                  name="check_in"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Check-in *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isSubmitting}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
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
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
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
                  name="check_out"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Check-out *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isSubmitting}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
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
                            disabled={(date) =>
                              date <=
                              new Date(
                                form.getValues("check_in") ||
                                  new Date().setHours(0, 0, 0, 0)
                              )
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Campos da direita */}
              <div className="space-y-4">
                {/* Status de pagamento */}
                <FormField
                  control={form.control}
                  name="payment_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status de Pagamento *</FormLabel>
                      <Select
                        disabled={isSubmitting}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Método de pagamento */}
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pagamento *</FormLabel>
                      <Select
                        disabled={isSubmitting}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o método" />
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

                {/* Valor total */}
                <FormField
                  control={form.control}
                  name="total_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Total (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="0.00"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Observações */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observações sobre a reserva"
                          className="resize-none h-[104px]"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Resumo da estadia */}
            {form.watch("check_in") && form.watch("check_out") && (
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                <div className="text-sm">
                  <span className="font-medium">Período da estadia:</span>{" "}
                  {stayPeriod} diárias
                </div>
                {selectedRoomDetails && (
                  <div className="text-sm">
                    <span className="font-medium">Valor total estimado:</span>{" "}
                    R$ {totalValue.toFixed(2)}
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
