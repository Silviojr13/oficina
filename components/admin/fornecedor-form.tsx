'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Fornecedor } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Definição do esquema de validação com Zod
const fornecedorSchema = z.object({
  razaoSocial: z.string().min(1, "Razão Social é obrigatória"),
  nomeFantasia: z.string().min(1, "Nome Fantasia é obrigatório"),
  cnpj: z.string().min(1, "CNPJ é obrigatório"), // Could add CNPJ validation regex
  inscricaoEstadual: z.string().optional(),
  contato: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  endereco: z.object({
    logradouro: z.string().min(1, "Logradouro é obrigatório"),
    numero: z.string().min(1, "Número é obrigatório"),
    complemento: z.string().optional(),
    bairro: z.string().min(1, "Bairro é obrigatório"),
    cidade: z.string().min(1, "Cidade é obrigatória"),
    estado: z.string().min(2, "Estado é obrigatório").max(2, "Estado é obrigatório"),
    cep: z.string().min(8, "CEP inválido").max(9, "CEP inválido"), // Assuming format 12345-123
  }),
  dadosBancarios: z.object({
    banco: z.string().min(1, "Banco é obrigatório"),
    agencia: z.string().min(1, "Agência é obrigatória"),
    conta: z.string().min(1, "Conta é obrigatória"),
    tipoConta: z.enum(['Corrente', 'Poupança']),
  }),
  condicaoPagamentoPadrao: z.string().optional(),
  prazoEntrega: z.number().int().positive("Prazo deve ser positivo").optional(),
  avaliacao: z.number().min(1, "Avaliação mínima é 1").max(5, "Avaliação máxima é 5").optional(),
  observacoes: z.string().optional(),
});

type FornecedorFormData = z.infer<typeof fornecedorSchema>;

interface FornecedorFormProps {
  initialData?: Partial<Fornecedor>;
  onSubmit: (data: FornecedorFormData) => void;
  isEditing: boolean;
}

export default function FornecedorForm({ initialData, onSubmit, isEditing }: FornecedorFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FornecedorFormData>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      ...initialData,
      endereco: {
        logradouro: initialData?.endereco?.logradouro || '',
        numero: initialData?.endereco?.numero || '',
        complemento: initialData?.endereco?.complemento || '',
        bairro: initialData?.endereco?.bairro || '',
        cidade: initialData?.endereco?.cidade || '',
        estado: initialData?.endereco?.estado || '',
        cep: initialData?.endereco?.cep || '',
      },
      dadosBancarios: {
        banco: initialData?.dadosBancarios?.banco || '',
        agencia: initialData?.dadosBancarios?.agencia || '',
        conta: initialData?.dadosBancarios?.conta || '',
        tipoConta: initialData?.dadosBancarios?.tipoConta || 'Corrente', // Explicitly cast or ensure type safety
      },
      prazoEntrega: initialData?.prazoEntrega || 0,
      avaliacao: initialData?.avaliacao || 1,
    },
  });

  const handleFormSubmit = (data: FornecedorFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="razaoSocial">Razão Social *</Label>
              <Input id="razaoSocial" {...register('razaoSocial', { required: true })} />
              {errors.razaoSocial && <span className="text-destructive text-sm">{errors.razaoSocial.message}</span>}
            </div>
            <div>
              <Label htmlFor="nomeFantasia">Nome Fantasia *</Label>
              <Input id="nomeFantasia" {...register('nomeFantasia', { required: true })} />
              {errors.nomeFantasia && <span className="text-destructive text-sm">{errors.nomeFantasia.message}</span>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input id="cnpj" {...register('cnpj', { required: true })} />
              {errors.cnpj && <span className="text-destructive text-sm">{errors.cnpj.message}</span>}
            </div>
            <div>
              <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
              <Input id="inscricaoEstadual" {...register('inscricaoEstadual')} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contato">Contato</Label>
              <Input id="contato" {...register('contato')} />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" {...register('telefone')} />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <span className="text-destructive text-sm">{errors.email.message}</span>}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endereco.logradouro">Logradouro *</Label>
                  <Input id="endereco.logradouro" {...register('endereco.logradouro', { required: true })} />
                  {errors.endereco?.logradouro && <span className="text-destructive text-sm">{errors.endereco.logradouro.message}</span>}
                </div>
                <div>
                  <Label htmlFor="endereco.numero">Número *</Label>
                  <Input id="endereco.numero" {...register('endereco.numero', { required: true })} />
                  {errors.endereco?.numero && <span className="text-destructive text-sm">{errors.endereco.numero.message}</span>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endereco.complemento">Complemento</Label>
                  <Input id="endereco.complemento" {...register('endereco.complemento')} />
                </div>
                <div>
                  <Label htmlFor="endereco.bairro">Bairro *</Label>
                  <Input id="endereco.bairro" {...register('endereco.bairro', { required: true })} />
                  {errors.endereco?.bairro && <span className="text-destructive text-sm">{errors.endereco.bairro.message}</span>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="endereco.cidade">Cidade *</Label>
                  <Input id="endereco.cidade" {...register('endereco.cidade', { required: true })} />
                  {errors.endereco?.cidade && <span className="text-destructive text-sm">{errors.endereco.cidade.message}</span>}
                </div>
                <div>
                  <Label htmlFor="endereco.estado">Estado *</Label>
                  <Input id="endereco.estado" maxLength={2} {...register('endereco.estado', { required: true })} />
                  {errors.endereco?.estado && <span className="text-destructive text-sm">{errors.endereco.estado.message}</span>}
                </div>
                <div>
                  <Label htmlFor="endereco.cep">CEP *</Label>
                  <Input id="endereco.cep" {...register('endereco.cep', { required: true })} />
                  {errors.endereco?.cep && <span className="text-destructive text-sm">{errors.endereco.cep.message}</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados Bancários</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dadosBancarios.banco">Banco *</Label>
                  <Input id="dadosBancarios.banco" {...register('dadosBancarios.banco', { required: true })} />
                  {errors.dadosBancarios?.banco && <span className="text-destructive text-sm">{errors.dadosBancarios.banco.message}</span>}
                </div>
                <div>
                  <Label htmlFor="dadosBancarios.agencia">Agência *</Label>
                  <Input id="dadosBancarios.agencia" {...register('dadosBancarios.agencia', { required: true })} />
                  {errors.dadosBancarios?.agencia && <span className="text-destructive text-sm">{errors.dadosBancarios.agencia.message}</span>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dadosBancarios.conta">Conta *</Label>
                  <Input id="dadosBancarios.conta" {...register('dadosBancarios.conta', { required: true })} />
                  {errors.dadosBancarios?.conta && <span className="text-destructive text-sm">{errors.dadosBancarios.conta.message}</span>}
                </div>
                <div>
                  <Label htmlFor="dadosBancarios.tipoConta">Tipo de Conta *</Label>
                  <Select value={watch('dadosBancarios.tipoConta')} onValueChange={(value) => setValue('dadosBancarios.tipoConta', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Corrente">Corrente</SelectItem>
                      <SelectItem value="Poupança">Poupança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="condicaoPagamentoPadrao">Condição de Pagamento Padrão</Label>
              <Input id="condicaoPagamentoPadrao" {...register('condicaoPagamentoPadrao')} />
            </div>
            <div>
              <Label htmlFor="prazoEntrega">Prazo de Entrega (dias)</Label>
              <Input id="prazoEntrega" type="number" {...register('prazoEntrega', { valueAsNumber: true })} />
              {errors.prazoEntrega && <span className="text-destructive text-sm">{errors.prazoEntrega.message}</span>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="avaliacao">Avaliação (1-5)</Label>
              <Input id="avaliacao" type="number" min="1" max="5" {...register('avaliacao', { valueAsNumber: true })} />
              {errors.avaliacao && <span className="text-destructive text-sm">{errors.avaliacao.message}</span>}
            </div>
          </div>
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" {...register('observacoes')} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit">{isEditing ? 'Atualizar Fornecedor' : 'Criar Fornecedor'}</Button>
    </form>
  );
}