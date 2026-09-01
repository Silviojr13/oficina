'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';
import { requireStaff } from '../auth-guard';

// Publica de proposito - qualquer visitante da loja precisa poder enviar,
// sem estar logado.
export async function createMensagemContato(data: {
  nome: string;
  email: string;
  telefone?: string;
  assunto?: string;
  veiculo?: string;
  mensagem: string;
}) {
  try {
    if (!data.nome || !data.email || !data.mensagem) {
      return { success: false, error: 'Preencha nome, e-mail e mensagem.' };
    }

    const mensagem = await prisma.mensagemContato.create({ data });
    revalidatePath('/admin/mensagens');

    return { success: true, data: mensagem };
  } catch (error) {
    console.error('Erro ao registrar mensagem de contato:', error);
    return { success: false, error: 'Não foi possível enviar sua mensagem. Tente novamente.' };
  }
}

export async function getMensagensContato() {
  try {
    await requireStaff();
    return await prisma.mensagemContato.findMany({ orderBy: { createdAt: 'desc' } });
  } catch (error) {
    console.error('Erro ao buscar mensagens de contato:', error);
    return [];
  }
}

export async function marcarMensagemComoLida(id: string, lida: boolean) {
  try {
    await requireStaff();
    await prisma.mensagemContato.update({ where: { id }, data: { lida } });
    revalidatePath('/admin/mensagens');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar mensagem de contato:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}
