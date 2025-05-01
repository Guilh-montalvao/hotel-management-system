"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  HeartIcon,
  ClipboardIcon,
  HomeIcon,
  UserCircleIcon,
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
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Guest } from "@/app/guests/page";

interface GuestDetailsDialogProps {
  guest: Guest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuestDetailsDialog({
  guest,
  open,
  onOpenChange,
}: GuestDetailsDialogProps) {
  if (!guest) return null;

  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hospedado":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800";
      case "Reservado":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800";
      case "Sem estadia":
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800";
    }
  };

  // Data de criação simulada (para exemplo)
  const creationDate = new Date(
    parseInt(guest.id.split("-")[0]) || Date.now()
  ).toLocaleDateString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{guest.initials}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">{guest.name}</DialogTitle>
              <DialogDescription>
                {guest.cpf || "000.000.000-00"}
              </DialogDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`px-3 py-1 text-sm mt-2 ${getStatusColor(guest.status)}`}
          >
            {guest.status}
          </Badge>
        </DialogHeader>

        <Tabs defaultValue="detalhes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="detalhes">Detalhes do Hóspede</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Hospedagem</TabsTrigger>
          </TabsList>

          {/* Aba de Detalhes do Hóspede */}
          <TabsContent value="detalhes" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  Data de Cadastro
                </div>
                <div className="font-medium">{creationDate}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="font-medium">{guest.status}</div>
              </div>
            </div>

            <Separator />

            <h3 className="text-base font-medium">Informações Pessoais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  Nome Completo
                </div>
                <div className="font-medium">{guest.name}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">CPF</div>
                <div className="font-medium">
                  {guest.cpf || "Não informado"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{guest.email}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  Data de Nascimento
                </div>
                <div className="font-medium">
                  {guest.birthDate || "Não informado"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Gênero</div>
                <div className="font-medium">
                  {guest.genero || "Não informado"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Telefone</div>
                <div className="font-medium">{guest.phone}</div>
              </div>
            </div>

            <Separator />

            <h3 className="text-base font-medium">Endereço</h3>
            <div className="space-y-1">
              <div className="font-medium">
                {guest.endereco || "Não informado"}
              </div>
            </div>
          </TabsContent>

          {/* Aba de Histórico de Hospedagem */}
          <TabsContent value="historico" className="py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-medium">Histórico de Estadias</h3>
              </div>

              {guest.lastStay && guest.lastStay !== "" ? (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Quarto 101</h4>
                          <div className="text-sm text-muted-foreground">
                            {guest.lastStay}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          Concluída
                        </Badge>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex justify-between items-center text-sm">
                        <div>Diárias: 3</div>
                        <div className="font-medium">Total: R$ 450,00</div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="text-center text-sm text-muted-foreground">
                    Total de estadias: {guest.totalStays || 0}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="bg-muted rounded-full p-3 inline-flex">
                    <HomeIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">Nenhuma estadia registrada</h4>
                    <p className="text-sm text-muted-foreground">
                      Este hóspede ainda não se hospedou no hotel.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
