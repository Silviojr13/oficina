import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from './prisma';

function isAdminEmail(email: string) {
  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: { strategy: 'jwt' },
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        let role = (user as { role?: string }).role ?? 'cliente';

        // Promove pra admin automaticamente no primeiro login, se o e-mail
        // estiver em ADMIN_EMAILS - resolve o problema de "quem promove o
        // primeiro admin". Depois disso, outros usuarios sao promovidos
        // manualmente em /admin/usuarios.
        //
        // Isso precisa acontecer aqui, no jwt callback, e nao no signIn
        // callback: com o PrismaAdapter, o signIn callback roda ANTES do
        // adapter terminar de criar/vincular o usuario no banco, entao
        // "user.id" ainda nao existe como linha real - um
        // prisma.user.update() ali falhava com "No record was found for
        // an update" e derrubava o login inteiro (erro AccessDenied).
        // O jwt callback roda depois desse passo, com o usuario ja
        // persistido de verdade.
        if (user.email && user.id && isAdminEmail(user.email) && role !== 'admin') {
          try {
            await prisma.user.update({ where: { id: user.id }, data: { role: 'admin' } });
            role = 'admin';
          } catch (error) {
            console.error('Erro ao promover usuário para admin:', error);
          }
        }

        token.role = role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) ?? 'cliente';
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
});
