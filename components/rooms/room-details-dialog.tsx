"use client";

/**
 * Componente de Diálogo de Detalhes do Quarto
 *
 * Este componente exibe informações detalhadas sobre um quarto específico,
 * incluindo suas características, status atual e histórico de hospedagem.
 * Permite também gerenciar ações como exclusão do quarto e visualização
 * de histórico de reservas.
 */

import { useState, useEffect } from "react";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Interface para representar os dados de uma estadia/hospedagem
 * Contém informações como identificação, dados do hóspede, datas e status de pagamento
 */
interface StayRecord {
  id: string; // Identificador único da estadia
  guestName: string; // Nome do hóspede
  checkIn: string; // Data de entrada (formato DD/MM/YYYY)
  checkOut: string; // Data de saída (formato DD/MM/YYYY)
  status: string; // Status da estadia (Ativo, Concluído, Cancelado)
  paymentStatus: string; // Status do pagamento (Pago, Parcial, Pendente)
  totalAmount: number; // Valor total da estadia em reais
}

/**
 * Interface que define as propriedades do componente de diálogo de detalhes do quarto
 */
interface RoomDetailsDialogProps {
  open: boolean; // Controla se o diálogo está aberto
  onOpenChange: (open: boolean) => void; // Função chamada quando o estado de abertura muda
  room: Room | null; // Objeto com dados do quarto selecionado
  onDeleteRoom?: (id: string) => void; // Função opcional para exclusão do quarto
}

/**
 * Componente RoomDetailsDialog
 *
 * Exibe um diálogo modal com informações detalhadas de um quarto e seu histórico
 * de hospedagem. Permite navegar entre abas de detalhes e histórico, além de
 * realizar ações como exclusão do quarto.
 *
 * @param props - Propriedades do componente conforme RoomDetailsDialogProps
 */
export function RoomDetailsDialog({
  open,
  onOpenChange,
  room,
  onDeleteRoom,
}: RoomDetailsDialogProps) {
  // Estado para controlar qual aba está ativa (detalhes ou histórico)
  const [activeTab, setActiveTab] = useState("details");

  // Estado para controlar a visibilidade do diálogo de confirmação de exclusão
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Estado para armazenar o histórico real de hospedagem
  const [stayRecords, setStayRecords] = useState<StayRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  /**
   * Efeito para carregar o histórico de hospedagem quando o quarto mudar
   */
  useEffect(() => {
    const loadRoomHistory = async () => {
      if (!room || !open) return;

      setIsLoadingHistory(true);
      try {
        // Buscar histórico do quarto usando o roomService
        const history = await roomService.getRoomHistory(room.id);

        // Converter dados do banco para o formato da UI
        const convertedHistory: StayRecord[] = history.map((booking: any) => {
          // Mapear status do banco para status da UI
          const getUIStatus = (dbStatus: string) => {
            switch (dbStatus) {
              case "Reservado":
                return "Ativo";
              case "Check-in Feito":
                return "Ativo";
              case "Check-out Feito":
                return "Concluído";
              case "Cancelada":
                return "Cancelado";
              default:
                return "Ativo";
            }
          };

          // Mapear status de pagamento
          const getPaymentStatus = (paymentStatus: string) => {
            switch (paymentStatus) {
              case "Pago":
                return "Pago";
              case "Pendente":
                return "Pendente";
              case "Parcial":
                return "Parcial";
              default:
                return "Pendente";
            }
          };

          return {
            id: booking.id,
            guestName: booking.guests?.name || "Hóspede não encontrado",
            checkIn: format(new Date(booking.check_in), "dd/MM/yyyy", {
              locale: ptBR,
            }),
            checkOut: format(new Date(booking.check_out), "dd/MM/yyyy", {
              locale: ptBR,
            }),
            status: getUIStatus(booking.status),
            paymentStatus: getPaymentStatus(booking.payment_status),
            totalAmount: booking.total_amount || 0,
          };
        });

        setStayRecords(convertedHistory);
      } catch (error) {
        console.error("Erro ao carregar histórico do quarto:", error);
        setStayRecords([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadRoomHistory();
  }, [room, open]);

  /**
   * Função para atualizar o status do quarto
   *
   * Chama o serviço de quarto para alterar o status e fecha o diálogo após a operação,
   * forçando uma atualização dos dados quando o diálogo for reaberto
   *
   * @param status - Novo status do quarto (Disponível, Ocupado ou Limpeza)
   */
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

  /**
   * Função para lidar com a exclusão do quarto
   *
   * Executa a função de callback para exclusão, fecha o diálogo de confirmação
   * e também o diálogo principal de detalhes
   */
  const handleDeleteRoom = () => {
    if (onDeleteRoom && room) {
      onDeleteRoom(room.id);
    }
    setShowDeleteConfirmation(false);
    onOpenChange(false);
  };

  // Se não houver quarto selecionado, não renderiza nada
  if (!room) return null;

  return (
    <>
      {/* Diálogo principal com detalhes do quarto */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="md">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Quarto {room.number}</DialogTitle>
              {/* Badge para exibir o status do quarto com cores contextuais */}
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

          {/* Sistema de abas para organizar o conteúdo */}
          <Tabs defaultValue="details" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Detalhes do Quarto</TabsTrigger>
              <TabsTrigger value="history">Histórico de Hospedagem</TabsTrigger>
            </TabsList>

            {/* Conteúdo da aba de detalhes */}
            <TabsContent value="details" className="space-y-4 mt-4">
              {/* Imagem do quarto */}
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <img
                  src={
                    room.image_url || "/placeholder.svg?height=300&width=500"
                  }
                  alt={`Quarto ${room.number}`}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Card com detalhes do quarto */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalhes do Quarto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coluna de informações básicas */}
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

                    {/* Coluna de informações de limpeza */}
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

                  {/* Seção de descrição */}
                  <div>
                    <h3 className="text-base font-medium mb-2">Descrição</h3>
                    <p className="text-muted-foreground">
                      {room.description || "Sem descrição disponível"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Conteúdo da aba de histórico de hospedagem */}
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
                    {/* Estado de carregamento */}
                    {isLoadingHistory ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="text-muted-foreground">
                          Carregando histórico...
                        </div>
                      </div>
                    ) : stayRecords.length === 0 ? (
                      /* Mensagem quando não há histórico */
                      <div className="flex items-center justify-center p-8">
                        <div className="text-muted-foreground">
                          Nenhuma hospedagem registrada para este quarto
                        </div>
                      </div>
                    ) : (
                      /* Mapeia os registros de hospedagem para exibição */
                      stayRecords.map((record) => (
                        <div key={record.id} className="border rounded-lg p-4">
                          <div className="flex justify-between">
                            {/* Informações do hóspede */}
                            <div className="flex items-center gap-2">
                              <User className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium">
                                {record.guestName}
                              </span>
                            </div>
                            {/* Badge de status com cores contextuais */}
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
                          {/* Grid com detalhes da hospedagem */}
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
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Rodapé do diálogo com botões de ação */}
          <DialogFooter className="flex items-center justify-between">
            {/* Botão para excluir o quarto - abre diálogo de confirmação */}
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirmation(true)}
              className="flex items-center gap-1"
            >
              <Trash2Icon className="h-4 w-4" />
              Excluir quarto
            </Button>
            {/* Botão para fechar o diálogo */}
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para exclusão do quarto */}
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
              {/* Mensagem de aviso diferente dependendo se há histórico de hospedagem */}
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
