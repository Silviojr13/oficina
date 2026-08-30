'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Gasto } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { nullsToUndefined, avisarErroValidacao } from '@/lib/zod-helpers';

// Definição do esquema de validação com Zod
const gastoSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  categoria: z.enum(['aluguel', 'salarios', 'fornecedores', 'energia', 'agua', 'internet', 'manutencao', 'marketing', 'impostos', 'transporte', 'outros']),
  valor: z.number().positive("Valor deve ser positivo"),
  dataVencimento: z.string().min(1, "Data de vencimento é obrigatória"), // Assuming date format like YYYY-MM-DD
  formaPagamento: z.string().optional(),
  recorrente: z.boolean().optional(),
  observacoes: z.string().optional(),
});

type GastoFormData = z.infer<typeof gastoSchema>;

interface GastoFormProps {
  initialData?: Partial<Gasto>;
  onSubmit: (data: GastoFormData) => void;
  isEditing: boolean;
}

export default function GastoForm({ initialData, onSubmit, isEditing }: GastoFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GastoFormData>({
    resolver: zodResolver(gastoSchema),
    defaultValues: {
      // Colunas vazias no banco vem como null, e .optional() no zod so aceita
      // undefined - null trava a validacao calada.
      ...nullsToUndefined(initialData),
      recorrente: initialData?.recorrente ?? false, // Default to false
      // O Prisma devolve Date, mas o schema espera string (YYYY-MM-DD) -
      // sem essa conversao a validacao falha silenciosamente ao editar.
      dataVencimento: initialData?.dataVencimento
        ? new Date(initialData.dataVencimento).toISOString().slice(0, 10)
        : undefined,
    },
  });

  const handleFormSubmit = (data: GastoFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, avisarErroValidacao)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Gasto' : 'Novo Gasto'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Input id="descricao" {...register('descricao', { required: true })} />
            {errors.descricao && <span className="text-destructive text-sm">{errors.descricao.message}</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoria">Categoria *</Label>
              <Select value={watch('categoria')} onValueChange={(value) => setValue('categoria', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aluguel">Aluguel</SelectItem>
                  <SelectItem value="salarios">Salários</SelectItem>
                  <SelectItem value="fornecedores">Fornecedores</SelectItem>
                  <SelectItem value="energia">Energia</SelectItem>
                  <SelectItem value="agua">Água</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="impostos">Impostos</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="valor">Valor *</Label>
              <Input id="valor" type="number" step="0.01" {...register('valor', { valueAsNumber: true })} />
              {errors.valor && <span className="text-destructive text-sm">{errors.valor.message}</span>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
              <Input id="dataVencimento" type="date" {...register('dataVencimento', { required: true })} />
              {errors.dataVencimento && <span className="text-destructive text-sm">{errors.dataVencimento.message}</span>}
            </div>
            <div>
              <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
              <Input id="formaPagamento" {...register('formaPagamento')} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="recorrente" checked={watch('recorrente')} onCheckedChange={(checked) => setValue('recorrente', checked)} />
            <Label htmlFor="recorrente">Recorrente?</Label>
          </div>
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" {...register('observacoes')} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit">{isEditing ? 'Atualizar Gasto' : 'Registrar Gasto'}</Button>
    </form>
  );
}