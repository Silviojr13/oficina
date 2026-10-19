'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';
import { requireAdmin, requireStaff } from '../auth-guard';

export type ConfigEstoque = {
  // Margem que ja vem marcada ao cadastrar produto novo.
  margemPadrao: number;
  // Botoes de margem rapida no cadastro (ex.: 10, 15, 25...).
  margensRapidas: number[];
};

const CHAVE_ESTOQUE = 'estoque';
const PADRAO: ConfigEstoque = { margemPadrao: 30, margensRapidas: [10, 15, 20, 25, 30, 40, 50] };

export async function getConfigEstoque(): Promise<ConfigEstoque> {
  try {
    await requireStaff();
    const linha = await prisma.configuracao.findUnique({ where: { chave: CHAVE_ESTOQUE } });
    if (!linha) return PADRAO;
    const salvo = JSON.parse(linha.valor) as Partial<ConfigEstoque>;
    return { ...PADRAO, ...salvo };
  } catch (error) {
    console.error('Erro ao ler configurações de estoque:', error);
    return PADRAO;
  }
}

export async function salvarConfigEstoque(config: ConfigEstoque) {
  try {
    await requireAdmin();
    const margemPadrao = Number(config.margemPadrao);
    const margensRapidas = Array.from(new Set(config.margensRapidas.map(Number)))
      .filter((m) => Number.isFinite(m) && m >= 0 && m <= 1000)
      .sort((a, b) => a - b);
    if (!Number.isFinite(margemPadrao) || margemPadrao < 0) {
      return { success: false, error: 'Informe uma margem padrão válida.' };
    }
    const valor = JSON.stringify({ margemPadrao, margensRapidas });
    await prisma.configuracao.upsert({
      where: { chave: CHAVE_ESTOQUE },
      create: { chave: CHAVE_ESTOQUE, valor },
      update: { valor },
    });
    revalidatePath('/admin/estoque/configuracoes');
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar configurações de estoque:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}
