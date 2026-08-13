import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Produto, SaidaEstoque, Gasto, Funcionario } from './types';
import { produtos, vendasMock, gastosMock, funcionariosMock } from './mock-data';

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
  addVenda: (venda: Omit<SaidaEstoque, 'id' | 'createdAt' | 'numeroPedido'>) => void;
  deleteVenda: (id: string) => void;
}

interface GastoStore {
  gastos: Gasto[];
  addGasto: (gasto: Omit<Gasto, 'id' | 'createdAt'>) => void;
  updateGasto: (id: string, updates: Partial<Omit<Gasto, 'id' | 'createdAt'>>) => void;
  deleteGasto: (id: string) => void;
  marcarComoPago: (id: string) => void;
}

interface FuncionarioStore {
  funcionarios: Funcionario[];
  addFuncionario: (funcionario: Omit<Funcionario, 'id' | 'createdAt'>) => void;
  updateFuncionario: (id: string, updates: Partial<Omit<Funcionario, 'id' | 'createdAt'>>) => void;
  deleteFuncionario: (id: string) => void;
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
      addVenda: (novaVenda) => {
        const vendasExistentes = get().vendas;
        const ultimoNumero = Math.max(...vendasExistentes.map(v => parseInt(v.numeroPedido.replace('PED-', ''), 10)), 0);
        const proximoNumero = ultimoNumero + 1;
        const numeroPedido = `PED-${proximoNumero.toString().padStart(3, '0')}`;

        set((state) => ({
          vendas: [...state.vendas, {
            ...novaVenda,
            id: `v${Date.now()}`, // Gerar ID único
            numeroPedido, // Atribuir número sequencial
            createdAt: new Date().toISOString()
          }]
        }));
      },
      deleteVenda: (id) => set((state) => ({
        vendas: state.vendas.filter(v => v.id !== id)
      }))
    }),
    {
      name: 'venda-storage', // Chave para o localStorage
    }
  )
);

export const useGastoStore = create<GastoStore>()(
  persist(
    (set) => ({
      gastos: gastosMock, // Inicializa com os dados mockados
      addGasto: (novoGasto) => set((state) => ({
        gastos: [...state.gastos, {
          ...novoGasto,
          id: `g${Date.now()}`, // Gerar ID único
          createdAt: new Date().toISOString(),
          status: novoGasto.status || 'pendente'
        }]
      })),
      updateGasto: (id, updates) => set((state) => ({
        gastos: state.gastos.map(g =>
          g.id === id ? { ...g, ...updates } : g
        )
      })),
      deleteGasto: (id) => set((state) => ({
        gastos: state.gastos.filter(g => g.id !== id)
      })),
      marcarComoPago: (id) => set((state) => ({
        gastos: state.gastos.map(g =>
          g.id === id ? { ...g, status: 'pago', dataPagamento: new Date().toISOString() } : g
        )
      }))
    }),
    {
      name: 'gasto-storage', // Chave para o localStorage
    }
  )
);

export const useFuncionarioStore = create<FuncionarioStore>()(
  persist(
    (set) => ({
      funcionarios: funcionariosMock, // Inicializa com os dados mockados
      addFuncionario: (novoFuncionario) => set((state) => ({
        funcionarios: [...state.funcionarios, {
          ...novoFuncionario,
          id: `f${Date.now()}`, // Gerar ID único
          createdAt: new Date().toISOString(),
          status: novoFuncionario.status || 'ativo'
        }]
      })),
      updateFuncionario: (id, updates) => set((state) => ({
        funcionarios: state.funcionarios.map(f =>
          f.id === id ? { ...f, ...updates } : f
        )
      })),
      deleteFuncionario: (id) => set((state) => ({
        funcionarios: state.funcionarios.filter(f => f.id !== id)
      }))
    }),
    {
      name: 'funcionario-storage', // Chave para o localStorage
    }
  )
);