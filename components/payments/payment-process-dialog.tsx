"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CheckIcon,
  XIcon,
  AlertTriangleIcon,
  ReceiptIcon,
  CalendarIcon,
  ArrowRightIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { paymentService } from "@/lib/services/payment-service";
import { bookingService } from "@/lib/services/booking-service";

// Schema de validação do formulário
const formSchema = z.object({
  method: z.string().min(1, "Método de pagamento é obrigatório"),
  amount: z.string().refine(
    (value) => {
      const num = parseFloat(value.replace(",", "."));
      return !isNaN(num) && num > 0;
    },
    {
      message: "Valor deve ser maior que zero",
    }
  ),
  payment_date: z.string().optional(),
  notes: z.string().optional(),
});

interface PaymentProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: any;
  onProcessComplete?: () => void;
}

export function PaymentProcessDialog({
  open,
  onOpenChange,
  transaction,
  onProcessComplete,
}: PaymentProcessDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Inicializar formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      method: transaction?.method || "",
      amount: transaction?.amount?.toString() || "",
      payment_date: transaction?.payment_date
        ? format(new Date(transaction.payment_date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      notes: "",
    },
  });

  // Inicializa/atualiza os valores do formulário fora da renderização
  // para evitar setState durante render
  useEffect(() => {
    if (!open || !transaction) return;
    form.reset({
      method: transaction.method || "",
      amount: transaction.amount ? transaction.amount.toString() : "",
      payment_date: transaction.payment_date
        ? format(new Date(transaction.payment_date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      notes: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction]);

  // Função para aprovar o pagamento
  const handleApprovePayment = async () => {
    try {
      setIsSubmitting(true);
      setSelectedAction("approve");

      // Se for uma transação baseada em reserva (pendente/paga), apenas atualizar a reserva
      if (transaction.is_booking_transaction) {
        const formData = form.getValues();

        // Atualizar dados da reserva (método/valor)
        await bookingService.updateBooking(transaction.booking_id, {
          payment_method: formData.method,
          total_amount: parseFloat(formData.amount.replace(",", ".")),
        });

        // Atualizar o status da reserva para refletir o pagamento
        await bookingService.updateBookingPaymentStatus(
          transaction.booking_id,
          "Pago"
        );

        toast.success("Pagamento aprovado com sucesso");
      } else {
        // Atualizar o status de um pagamento existente
        await paymentService.updatePaymentStatus(transaction.id, "Aprovado");

        // Atualizar o status da reserva se existir
        if (transaction.booking_id) {
          await bookingService.updateBookingPaymentStatus(
            transaction.booking_id,
            "Pago"
          );
        }

        toast.success("Pagamento aprovado com sucesso");
      }

      if (onProcessComplete) {
        onProcessComplete();
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao aprovar pagamento:", error);
      toast.error("Erro ao aprovar pagamento");
    } finally {
      setIsSubmitting(false);
      setSelectedAction(null);
    }
  };

  // Função para rejeitar o pagamento
  const handleRejectPayment = async () => {
    try {
      setIsSubmitting(true);
      setSelectedAction("reject");

      // Para transações baseadas em reserva, não criar pagamento; manter pendente
      if (transaction.is_booking_transaction) {
        await bookingService.updateBookingPaymentStatus(
          transaction.booking_id,
          "Pendente"
        );

        toast.success("Pagamento registrado como rejeitado");
      } else {
        // Atualizar o status de um pagamento existente
        await paymentService.updatePaymentStatus(transaction.id, "Rejeitado");

        // Atualizar o status da reserva se existir
        if (transaction.booking_id) {
          await bookingService.updateBookingPaymentStatus(
            transaction.booking_id,
            "Pendente"
          );
        }

        toast.success("Pagamento rejeitado com sucesso");
      }

      if (onProcessComplete) {
        onProcessComplete();
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao rejeitar pagamento:", error);
      toast.error("Erro ao rejeitar pagamento");
    } finally {
      setIsSubmitting(false);
      setSelectedAction(null);
    }
  };

  // Função para estornar o pagamento
  const handleRefundPayment = async () => {
    try {
      setIsSubmitting(true);
      setSelectedAction("refund");

      // Apenas pagamentos aprovados podem ser estornados
      if (transaction.status !== "Aprovado") {
        toast.error("Apenas pagamentos aprovados podem ser estornados");
        return;
      }

      if (transaction.is_booking_transaction) {
        await bookingService.updateBookingPaymentStatus(
          transaction.booking_id,
          "Reembolsado"
        );
      } else {
        await paymentService.updatePaymentStatus(transaction.id, "Estornado");
        if (transaction.booking_id) {
          await bookingService.updateBookingPaymentStatus(
            transaction.booking_id,
            "Reembolsado"
          );
        }
      }

      toast.success("Pagamento estornado com sucesso");

      if (onProcessComplete) {
        onProcessComplete();
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao estornar pagamento:", error);
      toast.error("Erro ao estornar pagamento");
    } finally {
      setIsSubmitting(false);
      setSelectedAction(null);
    }
  };

  // Se não houver transação, não renderiza nada
  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Processar Pagamento</DialogTitle>
          <DialogDescription>
          {transaction.is_booking_transaction
            ? "Registre um novo pagamento para esta reserva."
            : "Atualize o status deste pagamento."}
          </DialogDescription>
        </DialogHeader>

        {/* Detalhes da transação */}
        <div className="space-y-4">
          {/* Detalhes da reserva */}
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Reserva
                </div>
                <Badge variant="outline">
                  {transaction.bookings?.status || "Reservado"}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <div className="font-medium">
                  {transaction.bookings?.guests?.name ||
                    "Hóspede não encontrado"}
                </div>
              </div>
              {transaction.bookings?.check_in && (
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                  {format(new Date(transaction.bookings.check_in), "dd MMM", {
                    locale: ptBR,
                  })}
                  <ArrowRightIcon className="h-3 w-3 mx-1" />
                  {format(new Date(transaction.bookings.check_out), "dd MMM", {
                    locale: ptBR,
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulário de pagamento */}
          <Form {...form}>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="payment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Pagamento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </form>
          </Form>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <div className="flex space-x-2">
            {/* Botões condicionais com base no status atual */}
            {transaction.status !== "Rejeitado" && (
              <Button
                variant="destructive"
                onClick={handleRejectPayment}
                disabled={isSubmitting && selectedAction !== "reject"}
              >
                {isSubmitting && selectedAction === "reject" ? (
                  "Processando..."
                ) : (
                  <>
                    <XIcon className="mr-2 h-4 w-4" />
                    Rejeitar
                  </>
                )}
              </Button>
            )}

            {transaction.status !== "Estornado" &&
              transaction.status === "Aprovado" && (
                <Button
                  variant="outline"
                  onClick={handleRefundPayment}
                  disabled={isSubmitting && selectedAction !== "refund"}
                >
                  {isSubmitting && selectedAction === "refund" ? (
                    "Processando..."
                  ) : (
                    <>
                      <AlertTriangleIcon className="mr-2 h-4 w-4" />
                      Estornar
                    </>
                  )}
                </Button>
              )}

            {(transaction.status === "Pendente" ||
              transaction.status === "Processando" ||
              transaction.is_pending_booking) && (
              <Button
                onClick={handleApprovePayment}
                disabled={isSubmitting && selectedAction !== "approve"}
              >
                {isSubmitting && selectedAction === "approve" ? (
                  "Processando..."
                ) : (
                  <>
                    <CheckIcon className="mr-2 h-4 w-4" />
                    Aprovar
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
