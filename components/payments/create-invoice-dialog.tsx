"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
import { paymentService } from "@/lib/services/payment-service";
import { bookingService } from "@/lib/services/booking-service";
import { PDFService } from "@/lib/services/pdf-service";

// Schema de validação do formulário
const formSchema = z.object({
  booking_id: z.string().min(1, "Reserva é obrigatória"),
  amount: z.string().refine(
    (value) => {
      const num = parseFloat(value.replace(",", "."));
      return !isNaN(num) && num > 0;
    },
    {
      message: "Valor deve ser maior que zero",
    }
  ),
  method: z.string().min(1, "Método de pagamento é obrigatório"),
  payment_date: z.string().optional(),
  status: z.string().default("Processando"),
  notes: z.string().optional(),
});

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateComplete?: () => void;
}

export function CreateInvoiceDialog({
  open,
  onOpenChange,
  onCreateComplete,
}: CreateInvoiceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      booking_id: "",
      amount: "",
      method: "",
      payment_date: format(new Date(), "yyyy-MM-dd"),
      status: "Processando",
      notes: "",
    },
  });

  // Buscar reservas com pagamentos pendentes
  useEffect(() => {
    const fetchPendingBookings = async () => {
      if (open) {
        try {
          setIsLoading(true);
          // Buscar reservas com status de pagamento pendente
          const { data: bookings, error } = await supabase
            .from("bookings")
            .select("*, guests(*), rooms(*)")
            .eq("payment_status", "Pendente")
            .order("created_at", { ascending: false });

          if (error) throw error;
          setPendingBookings(bookings || []);

          // Se não houver reservas pendentes, mostrar toast
          if (!bookings || bookings.length === 0) {
            toast.info("Não há reservas com pagamentos pendentes");
          }
        } catch (error) {
          console.error("Erro ao buscar reservas pendentes:", error);
          toast.error("Erro ao carregar reservas pendentes");
          setPendingBookings([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPendingBookings();
  }, [open]);

  // Ao selecionar uma reserva, preenche o valor automaticamente
  const handleBookingChange = (bookingId: string) => {
    const selectedBooking = pendingBookings.find((b) => b.id === bookingId);
    if (selectedBooking && selectedBooking.total_amount) {
      form.setValue("amount", selectedBooking.total_amount.toString());
    } else {
      form.setValue("amount", "");
    }
  };

  // Handler para criar fatura
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Converter valor para número
      const amount = parseFloat(values.amount.replace(",", "."));

      // Criar objeto de pagamento
      const payment = {
        booking_id: values.booking_id,
        amount,
        method: values.method,
        status: values.status as
          | "Processando"
          | "Aprovado"
          | "Rejeitado"
          | "Estornado",
        payment_date:
          values.payment_date || new Date().toISOString().split("T")[0],
      };

      // Adicionar pagamento
      const newPayment = await paymentService.addPayment(payment);

      if (!newPayment) {
        throw new Error("Erro ao criar fatura");
      }

      // Atualizar status da reserva com base no status do pagamento
      if (values.status === "Aprovado") {
        await bookingService.updateBookingPaymentStatus(
          values.booking_id,
          "Pago"
        );
      } else {
        // Para pagamentos processando, manter como pendente até aprovação
        await bookingService.updateBookingPaymentStatus(
          values.booking_id,
          "Pendente"
        );
      }

      // Gerar PDF da fatura se solicitado
      const selectedBooking = pendingBookings.find(
        (b) => b.id === values.booking_id
      );
      if (selectedBooking) {
        // Construir objeto de transação para o PDF
        const transactionForPdf = {
          ...newPayment,
          bookings: selectedBooking,
        };

        // Gerar PDF
        PDFService.generateFinancialReport([transactionForPdf]);
      }

      toast.success("Fatura criada com sucesso!");

      if (onCreateComplete) {
        onCreateComplete();
      }

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Erro ao criar fatura:", error);
      toast.error("Erro ao criar fatura");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Fatura</DialogTitle>
          <DialogDescription>
            Crie uma nova fatura para uma reserva pendente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div>Carregando reservas pendentes...</div>
            </div>
          ) : pendingBookings.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center text-muted-foreground">
                <p>Não há reservas com pagamentos pendentes.</p>
                <p className="text-sm mt-2">
                  Todas as reservas já possuem faturas criadas.
                </p>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Seleção de Reserva */}
                <FormField
                  control={form.control}
                  name="booking_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reserva</FormLabel>
                      <Select
                        disabled={isSubmitting}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleBookingChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a reserva" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pendingBookings.map((booking) => (
                            <SelectItem key={booking.id} value={booking.id}>
                              {booking.guests?.name} - Quarto{" "}
                              {booking.rooms?.number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Método de Pagamento */}
                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de Pagamento</FormLabel>
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
                            <SelectItem value="Cartão de Crédito">
                              Cartão de Crédito
                            </SelectItem>
                            <SelectItem value="Cartão de Débito">
                              Cartão de Débito
                            </SelectItem>
                            <SelectItem value="PIX">PIX</SelectItem>
                            <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="Transferência">
                              Transferência
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Valor */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor (R$)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0,00"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Data de Pagamento */}
                  <FormField
                    control={form.control}
                    name="payment_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data do Pagamento</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          disabled={isSubmitting}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Processando">
                              Processando
                            </SelectItem>
                            <SelectItem value="Aprovado">Aprovado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Observações */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observações sobre o pagamento (opcional)"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Botões de ação */}
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
                    {isSubmitting ? "Processando..." : "Criar Fatura"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
