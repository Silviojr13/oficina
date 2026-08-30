// Popula o banco de producao (Turso) com dados de EXEMPLO para
// fornecedores, funcionarios, gastos e vendas - pedido explicito do
// usuario para ver o sistema completo funcionando. Idempotente: pula
// o que ja existir (por CNPJ/CPF/SKU).
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

const fornecedoresData = [
  {
    razaoSocial: 'Robert Bosch Ltda', nomeFantasia: 'Bosch', cnpj: '45.990.181/0001-89',
    inscricaoEstadual: '123.456.789.123', contato: 'João Silva', telefone: '(11) 4166-8000', email: 'comercial@bosch.com.br',
    enderecoLogradouro: 'Via Anhanguera', enderecoNumero: 'Km 98', enderecoComplemento: 'Galpão 1',
    enderecoBairro: 'Distrito Industrial', enderecoCidade: 'Campinas', enderecoEstado: 'SP', enderecoCep: '13065-900',
    dadosBancariosBanco: 'Itaú', dadosBancariosAgencia: '1234', dadosBancariosConta: '56789-0', dadosBancariosTipoConta: 'Corrente',
    condicaoPagamentoPadrao: '30/60/90', prazoEntrega: 7, avaliacao: 5, observacoes: 'Fornecedor premium. Entrega sempre no prazo.',
  },
  {
    razaoSocial: 'NGK do Brasil Ltda', nomeFantasia: 'NGK', cnpj: '47.384.984/0001-01',
    inscricaoEstadual: '456.789.123.456', contato: 'Maria Santos', telefone: '(11) 2165-8900', email: 'vendas@ngk.com.br',
    enderecoLogradouro: 'Av. Piraporinha', enderecoNumero: '1950', enderecoComplemento: '',
    enderecoBairro: 'Diadema', enderecoCidade: 'São Paulo', enderecoEstado: 'SP', enderecoCep: '09950-000',
    dadosBancariosBanco: 'Bradesco', dadosBancariosAgencia: '2345', dadosBancariosConta: '67890-1', dadosBancariosTipoConta: 'Corrente',
    condicaoPagamentoPadrao: '30 dias', prazoEntrega: 5, avaliacao: 5, observacoes: 'Especialista em velas e sensores.',
  },
  {
    razaoSocial: 'Cofap Amortecedores S/A', nomeFantasia: 'Cofap', cnpj: '60.476.884/0001-52',
    inscricaoEstadual: '789.123.456.789', contato: 'Carlos Oliveira', telefone: '(11) 3388-5700', email: 'comercial@cofap.com.br',
    enderecoLogradouro: 'Av. Industrial', enderecoNumero: '600', enderecoComplemento: 'Bloco B',
    enderecoBairro: 'Santo André', enderecoCidade: 'São Paulo', enderecoEstado: 'SP', enderecoCep: '09080-500',
    dadosBancariosBanco: 'Santander', dadosBancariosAgencia: '3456', dadosBancariosConta: '78901-2', dadosBancariosTipoConta: 'Corrente',
    condicaoPagamentoPadrao: '28 dias', prazoEntrega: 10, avaliacao: 4, observacoes: 'Líder em suspensão e amortecedores.',
  },
  {
    razaoSocial: 'Mahle Metal Leve S/A', nomeFantasia: 'Mahle', cnpj: '60.894.730/0001-05',
    inscricaoEstadual: '321.654.987.321', contato: 'Ana Pereira', telefone: '(47) 3451-6000', email: 'vendas@mahle.com.br',
    enderecoLogradouro: 'Rod. BR-280', enderecoNumero: 'Km 50', enderecoComplemento: '',
    enderecoBairro: 'Zona Industrial', enderecoCidade: 'Jaraguá do Sul', enderecoEstado: 'SC', enderecoCep: '89256-900',
    dadosBancariosBanco: 'Banco do Brasil', dadosBancariosAgencia: '4567', dadosBancariosConta: '89012-3', dadosBancariosTipoConta: 'Corrente',
    condicaoPagamentoPadrao: '30/60', prazoEntrega: 8, avaliacao: 5, observacoes: 'Especialista em filtros e pistões.',
  },
  {
    razaoSocial: 'Monroe Amortecedores Ltda', nomeFantasia: 'Monroe', cnpj: '61.089.062/0001-90',
    inscricaoEstadual: '654.987.321.654', contato: 'Roberto Costa', telefone: '(11) 4040-5000', email: 'pedidos@monroe.com.br',
    enderecoLogradouro: 'Av. das Indústrias', enderecoNumero: '2200', enderecoComplemento: 'Galpão 3',
    enderecoBairro: 'Guarulhos', enderecoCidade: 'São Paulo', enderecoEstado: 'SP', enderecoCep: '07220-000',
    dadosBancariosBanco: 'Caixa', dadosBancariosAgencia: '5678', dadosBancariosConta: '90123-4', dadosBancariosTipoConta: 'Corrente',
    condicaoPagamentoPadrao: '30 dias', prazoEntrega: 6, avaliacao: 4, observacoes: 'Excelente qualidade em amortecedores.',
  },
];

const funcionariosData = [
  {
    nome: 'Carlos Eduardo Santos', cpf: '111.222.333-44', cargo: 'Mecânico Chefe', setor: 'Oficina',
    telefone: '(41) 98765-4321', email: 'carlos.mecanico@oficinasilvio.com.br',
    dataAdmissao: new Date('2022-03-20'), salario: 3800, comissaoPercentual: 5,
    tipoContrato: 'clt', status: 'ativo', endereco: 'Rua das Palmeiras, 220, Curitiba, PR',
    observacoes: 'Responsável técnico pela oficina mecânica.',
  },
  {
    nome: 'Fernanda Lima', cpf: '222.333.444-55', cargo: 'Eletricista Automotiva', setor: 'Elétrica',
    telefone: '(41) 99123-4567', email: 'fernanda.elet@oficinasilvio.com.br',
    dataAdmissao: new Date('2023-01-10'), salario: 3400, comissaoPercentual: 4,
    tipoContrato: 'clt', status: 'ativo', endereco: 'Av. Sete de Setembro, 850, Curitiba, PR',
    observacoes: 'Especialista em diagnóstico eletrônico e injeção.',
  },
  {
    nome: 'Maria Oliveira', cpf: '333.444.555-66', cargo: 'Atendente / Vendas', setor: 'Balcão',
    telefone: '(41) 98765-1122', email: 'maria.atendimento@oficinasilvio.com.br',
    dataAdmissao: new Date('2023-06-15'), salario: 2200, comissaoPercentual: 2.5,
    tipoContrato: 'clt', status: 'ativo', endereco: 'Rua dos Funcionários, 123, Curitiba, PR',
    observacoes: 'Atendimento ao cliente e vendas de balcão.',
  },
  {
    nome: 'Roberto Andrade', cpf: '444.555.666-77', cargo: 'Auxiliar de Mecânica', setor: 'Oficina',
    telefone: '(41) 98111-2233', email: 'roberto.aux@oficinasilvio.com.br',
    dataAdmissao: new Date('2024-02-01'), salario: 1900, comissaoPercentual: 0,
    tipoContrato: 'clt', status: 'ativo', endereco: 'Rua Marechal Deodoro, 45, Curitiba, PR',
    observacoes: 'Em treinamento com o mecânico chefe.',
  },
];

const gastosData = [
  {
    descricao: 'Aluguel do galpão - mês corrente', categoria: 'aluguel', valor: 3500,
    dataVencimento: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
    formaPagamento: 'TED', status: 'pago', recorrente: true, observacoes: 'Inclui taxa de condomínio.',
  },
  {
    descricao: 'Folha de pagamento - equipe', categoria: 'salarios', valor: 11300,
    dataVencimento: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
    formaPagamento: 'TED', status: 'pago', recorrente: true, observacoes: '',
  },
  {
    descricao: 'Conta de energia elétrica', categoria: 'energia', valor: 680,
    dataVencimento: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
    formaPagamento: 'Boleto', status: 'pendente', recorrente: true, observacoes: '',
  },
  {
    descricao: 'Internet e telefonia', categoria: 'internet', valor: 189.9,
    dataVencimento: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
    formaPagamento: 'Cartão', status: 'pendente', recorrente: true, observacoes: '',
  },
  {
    descricao: 'Manutenção do elevador da oficina', categoria: 'manutencao', valor: 450,
    dataVencimento: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
    formaPagamento: 'PIX', status: 'pendente', recorrente: false, observacoes: 'Revisão semestral preventiva.',
  },
];

async function main() {
  let fCriados = 0;
  for (const f of fornecedoresData) {
    const existe = await prisma.fornecedor.findUnique({ where: { cnpj: f.cnpj } });
    if (existe) { console.log(`- [ja existe] fornecedor ${f.nomeFantasia}`); continue; }
    await prisma.fornecedor.create({ data: f });
    console.log(`+ fornecedor: ${f.nomeFantasia}`);
    fCriados++;
  }

  let funCriados = 0;
  for (const func of funcionariosData) {
    const existe = await prisma.funcionario.findUnique({ where: { cpf: func.cpf } });
    if (existe) { console.log(`- [ja existe] funcionario ${func.nome}`); continue; }
    await prisma.funcionario.create({ data: func });
    console.log(`+ funcionario: ${func.nome} (${func.cargo})`);
    funCriados++;
  }

  let gCriados = 0;
  for (const g of gastosData) {
    const jaTem = await prisma.gasto.findFirst({ where: { descricao: g.descricao } });
    if (jaTem) { console.log(`- [ja existe] gasto ${g.descricao}`); continue; }
    await prisma.gasto.create({ data: g });
    console.log(`+ gasto: ${g.descricao} - R$ ${g.valor}`);
    gCriados++;
  }

  // Vendas de exemplo usando os produtos reais ja cadastrados
  const produtos = await prisma.produto.findMany({ take: 4, orderBy: { createdAt: 'desc' } });
  let vCriadas = 0;
  if (produtos.length >= 2) {
    const jaTemVenda = await prisma.saidaEstoque.count();
    if (jaTemVenda === 0) {
      const item1 = produtos[0];
      const item2 = produtos[1];
      const valorFinal1 = (item1.precoVendaBalcao ?? item1.precoSite ?? 0) * 2;
      await prisma.saidaEstoque.create({
        data: {
          tipoSaida: 'venda_balcao',
          numeroPedido: 'PED-001',
          dataHora: new Date(),
          cliente: 'José Silva',
          cpfCnpjCliente: '123.456.789-00',
          vendedor: 'Maria Oliveira',
          subtotal: valorFinal1,
          descontoTotal: 0,
          valorFinal: valorFinal1,
          formasPagamento: JSON.stringify(['Dinheiro']),
          troco: 0,
          observacoes: '',
          emitirNFe: false,
          imprimirCupom: true,
          itens: {
            create: [{
              produtoId: item1.id, quantidade: 2, unidade: 'UN',
              valorUnitario: item1.precoVendaBalcao ?? item1.precoSite ?? 0,
              desconto: 0, ipi: 0, icms: 0, valorTotal: valorFinal1,
            }],
          },
        },
      });
      vCriadas++;

      const valorUnit2 = item2.precoVendaBalcao ?? item2.precoSite ?? 0;
      await prisma.saidaEstoque.create({
        data: {
          tipoSaida: 'venda_online',
          numeroPedido: 'PED-002',
          dataHora: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          cliente: 'Ana Costa',
          cpfCnpjCliente: '987.654.321-00',
          vendedor: 'Loja Online',
          subtotal: valorUnit2,
          descontoTotal: 0,
          valorFinal: valorUnit2,
          formasPagamento: JSON.stringify(['PIX']),
          troco: 0,
          observacoes: '',
          emitirNFe: false,
          imprimirCupom: false,
          itens: {
            create: [{
              produtoId: item2.id, quantidade: 1, unidade: 'UN',
              valorUnitario: valorUnit2,
              desconto: 0, ipi: 0, icms: 0, valorTotal: valorUnit2,
            }],
          },
        },
      });
      vCriadas++;
      console.log(`+ ${vCriadas} vendas de exemplo criadas`);
    } else {
      console.log('- [ja existe] ja ha vendas registradas, pulando');
    }
  }

  console.log(`\nConcluido: ${fCriados} fornecedores, ${funCriados} funcionarios, ${gCriados} gastos, ${vCriadas} vendas.`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('Erro ao popular dados de exemplo:', error);
  await prisma.$disconnect();
  process.exit(1);
});
