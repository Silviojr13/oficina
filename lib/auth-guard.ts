import 'server-only';
import { auth } from './auth';

// Guarda de autorizacao para Server Actions - a proteção real, nao so a UI
// escondendo botao/menu. Toda action sensivel (excluir, financeiro, gestao de
// equipe, integracoes) precisa chamar isso antes de tocar no banco, porque o
// proxy.ts so cobre navegacao de pagina, nao chamadas de Server Action feitas
// por um cliente que ja tinha a pagina carregada antes de perder permissao.
export class UnauthorizedError extends Error {}

export async function requireRole(...roles: string[]) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || !roles.includes(role)) {
    throw new UnauthorizedError('Você não tem permissão para executar esta ação.');
  }
  return session!;
}

export async function requireAdmin() {
  return requireRole('admin');
}

// Funcionario e admin podem acessar; cliente nao.
export async function requireStaff() {
  return requireRole('admin', 'funcionario');
}
