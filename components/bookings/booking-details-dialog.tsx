"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  BedDoubleIcon,
  UserIcon,
  ClockIcon,
  CreditCardIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  InfoIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

interface BookingDetailsDialogProps {
  booking: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckIn?: (bookingId: string) => void;
  onCheckOut?: (bookingId: string) => void;
}

export function BookingDetailsDialog({
  booking,
  open,
  onOpenChange,
  onCheckIn,
  onCheckOut,
}: BookingDetailsDialogProps) {
  if (!booking) return null;

  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Reservado":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800";
      case "Check-in Feito":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800";
      case "Check-out Feito":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800";
      case "Cancelada":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalhes da Reserva</DialogTitle>
          <DialogDescription>
            Informações completas sobre a reserva
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cabeçalho com status da reserva */}
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={`px-3 py-1 text-sm ${getStatusColor(booking.status)}`}
            >
              {booking.status}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Reserva criada em {booking.createdAt || "12/06/2023"}
            </div>
          </div>

          {/* Informações do hóspede */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={booking.guestAvatar} alt={booking.guestName} />
              <AvatarFallback>{booking.guestInitials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-lg font-semibold">{booking.guestName}</div>
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MailIcon className="mr-1 h-3.5 w-3.5" />
                  {booking.guestEmail}
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="mr-1 h-3.5 w-3.5" />
                  {booking.guestPhone || "(11) 98765-4321"}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Grid com informações principais */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Check-in
              </div>
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                <span className="font-medium">{booking.checkIn}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                A partir das 14:00
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Check-out
              </div>
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                <span className="font-medium">{booking.checkOut}</span>
              </div>
              <div className="text-sm text-muted-foreground">Até às 12:00</div>
            </div>
          </div>

          {/* Informações sobre o quarto */}
          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="bg-muted p-3 rounded-lg">
                <BedDoubleIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">
                  Quarto {booking.room}
                </CardTitle>
                <CardDescription>{booking.roomType}</CardDescription>
              </div>
              <div className="text-right">
                <div className="font-medium text-lg">
                  R$ {booking.totalAmount || "450,00"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {booking.nights || "3"}{" "}
                  {booking.nights === 1 ? "diária" : "diárias"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de pagamento */}
          <div>
            <h3 className="text-base font-medium mb-3">Pagamento</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Status
                </div>
                <div className="flex items-center">
                  <CreditCardIcon className="mr-2 h-4 w-4 text-primary" />
                  <span className="font-medium">{booking.paymentStatus}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Método
                </div>
                <div className="flex items-center">
                  <CreditCardIcon className="mr-2 h-4 w-4 text-primary" />
                  <span className="font-medium">{booking.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Observações, se existirem */}
          {booking.notes && (
            <div className="space-y-2">
              <h3 className="text-base font-medium">Observações</h3>
              <div className="bg-muted p-3 rounded-lg text-sm">
                {booking.notes}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <div className="flex space-x-2">
            {/* Botões condicionais baseados no status */}
            {booking.status === "Reservado" && onCheckIn && (
              <Button variant="default" onClick={() => onCheckIn(booking.id)}>
                <CheckIcon className="mr-2 h-4 w-4" />
                Fazer Check-in
              </Button>
            )}
            {booking.status === "Check-in Feito" && onCheckOut && (
              <Button variant="default" onClick={() => onCheckOut(booking.id)}>
                <XIcon className="mr-2 h-4 w-4" />
                Fazer Check-out
              </Button>
            )}
            <Button variant="outline">Editar Reserva</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
