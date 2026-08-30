// Insere produtos reais de teste direto no banco de producao (Turso),
// usando exatamente a mesma forma de dado que lib/actions/produtos.ts
// grava (campos array serializados como JSON, custoTotal calculado).
// Objetivo: testar o cadastro de produto ponta a ponta contra o banco real.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function imagemPlaceholder(nome, cor) {
  const texto = encodeURIComponent(nome.replace(/\s+/g, '+'));
  return `https://placehold.co/800x800/${cor}/ffffff/png?text=${texto}`;
}

const produtos = [
  {
    nome: 'Filtro de Óleo Mann Filter W712/94',
    sku: 'FLT-OLEO-MF-001',
    codigoOEM: '06A115561B',
    codigoBarras: '4011558929876',
    marca: 'Mann Filter',
    fabricanteOriginal: 'Mann+Hummel',
    paisOrigem: 'Alemanha',
    categoria: 'Filtros',
    subcategoria: 'Filtro de Óleo',
    tipoAplicacao: 'especifico',
    tipoPeca: 'original',
    custoAquisicao: 18.9,
    margemLucro: 55,
    precoVendaBalcao: 34.9,
    precoSite: 32.9,
    estoqueAtual: 42,
    estoqueMinimo: 10,
    estoqueMaximo: 100,
    garantia: '90 dias',
    cor: '#1e3a5f',
    descricaoCurta: 'Filtro de óleo original para motores VW/Fiat 1.0 a 1.6.',
    descricaoCompleta: 'Filtro de óleo Mann Filter de alta filtragem, recomendado para troca a cada revisão. Compatível com a maioria dos motores VW EA111 e Fiat Fire.',
    caracteristicas: ['Elemento filtrante de papel plissado', 'Válvula anti-retorno', 'Rosca padrão OEM'],
    veiculos: [
      { montadora: 'Volkswagen', modelo: 'Gol', versaoMotor: '1.0/1.6 8V', anoInicial: 2008, anoFinal: 2016, posicao: 'Motor' },
      { montadora: 'Fiat', modelo: 'Uno', versaoMotor: '1.0/1.4 Fire', anoInicial: 2010, anoFinal: 2021, posicao: 'Motor' },
    ],
    fornecedorBusca: 'Mann',
    destaqueHome: true,
  },
  {
    nome: 'Pastilha de Freio Dianteira Bosch BN0986',
    sku: 'FRE-PAST-BOS-002',
    codigoOEM: '1J0698151',
    codigoBarras: '4047024567812',
    marca: 'Bosch',
    fabricanteOriginal: 'Robert Bosch',
    paisOrigem: 'Brasil',
    categoria: 'Freios',
    subcategoria: 'Pastilhas',
    tipoAplicacao: 'especifico',
    tipoPeca: 'original',
    custoAquisicao: 62,
    margemLucro: 48,
    precoVendaBalcao: 109.9,
    precoSite: 99.9,
    estoqueAtual: 28,
    estoqueMinimo: 8,
    estoqueMaximo: 60,
    garantia: '12 meses',
    cor: '#7a1f1f',
    descricaoCurta: 'Jogo de pastilhas de freio dianteiras, baixo ruído e baixa geração de pó.',
    descricaoCompleta: 'Pastilhas de freio Bosch com composto cerâmico de baixo ruído, indicadas para uso urbano e rodoviário. Jogo com 4 unidades + acessórios de fixação.',
    caracteristicas: ['Composto cerâmico', 'Indicador de desgaste sonoro', 'Jogo com 4 peças'],
    veiculos: [
      { montadora: 'Volkswagen', modelo: 'Polo', versaoMotor: '1.0/1.6', anoInicial: 2018, anoFinal: 2024, posicao: 'Dianteiro' },
    ],
    fornecedorBusca: 'Bosch',
    destaqueHome: true,
  },
  {
    nome: 'Vela de Ignição NGK Iridium IX BKR6EIX',
    sku: 'ELE-VELA-NGK-003',
    codigoOEM: '101905631S',
    codigoBarras: '4934458226815',
    marca: 'NGK',
    fabricanteOriginal: 'NGK Spark Plug',
    paisOrigem: 'Japão',
    categoria: 'Elétrica',
    subcategoria: 'Velas de Ignição',
    tipoAplicacao: 'universal',
    tipoPeca: 'original',
    custoAquisicao: 24,
    margemLucro: 60,
    precoVendaBalcao: 44.9,
    precoSite: 39.9,
    estoqueAtual: 3,
    estoqueMinimo: 8,
    estoqueMaximo: 80,
    garantia: '6 meses',
    cor: '#b8860b',
    descricaoCurta: 'Vela de ignição de irídio, maior durabilidade e melhor ignição.',
    descricaoCompleta: 'Vela de ignição NGK linha Iridium IX, eletrodo central de irídio para faísca mais precisa, maior economia de combustível e vida útil estendida.',
    caracteristicas: ['Eletrodo de irídio 0.6mm', 'Vida útil até 100.000 km', 'Vendida unitária'],
    fornecedorBusca: 'NGK',
  },
  {
    nome: 'Bateria Moura M60GD 60Ah',
    sku: 'ELE-BAT-MOU-004',
    codigoBarras: '7896262701234',
    marca: 'Moura',
    fabricanteOriginal: 'Moura Baterias',
    paisOrigem: 'Brasil',
    categoria: 'Elétrica',
    subcategoria: 'Baterias',
    tipoAplicacao: 'universal',
    tipoPeca: 'original',
    custoAquisicao: 310,
    margemLucro: 35,
    precoVendaBalcao: 469.9,
    precoSite: 449.9,
    estoqueAtual: 12,
    estoqueMinimo: 3,
    estoqueMaximo: 20,
    garantia: '18 meses',
    cor: '#1f4d1f',
    descricaoCurta: 'Bateria automotiva 60Ah, ideal para veículos com ar-condicionado e som.',
    descricaoCompleta: 'Bateria Moura 60Ah com tecnologia de liga de cálcio-prata, baixa manutenção e maior vida útil. Indicada para a maioria dos veículos de passeio nacionais.',
    caracteristicas: ['60 Ah / 12V', 'Livre de manutenção', 'Garantia de 18 meses'],
    fornecedorBusca: 'Moura',
    destaqueHome: true,
  },
  {
    nome: 'Amortecedor Dianteiro Cofap Gol G5/G6',
    sku: 'SUS-AMORT-COF-005',
    codigoOEM: '5U0413031M',
    marca: 'Cofap',
    fabricanteOriginal: 'Cofap',
    paisOrigem: 'Brasil',
    categoria: 'Suspensão',
    subcategoria: 'Amortecedores',
    tipoAplicacao: 'especifico',
    tipoPeca: 'original',
    custoAquisicao: 95,
    margemLucro: 40,
    precoVendaBalcao: 169.9,
    precoSite: 159.9,
    estoqueAtual: 16,
    estoqueMinimo: 4,
    estoqueMaximo: 40,
    garantia: '12 meses',
    cor: '#374151',
    descricaoCurta: 'Amortecedor dianteiro a gás, vendido unitário.',
    descricaoCompleta: 'Amortecedor Cofap linha Premium, sistema pressurizado a gás para maior estabilidade e conforto. Recomenda-se a troca do par.',
    caracteristicas: ['Sistema a gás', 'Haste cromada', 'Vendido unitário'],
    veiculos: [
      { montadora: 'Volkswagen', modelo: 'Gol', versaoMotor: '1.0/1.6', anoInicial: 2008, anoFinal: 2016, posicao: 'Dianteiro' },
    ],
    fornecedorBusca: 'Cofap',
  },
  {
    nome: 'Kit Correia Dentada Gates com Tensor',
    sku: 'COR-KIT-GAT-006',
    codigoOEM: '06A198119',
    marca: 'Gates',
    fabricanteOriginal: 'Gates Corporation',
    paisOrigem: 'Estados Unidos',
    categoria: 'Correia e Corrente',
    subcategoria: 'Kits de Correia',
    tipoAplicacao: 'especifico',
    tipoPeca: 'original',
    custoAquisicao: 145,
    margemLucro: 42,
    precoVendaBalcao: 259.9,
    precoSite: 239.9,
    estoqueAtual: 9,
    estoqueMinimo: 3,
    estoqueMaximo: 25,
    garantia: '12 meses',
    cor: '#0f766e',
    descricaoCurta: 'Kit completo: correia dentada + tensor + polia.',
    descricaoCompleta: 'Kit de distribuição Gates PowerGrip, inclui correia dentada, tensor e polia guia. Recomendado trocar a cada 60.000 km ou 4 anos.',
    caracteristicas: ['Correia + tensor + polia', 'Dentes reforçados', 'Recomendado a cada 60.000 km'],
    fornecedorBusca: 'Gates',
  },
  {
    nome: 'Alternador Bosch 90A Remanufaturado',
    sku: 'ELE-ALT-BOS-007',
    codigoOEM: '03G903023E',
    marca: 'Bosch',
    fabricanteOriginal: 'Robert Bosch',
    paisOrigem: 'Brasil',
    categoria: 'Elétrica',
    subcategoria: 'Alternadores',
    tipoAplicacao: 'especifico',
    tipoPeca: 'remanufaturada',
    custoAquisicao: 280,
    margemLucro: 38,
    precoVendaBalcao: 489.9,
    precoSite: 459.9,
    estoqueAtual: 5,
    estoqueMinimo: 2,
    estoqueMaximo: 15,
    garantia: '12 meses',
    cor: '#4c1d95',
    descricaoCurta: 'Alternador remanufaturado 90A, testado e com garantia.',
    descricaoCompleta: 'Alternador Bosch remanufaturado com peças originais, testado em bancada antes do envio. Ideal para reposição com qualidade original a um custo menor.',
    caracteristicas: ['90 Amperes', 'Testado em bancada', 'Peça remanufaturada com garantia'],
    fornecedorBusca: 'Bosch',
  },
  {
    nome: 'Radiador de Arrefecimento Chevrolet Onix',
    sku: 'ARR-RAD-VAL-008',
    codigoOEM: '52057351',
    marca: 'Valeo',
    fabricanteOriginal: 'Valeo',
    paisOrigem: 'França',
    categoria: 'Arrefecimento',
    subcategoria: 'Radiadores',
    tipoAplicacao: 'especifico',
    tipoPeca: 'original',
    custoAquisicao: 210,
    margemLucro: 36,
    precoVendaBalcao: 359.9,
    precoSite: 339.9,
    estoqueAtual: 7,
    estoqueMinimo: 2,
    estoqueMaximo: 20,
    garantia: '12 meses',
    cor: '#0369a1',
    descricaoCurta: 'Radiador de arrefecimento em alumínio, encaixe original.',
    descricaoCompleta: 'Radiador Valeo em colmeia de alumínio com reservatório plástico, mesma especificação de fábrica. Indicado para veículos com ar-condicionado.',
    caracteristicas: ['Colmeia de alumínio', 'Encaixe original', 'Compatível com ar-condicionado'],
    veiculos: [
      { montadora: 'Chevrolet', modelo: 'Onix', versaoMotor: '1.0/1.4', anoInicial: 2013, anoFinal: 2019, posicao: 'Frontal' },
    ],
    fornecedorBusca: 'Bosch',
  },
  {
    nome: 'Kit de Embreagem Sachs Completo',
    sku: 'EMB-KIT-SAC-009',
    codigoOEM: '3000951001',
    marca: 'Sachs',
    fabricanteOriginal: 'ZF Sachs',
    paisOrigem: 'Alemanha',
    categoria: 'Embreagem',
    subcategoria: 'Kit Completo',
    tipoAplicacao: 'especifico',
    tipoPeca: 'original',
    custoAquisicao: 320,
    margemLucro: 34,
    precoVendaBalcao: 529.9,
    precoSite: 499.9,
    estoqueAtual: 6,
    estoqueMinimo: 2,
    estoqueMaximo: 15,
    garantia: '12 meses',
    cor: '#78350f',
    descricaoCurta: 'Kit de embreagem completo: platô, disco e rolamento.',
    descricaoCompleta: 'Kit de embreagem Sachs com platô, disco de embreagem e rolamento (atuador), balanceados de fábrica para instalação conjunta.',
    caracteristicas: ['Platô + disco + rolamento', 'Balanceamento de fábrica', 'Instalação recomendada em conjunto'],
    fornecedorBusca: 'Mahle',
  },
  {
    nome: 'Farol Dianteiro LED Ford Ka (Lado Direito)',
    sku: 'ILU-FAR-ARB-010',
    codigoOEM: 'JR3B13W029AA',
    marca: 'Arteb',
    fabricanteOriginal: 'Arteb Ind. e Com.',
    paisOrigem: 'Brasil',
    categoria: 'Iluminação',
    subcategoria: 'Faróis',
    tipoAplicacao: 'especifico',
    tipoPeca: 'paralela',
    custoAquisicao: 180,
    margemLucro: 45,
    precoVendaBalcao: 329.9,
    precoSite: 309.9,
    estoqueAtual: 4,
    estoqueMinimo: 2,
    estoqueMaximo: 12,
    garantia: '90 dias',
    cor: '#facc15',
    descricaoCurta: 'Farol dianteiro com LED de duplo foco, lado direito.',
    descricaoCompleta: 'Farol dianteiro Arteb com tecnologia LED, encaixe original, sem necessidade de adaptação. Vendido unitário (lado direito).',
    caracteristicas: ['Tecnologia LED', 'Encaixe original', 'Vendido unitário'],
    veiculos: [
      { montadora: 'Ford', modelo: 'Ka', versaoMotor: '1.0/1.5', anoInicial: 2015, anoFinal: 2021, posicao: 'Dianteiro direito' },
    ],
    fornecedorBusca: 'Bosch',
  },
];

async function main() {
  const fornecedores = await prisma.fornecedor.findMany({ select: { id: true, nomeFantasia: true } });

  console.log(`Conectado. ${fornecedores.length} fornecedores encontrados no banco.`);
  let criados = 0;

  for (const p of produtos) {
    const jaExiste = await prisma.produto.findUnique({ where: { sku: p.sku } });
    if (jaExiste) {
      console.log(`- [ja existe] ${p.nome} (${p.sku})`);
      continue;
    }

    const fornecedor = fornecedores.find((f) => f.nomeFantasia?.toLowerCase().includes(p.fornecedorBusca?.toLowerCase() ?? '\0'));
    const custoTotal = (p.custoAquisicao ?? 0);

    const produto = await prisma.produto.create({
      data: {
        nome: p.nome,
        slug: slugify(p.nome),
        sku: p.sku,
        codigoOEM: p.codigoOEM ?? null,
        codigoBarras: p.codigoBarras ?? null,
        marca: p.marca,
        fabricanteOriginal: p.fabricanteOriginal ?? null,
        paisOrigem: p.paisOrigem ?? null,
        tipoAplicacao: p.tipoAplicacao,
        tipoPeca: p.tipoPeca,
        categoria: p.categoria,
        subcategoria: p.subcategoria ?? null,
        custoAquisicao: p.custoAquisicao ?? null,
        custoTotal,
        margemLucro: p.margemLucro ?? null,
        precoVendaBalcao: p.precoVendaBalcao ?? null,
        precoVendaSugerido: p.precoVendaBalcao ?? null,
        precoSite: p.precoSite ?? null,
        estoqueAtual: p.estoqueAtual ?? 0,
        estoqueMinimo: p.estoqueMinimo ?? null,
        estoqueMaximo: p.estoqueMaximo ?? null,
        controlaEstoque: true,
        permiteVendaSemEstoque: false,
        garantia: p.garantia ?? null,
        imagemPrincipal: imagemPlaceholder(p.nome, p.cor.replace('#', '')),
        fotos: JSON.stringify([imagemPlaceholder(p.nome, p.cor.replace('#', ''))]),
        descricaoCurta: p.descricaoCurta ?? null,
        descricaoCompleta: p.descricaoCompleta ?? null,
        caracteristicas: p.caracteristicas ? JSON.stringify(p.caracteristicas) : null,
        exibirNoSite: true,
        destaqueHome: !!p.destaqueHome,
        fornecedorPadraoId: fornecedor?.id ?? null,
        veiculosCompativeis: p.veiculos?.length
          ? { create: p.veiculos.map((v) => ({ ...v, observacao: v.observacao ?? '' })) }
          : undefined,
      },
    });

    console.log(`+ criado: ${produto.nome} (${produto.sku}) -> fornecedor: ${fornecedor?.nomeFantasia ?? 'nenhum'}`);
    criados++;
  }

  console.log(`\nConcluido. ${criados} produtos novos criados de ${produtos.length} no total.`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('Erro ao adicionar produtos:', error);
  await prisma.$disconnect();
  process.exit(1);
});
