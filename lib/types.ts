// Tipos do Sistema AutoPeças Pro

export interface VeiculoCompativel {
  id: string;
  montadora: string;
  modelo: string;
  versaoMotor: string;
  anoInicial: number;
  anoFinal: number | null;
  posicao: string;
  observacao: string;
}

export interface Produto {
  id: string;
  nome: string;
  slug: string;
  sku: string;
  codigoOEM: string;
  codigoBarras: string;
  ncm: string;
  cest: string;
  referenciaCruzada: string[];
  marca: string;
  fabricanteOriginal: string;
  paisOrigem: string;
  
  // Compatibilidade
  tipoAplicacao: 'universal' | 'especifico';
  veiculosCompativeis: VeiculoCompativel[];
  tipoPeca: 'original' | 'paralela' | 'remanufaturada' | 'revisada';
  
  // Categorização
  categoria: string;
  subcategoria: string;
  tags: string[];
  localizacaoEstoque: string;
  setorAlmoxarifado: string;
  
  // Especificações
  pesoBruto: number;
  pesoLiquido: number;
  comprimento: number;
  largura: number;
  altura: number;
  unidadeMedida: string;
  conteudoEmbalagem: number;
  material: string;
  cor: string;
  garantia: string;
  fichaTecnicaUrl: string;
  manualUrl: string;
  
  // Precificação
  custoAquisicao: number;
  freteEntrada: number;
  impostosEntrada: number;
  custoTotal: number;
  margemLucro: number;
  precoVendaSugerido: number;
  precoVendaBalcao: number;
  precoB2B: number;
  precoMinimo: number;
  descontoMaximo: number;
  precoSite: number;
  precoPromocional: number | null;
  dataInicioPromocao: string | null;
  dataFimPromocao: string | null;
  exibirNoSite: boolean;
  destaqueHome: boolean;
  
  // Fiscal
  aliquotaICMS: number;
  aliquotaIPI: number;
  cstCsosn: string;
  pisCofins: number;
  regimeTributacao: string;
  
  // Estoque
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  estoqueSeguranca: number;
  controlaEstoque: boolean;
  permiteVendaSemEstoque: boolean;
  fornecedorPadraoId: string;
  prazoReposicao: number;
  
  // Mídia
  fotos: string[];
  imagemPrincipal: string;
  descricaoCurta: string;
  descricaoCompleta: string;
  caracteristicas: string[];
  videoUrl: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Fornecedor {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  contato: string;
  telefone: string;
  email: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  dadosBancarios: {
    banco: string;
    agencia: string;
    conta: string;
    tipoConta: string;
  };
  condicaoPagamentoPadrao: string;
  prazoEntrega: number;
  avaliacao: number;
  observacoes: string;
  createdAt: string;
}

export interface ItemMovimentacao {
  id: string;
  produtoId: string;
  produto?: Produto;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  desconto: number;
  ipi: number;
  icms: number;
  valorTotal: number;
}

export interface EntradaEstoque {
  id: string;
  numeroNF: string;
  chaveAcesso: string;
  dataEmissao: string;
  dataEntrada: string;
  fornecedorId: string;
  fornecedor?: Fornecedor;
  cnpjFornecedor: string;
  tipoEntrada: 'compra' | 'devolucao_cliente' | 'transferencia' | 'ajuste_inventario' | 'brinde';
  condicaoPagamento: string;
  dataVencimento: string;
  formaPagamento: string;
  itens: ItemMovimentacao[];
  subtotalProdutos: number;
  totalDescontos: number;
  totalFrete: number;
  totalIPI: number;
  totalICMSST: number;
  outrasDespesas: number;
  valorTotal: number;
  observacoes: string;
  anexoUrl: string;
  createdAt: string;
}

export interface SaidaEstoque {
  id: string;
  tipoSaida: 'venda_balcao' | 'venda_online' | 'devolucao_fornecedor' | 'transferencia' | 'uso_interno' | 'perda' | 'ajuste';
  numeroPedido: string;
  dataHora: string;
  cliente: string;
  cpfCnpjCliente: string;
  vendedor: string;
  itens: ItemMovimentacao[];
  subtotal: number;
  descontoTotal: number;
  valorFinal: number;
  formasPagamento: string[];
  troco: number;
  observacoes: string;
  emitirNFe: boolean;
  imprimirCupom: boolean;
  createdAt: string;
}

export interface DashboardKPIs {
  vendasHoje: number;
  pedidosHoje: number;
  vendasMes: number;
  variacaoMes: number;
  ticketMedio: number;
  produtosEmFalta: number;
  contasAPagar: number;
  cmvMes: number;
  margemBruta: number;
}

export interface MovimentacaoRecente {
  id: string;
  tipo: 'entrada' | 'saida';
  descricao: string;
  quantidade: number;
  valor: number;
  data: string;
  status: 'concluido' | 'pendente' | 'cancelado';
}

export interface CartItem {
  produto: Produto;
  quantidade: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  desconto: number;
  total: number;
}
