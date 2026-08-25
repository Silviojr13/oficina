import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Produto, SaidaEstoque, Gasto, Funcionario, Fornecedor, EntradaEstoque } from './types';
import { produtos, vendasMock, gastosMock, funcionariosMock, fornecedores } from './mock-data';

// Função auxiliar para gerar slug
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

interface ProdutoStore {
  produtos: Produto[];
  addProduto: (produto: Omit<Produto, 'id' | 'createdAt' | 'updatedAt' | 'custoTotal'>) => void;
  updateProduto: (id: string, updates: Partial<Omit<Produto, 'id' | 'createdAt' | 'updatedAt' | 'custoTotal'>>) => void;
  deleteProduto: (id: string) => void;
  getProduto: (id: string) => Produto | undefined;
}

interface VendaStore {
  vendas: SaidaEstoque[];
  addVenda: (venda: SaidaEstoque) => void;
  updateVenda: (id: string, updates: Partial<SaidaEstoque>) => void;
  deleteVenda: (id: string) => void;
  getVenda: (id: string) => SaidaEstoque | undefined;
}

interface GastoStore {
  gastos: Gasto[];
  addGasto: (gasto: Omit<Gasto, 'id' | 'createdAt' | 'status'>) => void;
  updateGasto: (id: string, updates: Partial<Omit<Gasto, 'id' | 'createdAt' | 'status'>>) => void;
  deleteGasto: (id: string) => void;
  getGasto: (id: string) => Gasto | undefined;
  marcarComoPago: (id: string) => void;
}

interface FuncionarioStore {
  funcionarios: Funcionario[];
  addFuncionario: (funcionario: Omit<Funcionario, 'id' | 'createdAt'>) => void;
  updateFuncionario: (id: string, updates: Partial<Omit<Funcionario, 'id' | 'createdAt'>>) => void;
  deleteFuncionario: (id: string) => void;
  getFuncionario: (id: string) => Funcionario | undefined;
}

// Novo Store para Fornecedores
interface FornecedorStore {
  fornecedores: Fornecedor[];
  addFornecedor: (fornecedor: Omit<Fornecedor, 'id' | 'createdAt'>) => void;
  updateFornecedor: (id: string, updates: Partial<Omit<Fornecedor, 'id' | 'createdAt'>>) => void;
  deleteFornecedor: (id: string) => void;
  getFornecedor: (id: string) => Fornecedor | undefined;
}

// Novo Store para Entrada de Estoque (Compras)
interface EntradaEstoqueStore {
  entradas: EntradaEstoque[];
  addEntradaEstoque: (entrada: Omit<EntradaEstoque, 'id' | 'createdAt' | 'subtotalProdutos' | 'totalDescontos' | 'totalFrete' | 'totalIPI' | 'totalICMSST' | 'outrasDespesas' | 'valorTotal'>) => void;
  deleteEntradaEstoque: (id: string) => void;
  getEntradaEstoque: (id: string) => EntradaEstoque | undefined;
}

export const useProdutoStore = create<ProdutoStore>()(
  persist(
    (set, get) => ({
      produtos: produtos, // Inicializa com os dados mockados
      addProduto: (novoProduto) => set((state) => ({
        produtos: [...state.produtos, {
          ...novoProduto,
          id: `p${Date.now()}`, // Gerar ID único
          slug: novoProduto.slug || slugify(novoProduto.nome), // Gerar slug se não fornecido
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          custoTotal: novoProduto.custoAquisicao + novoProduto.freteEntrada + novoProduto.impostosEntrada
        }]
      })),
      updateProduto: (id, updates) => set((state) => ({
        produtos: state.produtos.map(p =>
          p.id === id ? {
            ...p,
            ...updates,
            slug: updates.slug || (updates.nome ? slugify(updates.nome) : p.slug), // Atualizar slug se nome mudar
            updatedAt: new Date().toISOString(),
            custoTotal: updates.custoAquisicao !== undefined || updates.freteEntrada !== undefined || updates.impostosEntrada !== undefined
              ? (updates.custoAquisicao ?? p.custoAquisicao) + (updates.freteEntrada ?? p.freteEntrada) + (updates.impostosEntrada ?? p.impostosEntrada)
              : p.custoTotal
          } : p
        )
      })),
      deleteProduto: (id) => set((state) => ({
        produtos: state.produtos.filter(p => p.id !== id)
      })),
      getProduto: (id) => get().produtos.find(p => p.id === id)
    }),
    {
      name: 'produto-storage', // Chave para o localStorage
    }
  )
);

export const useVendaStore = create<VendaStore>()(
  persist(
    (set, get) => ({
      vendas: vendasMock, // Inicializa com os dados mockados
      addVenda: (novaVenda) => set((state) => ({ vendas: [...state.vendas, { ...novaVenda, id: Date.now().toString(), createdAt: new Date().toISOString() }] })),
      updateVenda: (id, updates) => set((state) => ({ vendas: state.vendas.map(v => v.id === id ? { ...v, ...updates } : v) })),
      deleteVenda: (id) => set((state) => ({ vendas: state.vendas.filter(v => v.id !== id) })),
      getVenda: (id) => {
        const state = get();
        return state.vendas.find(v => v.id === id);
      },
    }),
    {
      name: 'venda-storage',
    }
  )
);

export const useGastoStore = create<GastoStore>()(
  persist(
    (set, get) => ({
      gastos: gastosMock, // Inicializa com os dados mockados
      addGasto: (novoGasto) => set((state) => ({ gastos: [...state.gastos, { ...novoGasto, id: Date.now().toString(), createdAt: new Date().toISOString(), status: 'pendente' }] })),
      updateGasto: (id, updates) => set((state) => ({ gastos: state.gastos.map(g => g.id === id ? { ...g, ...updates } : g) })),
      deleteGasto: (id) => set((state) => ({ gastos: state.gastos.filter(g => g.id !== id) })),
      marcarComoPago: (id) => set((state) => ({ gastos: state.gastos.map(g => g.id === id ? { ...g, status: 'pago', dataPagamento: new Date().toISOString() } : g) })),
      getGasto: (id) => {
        const state = get();
        return state.gastos.find(g => g.id === id);
      },
    }),
    {
      name: 'gasto-storage',
    }
  )
);

export const useFuncionarioStore = create<FuncionarioStore>()(
  persist(
    (set, get) => ({
      funcionarios: funcionariosMock, // Inicializa com os dados mockados
      addFuncionario: (novoFuncionario) => set((state) => ({ funcionarios: [...state.funcionarios, { ...novoFuncionario, id: Date.now().toString(), createdAt: new Date().toISOString() }] })),
      updateFuncionario: (id, updates) => set((state) => ({ funcionarios: state.funcionarios.map(f => f.id === id ? { ...f, ...updates } : f) })),
      deleteFuncionario: (id) => set((state) => ({ funcionarios: state.funcionarios.filter(f => f.id !== id) })),
      getFuncionario: (id) => {
        const state = get();
        return state.funcionarios.find(f => f.id === id);
      },
    }),
    {
      name: 'funcionario-storage',
    }
  )
);

// Novo Store para Fornecedores
export const useFornecedorStore = create<FornecedorStore>()(
  persist(
    (set, get) => ({
      fornecedores: fornecedores, // Inicializa com os dados mockados de ./mock-data
      addFornecedor: (fornecedor) => set((state) => ({
        fornecedores: [...state.fornecedores, { ...fornecedor, id: Date.now().toString(), createdAt: new Date().toISOString() }]
      })),
      updateFornecedor: (id, updates) => set((state) => ({
        fornecedores: state.fornecedores.map(f => f.id === id ? { ...f, ...updates } : f)
      })),
      deleteFornecedor: (id) => set((state) => ({
        fornecedores: state.fornecedores.filter(f => f.id !== id)
      })),
      getFornecedor: (id) => {
        const state = get();
        return state.fornecedores.find(f => f.id === id);
      },
    }),
    {
      name: 'fornecedor-storage',
    }
  )
);

// Novo Store para Entrada de Estoque (Compras)
export const useEntradaEstoqueStore = create<EntradaEstoqueStore>()(
  persist(
    (set, get) => ({
      entradas: [], // Inicializa com array vazio
      addEntradaEstoque: (entrada) => set((state) => ({
        entradas: [...state.entradas, { ...entrada, id: Date.now().toString(), createdAt: new Date().toISOString(), subtotalProdutos: 0, totalDescontos: 0, totalFrete: 0, totalIPI: 0, totalICMSST: 0, outrasDespesas: 0, valorTotal: 0 }] // Placeholder values, ideally calculated
      })),
      deleteEntradaEstoque: (id) => set((state) => ({
        entradas: state.entradas.filter(e => e.id !== id)
      })),
      getEntradaEstoque: (id) => {
        const state = get();
        return state.entradas.find(e => e.id === id);
      },
    }),
    {
      name: 'entrada-estoque-storage',
    }
  )
);