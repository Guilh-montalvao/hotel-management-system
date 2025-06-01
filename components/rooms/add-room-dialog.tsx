"use client";

/**
 * Componente de Diálogo para Adicionar Novo Quarto
 *
 * Este componente apresenta um diálogo modal com um formulário para adicionar
 * um novo quarto ao sistema. Utiliza react-hook-form para gerenciamento do formulário
 * e zod para validação dos dados.
 */

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

/**
 * Esquema de validação Zod para o formulário de quarto
 *
 * Define as regras de validação para cada campo:
 * - number: Número do quarto (obrigatório, máx. 10 caracteres)
 * - type: Tipo do quarto (Solteiro ou Casal, obrigatório)
 * - rate: Valor da diária (obrigatório, deve ser um número)
 * - description: Descrição do quarto (opcional)
 * - image_url: URL da imagem do quarto (opcional)
 */
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

/**
 * Interface de propriedades do componente AddRoomDialog
 */
interface AddRoomDialogProps {
  open: boolean; // Controla se o diálogo está aberto
  onOpenChange: (open: boolean) => void; // Função chamada quando o estado de abertura muda
  onAddRoom: (data: RoomFormData) => void; // Função chamada para adicionar o quarto
}

/**
 * Componente de diálogo para adicionar um novo quarto
 *
 * @param props - Propriedades do componente
 * @returns Componente React
 */
export function AddRoomDialog({
  open,
  onOpenChange,
  onAddRoom,
}: AddRoomDialogProps) {
  // Estado para armazenar o tipo de quarto selecionado
  const [selectedType, setSelectedType] = useState<string | undefined>();

  /**
   * Inicialização do formulário com react-hook-form
   * Configura a validação com zodResolver e define valores iniciais
   */
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number: "",
      description: "",
      rate: "",
      image_url: "",
    },
  });

  /**
   * Função executada ao enviar o formulário
   *
   * @param data - Dados validados do formulário
   */
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Converter valor da diária para número e garantir que os campos opcionais sejam strings vazias em vez de undefined
    const formattedData = {
      ...data,
      rate: parseFloat(data.rate),
      description: data.description || "", // Garantir que description é sempre uma string
      image_url: data.image_url || "", // Garantir que image_url é sempre uma string
    };

    // Chamar a função para adicionar o quarto ao banco de dados
    onAddRoom(formattedData);
    form.reset(); // Limpar formulário
    onOpenChange(false); // Fechar diálogo
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Quarto</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do quarto para adicioná-lo ao sistema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Campo: Número do Quarto */}
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

            {/* Campo: Tipo de Quarto */}
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

            {/* Campo: Valor da Diária */}
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

            {/* Campo: Descrição */}
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

            {/* Campo: URL da Imagem */}
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

            {/* Botões de ação do formulário */}
            <DialogFooter>
              <Button type="submit">Adicionar Quarto</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
