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

const statusLabels: Record<string, string> = {
  aberto: 'Aberta',
  em_andamento: 'Em andamento',
  aguardando_peca: 'Aguardando peça',
  aguardando_aprovacao: 'Aguardando aprovação',
  concluido: 'Concluída',
  entregue: 'Entregue',
  cancelado: 'Cancelada',
};

const ordemServicoSchema = z.object({
  placa: z.string().min(1, 'Placa é obrigatória'),
  veiculoMarca: z.string().optional(),
  veiculoModelo: z.string().optional(),
  veiculoAno: z.number().int().optional(),
  veiculoCor: z.string().optional(),
  kmEntrada: z.number().int().nonnegative('Km deve ser zero ou positivo'),
  clienteNome: z.string().min(1, 'Nome do cliente é obrigatório'),
  clienteTelefone: z.string().optional(),
  clienteCpfCnpj: z.string().optional(),
  mecanicoResponsavel: z.string().optional(),
  dataEntrada: z.string().min(1, 'Data de entrada é obrigatória'),
  dataPrevisaoEntrega: z.string().optional(),
  problemaRelatado: z.string().optional(),
  diagnostico: z.string().optional(),
  codigoFalha: z.string().optional(),
  sistemaAfetado: z.string().optional(),
  status: z.enum(['aberto', 'em_andamento', 'aguardando_peca', 'aguardando_aprovacao', 'concluido', 'entregue', 'cancelado']),
  desconto: z.number().nonnegative().optional(),
  formaPagamento: z.string().optional(),
  garantiaDias: z.number().int().nonnegative().optional(),
  observacoes: z.string().optional(),
});

type OrdemServicoFormData = z.infer<typeof ordemServicoSchema>;

type Servico = { id: string; descricao: string; valor: number };
type ItemPeca = { produtoId: string; quantidade: number; valorUnitario: number; valorTotal: number };

interface OrdemServicoFormProps {
  produtos: Produto[];
  initialData?: any;
  onSubmit: (data: any) => void;
  isEditing: boolean;
}

export default function OrdemServicoForm({ produtos, initialData, onSubmit, isEditing }: OrdemServicoFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrdemServicoFormData>({
    resolver: zodResolver(ordemServicoSchema),
    defaultValues: {
      status: initialData?.status ?? 'aberto',
      dataEntrada: initialData?.dataEntrada
        ? new Date(initialData.dataEntrada).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      dataPrevisaoEntrega: initialData?.dataPrevisaoEntrega
        ? new Date(initialData.dataPrevisaoEntrega).toISOString().slice(0, 10)
        : undefined,
      placa: initialData?.placa ?? '',
      veiculoMarca: initialData?.veiculoMarca ?? '',
      veiculoModelo: initialData?.veiculoModelo ?? '',
      veiculoAno: initialData?.veiculoAno ?? undefined,
      veiculoCor: initialData?.veiculoCor ?? '',
      kmEntrada: initialData?.kmEntrada ?? 0,
      clienteNome: initialData?.clienteNome ?? '',
      clienteTelefone: initialData?.clienteTelefone ?? '',
      clienteCpfCnpj: initialData?.clienteCpfCnpj ?? '',
      mecanicoResponsavel: initialData?.mecanicoResponsavel ?? '',
      problemaRelatado: initialData?.problemaRelatado ?? '',
      diagnostico: initialData?.diagnostico ?? '',
      codigoFalha: initialData?.codigoFalha ?? '',
      sistemaAfetado: initialData?.sistemaAfetado ?? '',
      desconto: initialData?.desconto ?? 0,
      formaPagamento: initialData?.formaPagamento ?? '',
      garantiaDias: initialData?.garantiaDias ?? undefined,
      observacoes: initialData?.observacoes ?? '',
    },
  });

  const [servicos, setServicos] = useState<Servico[]>(
    initialData?.servicosRealizados?.length ? initialData.servicosRealizados : []
  );
  const [novoServicoDescricao, setNovoServicoDescricao] = useState('');
  const [novoServicoValor, setNovoServicoValor] = useState('');

  const [itens, setItens] = useState<ItemPeca[]>(
    initialData?.itens?.length
      ? initialData.itens.map((i: any) => ({
          produtoId: i.produtoId,
          quantidade: i.quantidade,
          valorUnitario: i.valorUnitario,
          valorTotal: i.valorTotal,
        }))
      : []
  );
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState('1');

  const adicionarServico = () => {
    const valor = parseFloat(novoServicoValor);
    if (!novoServicoDescricao || !valor || valor <= 0) return;
    setServicos([...servicos, { id: `s${Date.now()}`, descricao: novoServicoDescricao, valor }]);
    setNovoServicoDescricao('');
    setNovoServicoValor('');
  };

  const removerServico = (id: string) => setServicos(servicos.filter((s) => s.id !== id));

  const adicionarPeca = () => {
    const produto = produtos.find((p) => p.id === produtoSelecionado);
    const quantidade = parseInt(quantidadeSelecionada, 10);
    if (!produto || !quantidade || quantidade <= 0) return;
    const valorUnitario = produto.precoVendaBalcao || produto.precoSite;
    setItens([
      ...itens,
      { produtoId: produto.id, quantidade, valorUnitario, valorTotal: valorUnitario * quantidade },
    ]);
    setProdutoSelecionado('');
    setQuantidadeSelecionada('1');
  };

  const removerPeca = (index: number) => setItens(itens.filter((_, i) => i !== index));

  const valorMaoDeObra = servicos.reduce((sum, s) => sum + s.valor, 0);
  const valorPecas = itens.reduce((sum, i) => sum + i.valorTotal, 0);
  const desconto = watch('desconto') || 0;
  const valorTotal = valorMaoDeObra + valorPecas - desconto;

  const handleFormSubmit = (data: OrdemServicoFormData) => {
    onSubmit({
      ...data,
      placa: data.placa.toUpperCase(),
      servicosRealizados: servicos,
      itens: itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade, valorUnitario: i.valorUnitario, valorTotal: i.valorTotal })),
      valorMaoDeObra,
      valorPecas,
      valorTotal,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Veículo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="placa">Placa *</Label>
              <Input id="placa" className="uppercase" placeholder="ABC1D23" {...register('placa')} />
              {errors.placa && <span className="text-destructive text-sm">{errors.placa.message}</span>}
            </div>
            <div>
              <Label htmlFor="kmEntrada">Km na entrada *</Label>
              <Input id="kmEntrada" type="number" {...register('kmEntrada', { valueAsNumber: true })} />
              {errors.kmEntrada && <span className="text-destructive text-sm">{errors.kmEntrada.message}</span>}
            </div>
            <div>
              <Label htmlFor="veiculoAno">Ano</Label>
              <Input id="veiculoAno" type="number" {...register('veiculoAno', { valueAsNumber: true })} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="veiculoMarca">Marca</Label>
              <Input id="veiculoMarca" placeholder="Ex: Volkswagen" {...register('veiculoMarca')} />
            </div>
            <div>
              <Label htmlFor="veiculoModelo">Modelo</Label>
              <Input id="veiculoModelo" placeholder="Ex: Gol" {...register('veiculoModelo')} />
            </div>
            <div>
              <Label htmlFor="veiculoCor">Cor</Label>
              <Input id="veiculoCor" {...register('veiculoCor')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="clienteNome">Nome *</Label>
            <Input id="clienteNome" {...register('clienteNome')} />
            {errors.clienteNome && <span className="text-destructive text-sm">{errors.clienteNome.message}</span>}
          </div>
          <div>
            <Label htmlFor="clienteTelefone">Telefone</Label>
            <Input id="clienteTelefone" {...register('clienteTelefone')} />
          </div>
          <div>
            <Label htmlFor="clienteCpfCnpj">CPF/CNPJ</Label>
            <Input id="clienteCpfCnpj" {...register('clienteCpfCnpj')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Diagnóstico</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="problemaRelatado">Problema relatado pelo cliente</Label>
            <Textarea id="problemaRelatado" {...register('problemaRelatado')} />
          </div>
          <div>
            <Label htmlFor="diagnostico">Diagnóstico da oficina</Label>
            <Textarea id="diagnostico" {...register('diagnostico')} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="codigoFalha">Código de falha (OBD2)</Label>
              <Input id="codigoFalha" className="font-mono" placeholder="Ex: P0301" {...register('codigoFalha')} />
            </div>
            <div>
              <Label htmlFor="sistemaAfetado">Sistema afetado</Label>
              <Input id="sistemaAfetado" placeholder="Ex: Injeção, ABS, elétrica..." {...register('sistemaAfetado')} />
            </div>
            <div>
              <Label htmlFor="mecanicoResponsavel">Mecânico responsável</Label>
              <Input id="mecanicoResponsavel" {...register('mecanicoResponsavel')} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Serviços executados (mão de obra)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_auto] gap-2">
            <Input placeholder="Descrição do serviço" value={novoServicoDescricao} onChange={(e) => setNovoServicoDescricao(e.target.value)} />
            <Input type="number" step="0.01" placeholder="Valor" value={novoServicoValor} onChange={(e) => setNovoServicoValor(e.target.value)} />
            <Button type="button" variant="outline" onClick={adicionarServico}><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
          </div>
          {servicos.length > 0 && (
            <table className="w-full text-sm">
              <tbody>
                {servicos.map((s) => (
                  <tr key={s.id} className="border-b">
                    <td className="py-2">{s.descricao}</td>
                    <td className="py-2 w-32">R$ {s.valor.toFixed(2).replace('.', ',')}</td>
                    <td className="py-2 w-10">
                      <Button type="button" variant="ghost" size="sm" onClick={() => removerServico(s.id)}><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Peças utilizadas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-2">
            <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
              <SelectTrigger><SelectValue placeholder="Selecione uma peça do estoque" /></SelectTrigger>
              <SelectContent>
                {produtos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome} (R$ {(p.precoVendaBalcao || p.precoSite).toFixed(2)})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input type="number" min="1" value={quantidadeSelecionada} onChange={(e) => setQuantidadeSelecionada(e.target.value)} />
            <Button type="button" variant="outline" onClick={adicionarPeca}><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
          </div>
          {itens.length > 0 && (
            <table className="w-full text-sm">
              <tbody>
                {itens.map((item, index) => {
                  const produto = produtos.find((p) => p.id === item.produtoId);
                  return (
                    <tr key={index} className="border-b">
                      <td className="py-2">{produto?.nome}</td>
                      <td className="py-2 w-16">x{item.quantidade}</td>
                      <td className="py-2 w-32">R$ {item.valorTotal.toFixed(2).replace('.', ',')}</td>
                      <td className="py-2 w-10">
                        <Button type="button" variant="ghost" size="sm" onClick={() => removerPeca(index)}><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Prazo, status e pagamento</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dataEntrada">Data de entrada *</Label>
              <Input id="dataEntrada" type="date" {...register('dataEntrada')} />
            </div>
            <div>
              <Label htmlFor="dataPrevisaoEntrega">Previsão de entrega</Label>
              <Input id="dataPrevisaoEntrega" type="date" {...register('dataPrevisaoEntrega')} />
            </div>
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={watch('status')} onValueChange={(v) => setValue('status', v as OrdemServicoFormData['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="formaPagamento">Forma de pagamento</Label>
              <Input id="formaPagamento" placeholder="Ex: PIX, Cartão..." {...register('formaPagamento')} />
            </div>
            <div>
              <Label htmlFor="garantiaDias">Garantia (dias)</Label>
              <Input id="garantiaDias" type="number" {...register('garantiaDias', { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="desconto">Desconto (R$)</Label>
              <Input id="desconto" type="number" step="0.01" {...register('desconto', { valueAsNumber: true })} />
            </div>
          </div>
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" {...register('observacoes')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
            <div><Label>Mão de obra</Label><div className="text-lg font-semibold">R$ {valorMaoDeObra.toFixed(2).replace('.', ',')}</div></div>
            <div><Label>Peças</Label><div className="text-lg font-semibold">R$ {valorPecas.toFixed(2).replace('.', ',')}</div></div>
            <div><Label>Total</Label><div className="text-xl font-bold">R$ {valorTotal.toFixed(2).replace('.', ',')}</div></div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit">{isEditing ? 'Atualizar Ordem de Serviço' : 'Abrir Ordem de Serviço'}</Button>
    </form>
  );
}
