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

interface GuestDetailsDialogProps {
  guest: any;
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
      case "Atual":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800";
      case "Recente":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800";
      case "Anterior":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalhes do Hóspede</DialogTitle>
          <DialogDescription>
            Informações completas sobre o hóspede
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cabeçalho com informações básicas */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={guest.avatar} alt={guest.name} />
                <AvatarFallback className="text-lg">
                  {guest.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xl font-semibold">{guest.name}</div>
                <div className="text-sm text-muted-foreground">
                  {guest.nationality}
                </div>
                <div className="mt-2">
                  <Badge
                    variant="outline"
                    className={`px-3 py-1 text-sm ${getStatusColor(
                      guest.status
                    )}`}
                  >
                    {guest.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Cliente desde</div>
              <div className="font-medium">
                {guest.customerSince || "Janeiro 2023"}
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações de contato */}
          <div>
            <h3 className="text-base font-medium mb-3">
              Informações de Contato
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <MailIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="text-muted-foreground">Email</div>
                </div>
                <div>{guest.email}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="text-muted-foreground">Telefone</div>
                </div>
                <div>{guest.phone}</div>
              </div>
            </div>
          </div>

          {/* Informações pessoais mais detalhadas (simuladas, pois não temos na interface original) */}
          <div>
            <h3 className="text-base font-medium mb-3">Informações Pessoais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="text-muted-foreground">
                    Data de Nascimento
                  </div>
                </div>
                <div>{guest.birthDate || "23/05/1985"}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <ClipboardIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="text-muted-foreground">CPF</div>
                </div>
                <div>{guest.cpf || "123.456.789-10"}</div>
              </div>
            </div>
          </div>

          {/* Histórico de estadias */}
          <div>
            <h3 className="text-base font-medium mb-3">
              Histórico de Estadias
            </h3>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium">Última estadia</div>
                  <Badge variant="outline">
                    {guest.status === "Atual" ? "Em andamento" : "Concluída"}
                  </Badge>
                </div>
                <div className="text-base">{guest.lastStay}</div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Total de estadias
                    </div>
                    <div className="text-2xl font-bold">{guest.totalStays}</div>
                  </div>
                  {guest.loyalty && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Pontos de fidelidade
                      </div>
                      <div className="text-2xl font-bold">
                        {guest.loyalty || "320"}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preferências do hóspede */}
          <div>
            <h3 className="text-base font-medium mb-3">Preferências</h3>
            <div className="flex flex-wrap gap-2">
              {guest.preferences && guest.preferences.length > 0 ? (
                guest.preferences.map((pref: string, index: number) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {pref}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  Nenhuma preferência registrada
                </div>
              )}
            </div>
          </div>

          {/* Observações, se existirem */}
          {guest.notes && (
            <div className="space-y-2">
              <h3 className="text-base font-medium">Observações</h3>
              <div className="bg-muted p-3 rounded-lg text-sm">
                {guest.notes}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline">
              <HeartIcon className="mr-2 h-4 w-4" />
              Adicionar Preferência
            </Button>
            <Button>Editar Hóspede</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
