import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { Lead } from "./LeadCard";

const leadFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres" })
    .max(100, { message: "Nome deve ter no máximo 100 caracteres" }),
  phone: z
    .string()
    .trim()
    .min(10, { message: "Telefone deve ter pelo menos 10 dígitos" })
    .max(20, { message: "Telefone deve ter no máximo 20 caracteres" })
    .regex(/^[\d\s\-()]+$/, { message: "Telefone deve conter apenas números, espaços e caracteres válidos" }),
  interest: z
    .string()
    .trim()
    .min(3, { message: "Interesse deve ter pelo menos 3 caracteres" })
    .max(100, { message: "Interesse deve ter no máximo 100 caracteres" }),
  status: z.enum(["quente", "morno", "frio"], {
    required_error: "Selecione o nível de interesse",
  }),
  notes: z
    .string()
    .trim()
    .max(500, { message: "Notas devem ter no máximo 500 caracteres" })
    .optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  onAddLead: (lead: Omit<Lead, "id">) => void;
}

export function LeadForm({ onAddLead }: LeadFormProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      interest: "",
      status: "morno",
      notes: "",
    },
  });

  const onSubmit = (data: LeadFormValues) => {
    const scoreMap = { quente: 85, morno: 60, frio: 35 };
    
    const newLead: Omit<Lead, "id"> = {
      name: data.name,
      phone: data.phone,
      interest: data.interest,
      status: data.status,
      score: scoreMap[data.status],
      lastContact: "Agora",
      history: data.notes || "Lead criado manualmente",
    };

    onAddLead(newLead);
    
    toast({
      title: "Lead adicionado!",
      description: `${data.name} foi adicionado à sua lista de leads.`,
    });

    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-primary-foreground border-0 hover:opacity-90">
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Adicionar Novo Lead
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Nome completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: João Silva"
                      className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 85 99999-1234"
                      className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Interesse</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Produto Premium"
                      className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Nível de Interesse</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-secondary/50 border-border/50 text-foreground">
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border z-50">
                      <SelectItem value="quente" className="text-foreground hover:bg-secondary focus:bg-secondary">
                        🔥 Quente - Alta probabilidade
                      </SelectItem>
                      <SelectItem value="morno" className="text-foreground hover:bg-secondary focus:bg-secondary">
                        ⚡ Morno - Interesse moderado
                      </SelectItem>
                      <SelectItem value="frio" className="text-foreground hover:bg-secondary focus:bg-secondary">
                        ❄️ Frio - Baixo engajamento
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Notas iniciais (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre o lead..."
                      className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 border-border/50 text-foreground hover:bg-secondary"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 gradient-primary text-primary-foreground border-0 hover:opacity-90"
              >
                Adicionar Lead
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
