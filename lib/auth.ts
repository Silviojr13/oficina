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
    // Promove pra admin automaticamente no primeiro login, se o e-mail estiver
    // em ADMIN_EMAILS - resolve o problema de "quem promove o primeiro admin".
    // Depois disso, outros usuarios sao promovidos manualmente em /admin/usuarios.
    async signIn({ user }) {
      if (user.email && isAdminEmail(user.email) && user.id && (user as { role?: string }).role !== 'admin') {
        await prisma.user.update({ where: { id: user.id }, data: { role: 'admin' } });
        (user as { role?: string }).role = 'admin';
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? 'cliente';
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
