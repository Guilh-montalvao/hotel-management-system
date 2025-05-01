"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Definição do schema de validação para o formulário
const formSchema = z.object({
  number: z.string().min(1, "Número do quarto é obrigatório"),
  type: z.string().min(1, "Tipo do quarto é obrigatório"),
  description: z.string().min(5, "Descrição deve ter pelo menos 5 caracteres"),
  image: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Tipos de quarto disponíveis com seus preços correspondentes
const roomTypes = [
  { id: "Solteiro", label: "Solteiro", price: 100 },
  { id: "Casal", label: "Casal", price: 150 },
];

/**
 * Componente de diálogo para adicionar um novo quarto
 * @param open - Estado de abertura do diálogo
 * @param onOpenChange - Função para alterar o estado de abertura
 * @param onAddRoom - Função chamada quando um quarto é adicionado com sucesso
 */
interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddRoom?: (data: FormValues) => void;
}

export function AddRoomDialog({
  open,
  onOpenChange,
  onAddRoom,
}: AddRoomDialogProps) {
  const [selectedType, setSelectedType] = useState<string | undefined>();

  // Configuração do formulário com validação
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number: "",
      type: "",
      description: "",
      image: "",
    },
  });

  // Função para lidar com a submissão do formulário
  const onSubmit = (data: FormValues) => {
    // Aqui você adicionaria a lógica para salvar o quarto
    onAddRoom?.(data);
    form.reset();
    onOpenChange(false);
  };

  // Obter o preço com base no tipo selecionado
  const getPrice = () => {
    if (!selectedType) return null;
    const type = roomTypes.find((t) => t.id === selectedType);
    return type ? `R$${type.price}` : null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Quarto</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do quarto para adicioná-lo ao sistema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do Quarto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo do Quarto</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedType(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roomTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label} - R${type.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType && (
              <div className="text-sm">
                <span className="font-medium">Preço:</span> {getPrice()} /
                diária
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva as características do quarto"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://exemplo.com/imagem.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Adicionar Quarto</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
