'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';
import { requireAdmin } from '../auth-guard';

const PAPEIS_VALIDOS = ['cliente', 'funcionario', 'admin'];

export async function getUsuarios() {
  try {
    await requireAdmin();
    const usuarios = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, image: true, role: true, createdAt: true },
    });
    return usuarios;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
}

export async function updateUsuarioRole(userId: string, role: string) {
  try {
    const session = await requireAdmin();
    if (!PAPEIS_VALIDOS.includes(role)) {
      return { success: false, error: 'Papel inválido.' };
    }
    if (session.user.id === userId && role !== 'admin') {
      return { success: false, error: 'Você não pode remover seu próprio acesso de admin.' };
    }

    await prisma.user.update({ where: { id: userId }, data: { role } });
    revalidatePath('/admin/usuarios');
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar papel do usuário:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}
