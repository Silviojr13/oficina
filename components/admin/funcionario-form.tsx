'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Funcionario } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { optionalNumber } from '@/lib/zod-helpers';

// Definição do esquema de validação com Zod
const funcionarioSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().min(1, "CPF é obrigatório"), // Could add CPF validation regex
  cargo: z.string().min(1, "Cargo é obrigatório"),
  setor: z.string().min(1, "Setor é obrigatório"),
  telefone: z.string().optional(),
  // .optional() so cobre undefined - o input deixa "" quando vazio, que
  // .email() rejeitava e bloqueava o formulario com um "Email invalido" falso.
  email: z.string().email("Email inválido").optional().or(z.literal('')),
  dataAdmissao: z.string().min(1, "Data de admissão é obrigatória"), // Assuming date format like YYYY-MM-DD
  salario: optionalNumber(z.number().positive("Salário deve ser positivo").optional()),
  comissaoPercentual: optionalNumber(z.number().nonnegative("Comissão deve ser zero ou positiva").optional()),
  tipoContrato: z.enum(['clt', 'pj', 'estagio', 'temporario']).default('clt'),
  status: z.enum(['ativo', 'ferias', 'afastado', 'inativo']).default('ativo'),
  endereco: z.string().optional(),
  observacoes: z.string().optional(),
});

type FuncionarioFormData = z.infer<typeof funcionarioSchema>;

interface FuncionarioFormProps {
  initialData?: Partial<Funcionario>;
  onSubmit: (data: FuncionarioFormData) => void;
  isEditing: boolean;
}

export default function FuncionarioForm({ initialData, onSubmit, isEditing }: FuncionarioFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FuncionarioFormData>({
    resolver: zodResolver(funcionarioSchema),
    defaultValues: {
      ...initialData,
      // Ensure numbers are handled correctly if undefined
      salario: initialData?.salario ?? 0,
      comissaoPercentual: initialData?.comissaoPercentual ?? 0,
      // O Prisma devolve Date, mas o schema espera string (YYYY-MM-DD) -
      // sem essa conversao a validacao falha silenciosamente ao editar.
      dataAdmissao: initialData?.dataAdmissao
        ? new Date(initialData.dataAdmissao).toISOString().slice(0, 10)
        : undefined,
    },
  });

  const handleFormSubmit = (data: FuncionarioFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Funcionário' : 'Novo Funcionário'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" {...register('nome', { required: true })} />
              {errors.nome && <span className="text-destructive text-sm">{errors.nome.message}</span>}
            </div>
            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input id="cpf" {...register('cpf', { required: true })} />
              {errors.cpf && <span className="text-destructive text-sm">{errors.cpf.message}</span>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cargo">Cargo *</Label>
              <Input id="cargo" {...register('cargo', { required: true })} />
              {errors.cargo && <span className="text-destructive text-sm">{errors.cargo.message}</span>}
            </div>
            <div>
              <Label htmlFor="setor">Setor *</Label>
              <Input id="setor" {...register('setor', { required: true })} />
              {errors.setor && <span className="text-destructive text-sm">{errors.setor.message}</span>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" {...register('telefone')} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <span className="text-destructive text-sm">{errors.email.message}</span>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataAdmissao">Data de Admissão *</Label>
              <Input id="dataAdmissao" type="date" {...register('dataAdmissao', { required: true })} />
              {errors.dataAdmissao && <span className="text-destructive text-sm">{errors.dataAdmissao.message}</span>}
            </div>
            <div>
              <Label htmlFor="tipoContrato">Tipo de Contrato *</Label>
              <Select value={watch('tipoContrato')} onValueChange={(value) => setValue('tipoContrato', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clt">CLT</SelectItem>
                  <SelectItem value="pj">PJ</SelectItem>
                  <SelectItem value="estagio">Estágio</SelectItem>
                  <SelectItem value="temporario">Temporário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salario">Salário</Label>
              <Input id="salario" type="number" step="0.01" {...register('salario', { valueAsNumber: true })} />
              {errors.salario && <span className="text-destructive text-sm">{errors.salario.message}</span>}
            </div>
            <div>
              <Label htmlFor="comissaoPercentual">Comissão (%)</Label>
              <Input id="comissaoPercentual" type="number" step="0.01" {...register('comissaoPercentual', { valueAsNumber: true })} />
              {errors.comissaoPercentual && <span className="text-destructive text-sm">{errors.comissaoPercentual.message}</span>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={watch('status')} onValueChange={(value) => setValue('status', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="ferias">Férias</SelectItem>
                  <SelectItem value="afastado">Afastado</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch id="statusAtivo" checked={watch('status') === 'ativo'} onCheckedChange={(checked) => setValue('status', checked ? 'ativo' : 'inativo')} />
              <Label htmlFor="statusAtivo">Ativo?</Label>
            </div>
          </div>
          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Textarea id="endereco" {...register('endereco')} />
          </div>
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" {...register('observacoes')} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit">{isEditing ? 'Atualizar Funcionário' : 'Criar Funcionário'}</Button>
    </form>
  );
}