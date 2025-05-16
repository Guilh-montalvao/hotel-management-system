"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
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
  status: z.enum(["Hospedado", "Reservado", "Sem estadia"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Opções de gênero
const generoOptions = [
  { value: "Masculino", label: "Masculino" },
  { value: "Feminino", label: "Feminino" },
  { value: "Não-binário", label: "Não-binário" },
  { value: "Prefiro não informar", label: "Prefiro não informar" },
];

// Opções de status
const statusOptions = [
  { value: "Hospedado", label: "Hospedado" },
  { value: "Reservado", label: "Reservado" },
  { value: "Sem estadia", label: "Sem estadia" },
];

/**
 * Interface para as propriedades do componente
 */
interface EditGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest: any; // Dados do hóspede a ser editado
  onUpdateGuest?: (data: any) => void;
}

export function EditGuestDialog({
  open,
  onOpenChange,
  guest,
  onUpdateGuest,
}: EditGuestDialogProps) {
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
      status: "Sem estadia" as const,
    },
  });

  // Carregar os dados do hóspede quando o diálogo é aberto
  useEffect(() => {
    if (guest && open) {
      // Extrair nome e sobrenome do campo 'name'
      const nameParts = guest.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Converter a data de nascimento de string para objeto Date
      let dataNascimento = new Date();
      try {
        if (guest.birthDate) {
          // Converter a data no formato DD/MM/YYYY para objeto Date
          const [day, month, year] = guest.birthDate.split("/").map(Number);
          // Criar data usando UTC para evitar problemas de fuso horário
          dataNascimento = new Date(Date.UTC(year, month - 1, day));
        }
      } catch (error) {
        console.error("Erro ao converter data:", error);
      }

      // Preencher o formulário com os dados do hóspede
      form.reset({
        nome: firstName,
        sobrenome: lastName,
        cpf: guest.cpf || "",
        email: guest.email || "",
        telefone: guest.phone || "",
        genero: guest.genero || "",
        descricao: guest.endereco || "",
        dataNascimento: dataNascimento,
        status: guest.status as "Hospedado" | "Reservado" | "Sem estadia",
      });
    }
  }, [guest, open, form]);

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
    console.log("Dados do formulário de edição:", data);

    // Formatando a data usando UTC para evitar problemas de fuso horário
    const formattedDate = (() => {
      const date = data.dataNascimento;
      const day = date.getUTCDate().toString().padStart(2, "0");
      const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    })();

    // Criando um objeto de hóspede com os dados atualizados
    const updatedGuestData = {
      ...guest,
      name: `${data.nome} ${data.sobrenome}`,
      cpf: data.cpf,
      email: data.email,
      phone: data.telefone,
      birthDate: formattedDate,
      genero: data.genero,
      endereco: data.descricao,
      status: data.status || "Sem estadia",
      // Manter os outros campos intactos
      initials: `${data.nome[0]}${data.sobrenome[0]}`.toUpperCase(),
    };

    console.log("Dados atualizados para enviar:", updatedGuestData);

    // Chamando a função de callback passada como prop
    onUpdateGuest?.(updatedGuestData);

    // Fechando o diálogo
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Hóspede</DialogTitle>
          <DialogDescription>
            Atualize os dados do hóspede no sistema.
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

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
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
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
