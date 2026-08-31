import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Paginas do admin que o perfil Funcionario nao pode acessar - financeiro,
// gestao de equipe, integracoes e a propria tela de usuarios.
const ROTAS_SO_ADMIN = [
  '/admin/gastos',
  '/admin/funcionarios',
  '/admin/integracoes',
  '/admin/relatorios',
  '/admin/usuarios',
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  const role = session.user.role;

  // Cliente nunca acessa o admin - so funcionario e admin.
  if (role === 'cliente') {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  if (
    role === 'funcionario' &&
    ROTAS_SO_ADMIN.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`))
  ) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*'],
};
