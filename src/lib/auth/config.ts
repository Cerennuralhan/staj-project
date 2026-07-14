import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Kullanici } from "@/features/auth/queries";
import type { Rol } from "./permissions";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        eposta: { label: "E-posta", type: "email" },
        sifre: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const eposta = credentials?.eposta as string | undefined;
        const sifre = credentials?.sifre as string | undefined;

        if (!eposta || !sifre) return null;

        await connectDB();
        const kullanici = await Kullanici.findOne({ eposta }).lean();
        if (!kullanici) return null;
        if (!kullanici.aktifMi) return null;

        const valid = await bcrypt.compare(sifre, kullanici.sifre);
        if (!valid) return null;

        return {
          id: kullanici._id.toString(),
          email: kullanici.eposta,
          name: kullanici.adSoyad,
          rol: kullanici.rol as Rol,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = (user as any).rol as Rol;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).rol = token.rol as Rol;
      }
      return session;
    },
    async authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/dashboard")) {
        return !!auth?.user;
      }
      if (pathname === "/login" && auth?.user) {
        return Response.redirect(new URL("/dashboard", request.url));
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
