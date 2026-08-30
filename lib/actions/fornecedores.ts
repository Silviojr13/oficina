'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';

// O formulário (e o restante do admin) trabalha com endereco/dadosBancarios
// aninhados, mas o schema Prisma guarda esses campos "achatados" (colunas
// separadas, já que SQLite não tem tipo objeto). Essas duas funções fazem a
// conversão nos dois sentidos para que nada além desta camada precise saber
// como o dado é armazenado.
function achatarFornecedor(data: any) {
  const { endereco, dadosBancarios, ...resto } = data;
  return {
    ...resto,
    ...(endereco && {
      enderecoLogradouro: endereco.logradouro,
      enderecoNumero: endereco.numero,
      enderecoComplemento: endereco.complemento || null,
      enderecoBairro: endereco.bairro,
      enderecoCidade: endereco.cidade,
      enderecoEstado: endereco.estado,
      enderecoCep: endereco.cep,
    }),
    ...(dadosBancarios && {
      dadosBancariosBanco: dadosBancarios.banco,
      dadosBancariosAgencia: dadosBancarios.agencia,
      dadosBancariosConta: dadosBancarios.conta,
      dadosBancariosTipoConta: dadosBancarios.tipoConta,
    }),
  };
}

function aninharFornecedor<T extends Record<string, any>>(fornecedor: T | null) {
  if (!fornecedor) return null;
  const {
    enderecoLogradouro, enderecoNumero, enderecoComplemento, enderecoBairro, enderecoCidade, enderecoEstado, enderecoCep,
    dadosBancariosBanco, dadosBancariosAgencia, dadosBancariosConta, dadosBancariosTipoConta,
    ...resto
  } = fornecedor;

  return {
    ...resto,
    endereco: {
      logradouro: enderecoLogradouro,
      numero: enderecoNumero,
      complemento: enderecoComplemento ?? '',
      bairro: enderecoBairro,
      cidade: enderecoCidade,
      estado: enderecoEstado,
      cep: enderecoCep,
    },
    dadosBancarios: {
      banco: dadosBancariosBanco,
      agencia: dadosBancariosAgencia,
      conta: dadosBancariosConta,
      tipoConta: dadosBancariosTipoConta,
    },
  };
}

export async function getFornecedor(id: string) {
  try {
    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id },
    });

    return aninharFornecedor(fornecedor);
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);
    return null;
  }
}

export async function getFornecedores(page: number = 1, limit: number = 10, search?: string) {
  try {
    const skip = (page - 1) * limit;

    let whereClause: any = {};
    if (search) {
      whereClause.razaoSocial = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const fornecedores = await prisma.fornecedor.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.fornecedor.count({
      where: whereClause,
    });

    return {
      data: fornecedores.map(aninharFornecedor),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    return { data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } };
  }
}

export async function createFornecedor(data: any) {
  try {
    const fornecedor = await prisma.fornecedor.create({
      data: achatarFornecedor(data),
    });

    revalidatePath('/admin/fornecedores');

    return { success: true, data: aninharFornecedor(fornecedor) };
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function updateFornecedor(id: string, data: any) {
  try {
    const fornecedor = await prisma.fornecedor.update({
      where: { id },
      data: achatarFornecedor(data),
    });

    revalidatePath(`/admin/fornecedores/${id}`);
    revalidatePath('/admin/fornecedores');

    return { success: true, data: aninharFornecedor(fornecedor) };
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function deleteFornecedor(id: string) {
  try {
    await prisma.fornecedor.delete({
      where: { id },
    });

    revalidatePath('/admin/fornecedores');

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar fornecedor:', error);

    const mensagemOriginal = error instanceof Error ? error.message : 'Erro desconhecido';
    if (mensagemOriginal.includes('FOREIGN KEY constraint failed')) {
      return {
        success: false,
        error: 'Este fornecedor já possui entradas de estoque (compras) registradas e não pode ser excluído.',
      };
    }

    return { success: false, error: mensagemOriginal };
  }
}
