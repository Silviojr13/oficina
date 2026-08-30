'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import type { Produto } from '@/lib/types';
import { avisarErroValidacao } from '@/lib/zod-helpers';

const tipoEntradaLabels: Record<string, string> = {
  compra: 'Compra',
  devolucao_cliente: 'Devolução de Cliente',
  transferencia: 'Transferência',
  ajuste_inventario: 'Ajuste de Inventário',
  brinde: 'Brinde',
};

const entradaSchema = z.object({
  numeroNF: z.string().min(1, 'Número da NF é obrigatório'),
  chaveAcesso: z.string().min(1, 'Chave de acesso é obrigatória'),
  dataEmissao: z.string().min(1, 'Data de emissão é obrigatória'),
  dataEntrada: z.string().min(1, 'Data de entrada é obrigatória'),
  fornecedorId: z.string().min(1, 'Selecione um fornecedor'),
  tipoEntrada: z.enum(['compra', 'devolucao_cliente', 'transferencia', 'ajuste_inventario', 'brinde']),
  condicaoPagamento: z.string().optional(),
  dataVencimento: z.string().optional(),
  formaPagamento: z.string().optional(),
  observacoes: z.string().optional(),
});

type EntradaFormData = z.infer<typeof entradaSchema>;

type ItemEntrada = { produtoId: string; quantidade: number; valorUnitario: number; valorTotal: number };

interface EntradaEstoqueFormProps {
  produtos: Produto[];
  fornecedores: any[];
  initialData?: any;
  onSubmit: (data: any) => void;
  isEditing: boolean;
}

export default function EntradaEstoqueForm({ produtos, fornecedores, initialData, onSubmit, isEditing }: EntradaEstoqueFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EntradaFormData>({
    resolver: zodResolver(entradaSchema),
    defaultValues: {
      tipoEntrada: initialData?.tipoEntrada ?? 'compra',
      dataEmissao: initialData?.dataEmissao ? new Date(initialData.dataEmissao).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      dataEntrada: initialData?.dataEntrada ? new Date(initialData.dataEntrada).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      dataVencimento: initialData?.dataVencimento ? new Date(initialData.dataVencimento).toISOString().slice(0, 10) : undefined,
      numeroNF: initialData?.numeroNF ?? '',
      chaveAcesso: initialData?.chaveAcesso ?? '',
      fornecedorId: initialData?.fornecedorId ?? '',
      condicaoPagamento: initialData?.condicaoPagamento ?? '',
      formaPagamento: initialData?.formaPagamento ?? '',
      observacoes: initialData?.observacoes ?? '',
    },
  });

  const [itens, setItens] = useState<ItemEntrada[]>(
    initialData?.itens?.length
      ? initialData.itens.map((i: any) => ({ produtoId: i.produtoId, quantidade: i.quantidade, valorUnitario: i.valorUnitario, valorTotal: i.valorTotal }))
      : []
  );
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState('1');
  const [valorUnitarioSelecionado, setValorUnitarioSelecionado] = useState('');

  const adicionarItem = () => {
    const produto = produtos.find((p) => p.id === produtoSelecionado);
    const quantidade = parseInt(quantidadeSelecionada, 10);
    const valorUnitario = parseFloat(valorUnitarioSelecionado || String(produto?.custoAquisicao ?? 0));
    if (!produto || !quantidade || quantidade <= 0 || !valorUnitario) return;
    setItens([...itens, { produtoId: produto.id, quantidade, valorUnitario, valorTotal: valorUnitario * quantidade }]);
    setProdutoSelecionado('');
    setQuantidadeSelecionada('1');
    setValorUnitarioSelecionado('');
  };

  const removerItem = (index: number) => setItens(itens.filter((_, i) => i !== index));

  const valorTotal = itens.reduce((sum, i) => sum + i.valorTotal, 0);

  const handleFormSubmit = (data: EntradaFormData) => {
    const fornecedor = fornecedores.find((f) => f.id === data.fornecedorId);
    onSubmit({
      ...data,
      cnpjFornecedor: fornecedor?.cnpj ?? '',
      itens,
      subtotalProdutos: valorTotal,
      valorTotal,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, avisarErroValidacao)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Nota Fiscal</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numeroNF">Número da NF *</Label>
              <Input id="numeroNF" {...register('numeroNF')} />
              {errors.numeroNF && <span className="text-destructive text-sm">{errors.numeroNF.message}</span>}
            </div>
            <div>
              <Label htmlFor="chaveAcesso">Chave de Acesso *</Label>
              <Input id="chaveAcesso" className="font-mono" {...register('chaveAcesso')} />
              {errors.chaveAcesso && <span className="text-destructive text-sm">{errors.chaveAcesso.message}</span>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dataEmissao">Data de Emissão *</Label>
              <Input id="dataEmissao" type="date" {...register('dataEmissao')} />
            </div>
            <div>
              <Label htmlFor="dataEntrada">Data de Entrada *</Label>
              <Input id="dataEntrada" type="date" {...register('dataEntrada')} />
            </div>
            <div>
              <Label htmlFor="tipoEntrada">Tipo de Entrada *</Label>
              <Select value={watch('tipoEntrada')} onValueChange={(v) => setValue('tipoEntrada', v as EntradaFormData['tipoEntrada'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(tipoEntradaLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="fornecedorId">Fornecedor *</Label>
            <Select value={watch('fornecedorId')} onValueChange={(v) => setValue('fornecedorId', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione um fornecedor" /></SelectTrigger>
              <SelectContent>
                {fornecedores.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.nomeFantasia}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fornecedorId && <span className="text-destructive text-sm">{errors.fornecedorId.message}</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Itens da Nota</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_100px_120px_auto] gap-2">
            <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
              <SelectTrigger><SelectValue placeholder="Selecione uma peça" /></SelectTrigger>
              <SelectContent>
                {produtos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" min="1" placeholder="Qtd." value={quantidadeSelecionada} onChange={(e) => setQuantidadeSelecionada(e.target.value)} />
            <Input type="number" step="0.01" placeholder="Custo unit." value={valorUnitarioSelecionado} onChange={(e) => setValorUnitarioSelecionado(e.target.value)} />
            <Button type="button" variant="outline" onClick={adicionarItem}><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
          </div>
          {itens.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <tbody>
                  {itens.map((item, index) => {
                    const produto = produtos.find((p) => p.id === item.produtoId);
                    return (
                      <tr key={index} className="border-b">
                        <td className="py-2">{produto?.nome}</td>
                        <td className="py-2 w-16 whitespace-nowrap">x{item.quantidade}</td>
                        <td className="py-2 w-32 whitespace-nowrap">R$ {item.valorTotal.toFixed(2).replace('.', ',')}</td>
                        <td className="py-2 w-10">
                          <Button type="button" variant="ghost" size="sm" onClick={() => removerItem(index)}><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="text-right">
            <span className="text-sm text-muted-foreground">Total da nota: </span>
            <span className="text-lg font-bold">R$ {valorTotal.toFixed(2).replace('.', ',')}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pagamento</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="condicaoPagamento">Condição de Pagamento</Label>
              <Input id="condicaoPagamento" placeholder="Ex: 30/60/90 dias" {...register('condicaoPagamento')} />
            </div>
            <div>
              <Label htmlFor="dataVencimento">Data de Vencimento</Label>
              <Input id="dataVencimento" type="date" {...register('dataVencimento')} />
            </div>
            <div>
              <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
              <Input id="formaPagamento" placeholder="Ex: Boleto, PIX..." {...register('formaPagamento')} />
            </div>
          </div>
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" {...register('observacoes')} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit">{isEditing ? 'Atualizar Entrada' : 'Registrar Entrada'}</Button>
    </form>
  );
}
