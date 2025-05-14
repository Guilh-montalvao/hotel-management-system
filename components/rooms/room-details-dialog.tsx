"use client";

import { useState } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarDays,
  User,
  CreditCard,
  Clock,
  Trash2Icon,
  AlertTriangleIcon,
} from "lucide-react";
import { Room } from "@/lib/types";
import { roomService } from "@/lib/services/room-service";

// Interface para dados de estadia
interface StayRecord {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
}

interface RoomDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  onDeleteRoom?: (id: string) => void;
}

export function RoomDetailsDialog({
  open,
  onOpenChange,
  room,
  onDeleteRoom,
}: RoomDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Dados fictícios para o histórico de hospedagem
  const stayRecords: StayRecord[] = [
    {
      id: "RS0012345",
      guestName: "Ricardo Oliveira",
      checkIn: "15/04/2025",
      checkOut: "20/04/2025",
      status: "Ativo",
      paymentStatus: "Parcial",
      totalAmount: 750,
    },
    {
      id: "RS0012344",
      guestName: "Mariana Santos",
      checkIn: "08/04/2025",
      checkOut: "12/04/2025",
      status: "Concluído",
      paymentStatus: "Pago",
      totalAmount: 600,
    },
    {
      id: "RS0012343",
      guestName: "Carlos Pereira",
      checkIn: "01/04/2025",
      checkOut: "05/04/2025",
      status: "Concluído",
      paymentStatus: "Pago",
      totalAmount: 600,
    },
    {
      id: "RS0012342",
      guestName: "Ana Luiza Costa",
      checkIn: "22/03/2025",
      checkOut: "25/03/2025",
      status: "Concluído",
      paymentStatus: "Pago",
      totalAmount: 450,
    },
    {
      id: "RS0012340",
      guestName: "Pedro Silveira",
      checkIn: "15/03/2025",
      checkOut: "20/03/2025",
      status: "Cancelado",
      paymentStatus: "Parcial",
      totalAmount: 300,
    },
  ];

  // Função para atualizar o status do quarto
  const handleStatusChange = async (
    status: "Disponível" | "Ocupado" | "Limpeza"
  ) => {
    if (room) {
      try {
        await roomService.updateRoomStatus(room.id, status);
        // Atualizar o room no estado local (simulando a atualização)
        if (onOpenChange) {
          onOpenChange(false); // Fechar o diálogo para forçar atualização
        }
      } catch (error) {
        console.error("Erro ao atualizar status do quarto:", error);
      }
    }
  };

  // Função para lidar com a exclusão do quarto
  const handleDeleteRoom = () => {
    if (onDeleteRoom && room) {
      onDeleteRoom(room.id);
    }
    setShowDeleteConfirmation(false);
    onOpenChange(false);
  };

  if (!room) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Quarto {room.number}</DialogTitle>
              <Badge
                className={`${
                  room.status === "Disponível"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                    : room.status === "Ocupado"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                }`}
              >
                {room.status}
              </Badge>
            </div>
            <DialogDescription>
              {room.type} - R${room.rate}/diária
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Detalhes do Quarto</TabsTrigger>
              <TabsTrigger value="history">Histórico de Hospedagem</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <img
                  src={
                    room.image_url || "/placeholder.svg?height=300&width=500"
                  }
                  alt={`Quarto ${room.number}`}
                  className="object-cover w-full h-full"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalhes do Quarto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-base font-medium">
                        Informações Básicas
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1 border-b border-muted">
                          <span className="text-muted-foreground">Tipo:</span>
                          <span className="font-medium">{room.type}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-muted">
                          <span className="text-muted-foreground">Tarifa:</span>
                          <span className="font-medium">
                            R${room.rate}/diária
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-muted">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge
                            variant="outline"
                            className={`${
                              room.status === "Disponível"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                                : room.status === "Ocupado"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                            }`}
                          >
                            {room.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-base font-medium">Limpeza</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1 border-b border-muted">
                          <span className="text-muted-foreground">
                            Última atualização:
                          </span>
                          <span className="font-medium">
                            {new Date(room.updated_at).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-2">Descrição</h3>
                    <p className="text-muted-foreground">
                      {room.description || "Sem descrição disponível"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Hospedagem</CardTitle>
                  <CardDescription>
                    Registro de estadias neste quarto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stayRecords.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">
                              {record.guestName}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              record.status === "Ativo"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : record.status === "Concluído"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300"
                            }
                          >
                            {record.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Check-in: {record.checkIn}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Check-out: {record.checkOut}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {record.paymentStatus} - R${record.totalAmount}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {record.status === "Ativo"
                                ? "Em andamento"
                                : "Finalizado"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex items-center justify-between">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirmation(true)}
              className="flex items-center gap-1"
            >
              <Trash2Icon className="h-4 w-4" />
              Excluir quarto
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangleIcon className="h-5 w-5 text-destructive" />
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              {stayRecords.length > 0 ? (
                <>
                  Tem certeza que deseja excluir o quarto {room.number}?{" "}
                  <strong>
                    O histórico de hospedagem também será excluído
                    permanentemente.
                  </strong>{" "}
                  Esta ação não poderá ser desfeita.
                </>
              ) : (
                <>
                  Tem certeza que deseja excluir o quarto {room.number}? Esta
                  ação não poderá ser desfeita.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoom}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
