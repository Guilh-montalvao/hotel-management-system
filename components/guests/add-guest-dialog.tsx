"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

// Esquema de validação para o formulário usando Zod
const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  sobrenome: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  cpf: z
    .string()
    .min(11, "CPF deve ter 11 dígitos")
    .max(14, "CPF não pode ter mais de 14 caracteres")
    .refine((cpf) => /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(cpf), {
      message: "CPF inválido",
    }),
  email: z.string().email("E-mail inválido"),
  dataNascimento: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  genero: z.string().min(1, "Gênero é obrigatório"),
  telefone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .refine((telefone) => /^(\(\d{2}\)\s?)?\d{4,5}-?\d{4}$/.test(telefone), {
      message: "Telefone inválido",
    }),
  descricao: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Opções de gênero
const generoOptions = [
  { value: "Masculino", label: "Masculino" },
  { value: "Feminino", label: "Feminino" },
  { value: "Não-binário", label: "Não-binário" },
  { value: "Prefiro não informar", label: "Prefiro não informar" },
];

/**
 * Interface para as propriedades do componente
 */
interface AddGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGuest?: (data: any) => void;
}

export function AddGuestDialog({
  open,
  onOpenChange,
  onAddGuest,
}: AddGuestDialogProps) {
  // Configuração do formulário com validação
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      sobrenome: "",
      cpf: "",
      email: "",
      telefone: "",
      genero: "",
      descricao: "",
    },
  });

  // Manipulador para formatação de CPF enquanto digita
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      // Formatar como xxx.xxx.xxx-xx
      if (value.length > 9) {
        value = value.replace(
          /^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/,
          "$1.$2.$3-$4"
        );
      } else if (value.length > 6) {
        value = value.replace(/^(\d{3})(\d{3})(\d{0,3}).*/, "$1.$2.$3");
      } else if (value.length > 3) {
        value = value.replace(/^(\d{3})(\d{0,3}).*/, "$1.$2");
      }
    }
    form.setValue("cpf", value);
  };

  // Manipulador para formatação de telefone enquanto digita
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      // Formatar como (xx) xxxxx-xxxx ou (xx) xxxx-xxxx
      if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3");
      } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
      }
    }
    form.setValue("telefone", value);
  };

  // Função para lidar com a submissão do formulário
  const onSubmit = (data: FormValues) => {
    // Criando um objeto de hóspede com os dados do formulário
    const guestData = {
      ...data,
      // Enviamos diretamente o objeto Date, a formatação será feita na página
      // Isso evita problemas de conversão dupla
      dataNascimento: data.dataNascimento,
      name: `${data.nome} ${data.sobrenome}`,
      status: "Ativo", // Status padrão para novo hóspede
      cpf: data.cpf,
      email: data.email,
    };

    // Chamando a função de callback passada como prop, se existir
    if (onAddGuest) {
      onAddGuest(guestData);
    }

    // Resetando o formulário e fechando o diálogo
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Adicionar Hóspede</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo hóspede para cadastrá-lo no sistema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Nome */}
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sobrenome */}
              <FormField
                control={form.control}
                name="sobrenome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input placeholder="Sobrenome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* CPF */}
              <FormField
                control={form.control}
                name="cpf"
                render={({ field: { onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        {...fieldProps}
                        onChange={handleCpfChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* E-mail */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Data de Nascimento */}
              <FormField
                control={form.control}
                name="dataNascimento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Nascimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", {
                                locale: ptBR,
                              })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={ptBR}
                          captionLayout="dropdown-buttons"
                          fromYear={1920}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gênero */}
              <FormField
                control={form.control}
                name="genero"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Gênero</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o gênero" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {generoOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Telefone */}
            <FormField
              control={form.control}
              name="telefone"
              render={({ field: { onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(00) 00000-0000"
                      {...fieldProps}
                      onChange={handleTelefoneChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Endereço (Opcional) */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informe o endereço completo do hóspede (Rua, Número, Bairro, Cidade, Estado, CEP)"
                      className="resize-none"
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
              <Button type="submit">Cadastrar Hóspede</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
