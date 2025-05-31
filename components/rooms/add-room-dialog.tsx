"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RoomFormData } from "@/lib/types";

// Esquema de validação para o formulário
const formSchema = z.object({
  number: z
    .string()
    .min(1, { message: "Número do quarto é obrigatório" })
    .max(10),
  type: z.enum(["Solteiro", "Casal"], {
    required_error: "Tipo de quarto é obrigatório",
  }),
  rate: z
    .string()
    .min(1, { message: "Valor da diária é obrigatório" })
    .refine((val) => !isNaN(Number(val)), {
      message: "Valor da diária deve ser um número",
    }),
  description: z.string().optional(),
  image_url: z.string().optional(),
});

interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddRoom: (data: RoomFormData) => void;
}

export function AddRoomDialog({
  open,
  onOpenChange,
  onAddRoom,
}: AddRoomDialogProps) {
  const [selectedType, setSelectedType] = useState<string | undefined>();

  // Inicializar react-hook-form com zod resolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number: "",
      description: "",
      rate: "",
      image_url: "",
    },
  });

  // Função de envio do formulário
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Converter valor da diária para número
    const formattedData = {
      ...data,
      rate: parseFloat(data.rate),
      description: data.description || "", // Garantir que description é sempre uma string
      image_url: data.image_url || "", // Garantir que image_url é sempre uma string
    };

    onAddRoom(formattedData);
    form.reset(); // Limpar formulário
    onOpenChange(false); // Fechar diálogo
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
                  <FormLabel>Tipo de Quarto</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedType(value);

                      // Se o tipo for alterado, atualizar a diária automaticamente
                      if (value === "Solteiro") {
                        form.setValue("rate", "100");
                      } else if (value === "Casal") {
                        form.setValue("rate", "150");
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Solteiro">Solteiro</SelectItem>
                      <SelectItem value="Casal">Casal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor da Diária (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem</FormLabel>
                  <FormControl>
                    <Input placeholder="URL da imagem do quarto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Adicionar Quarto</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
