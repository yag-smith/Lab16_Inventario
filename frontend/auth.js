// Configuración de NextAuth v5 (Auth.js). NextAuth es solo la capa de sesión:
// quien autentica de verdad es el backend Express (POST /api/auth/login).
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Estrategia JWT: la sesión vive en una cookie firmada, sin tabla de sesiones.
  session: { strategy: "jwt" },

  // v5 usa AUTH_SECRET; aceptamos también NEXTAUTH_SECRET (nombre de CLAUDE.md).
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,

  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await fetch(`${process.env.API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        // Express maneja credenciales inválidas (401) y bloqueo (423).
        // Devolver null hace que NextAuth muestre el error de credenciales.
        if (!res.ok) return null;

        const { user, accessToken } = await res.json();
        if (!user || !accessToken) return null;

        // Lo que se retorna aquí entra al callback jwt como `user`.
        return {
          id: String(user.id),
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          accessToken,
        };
      },
    }),
  ],

  callbacks: {
    // Se ejecuta al iniciar sesión (con `user`) y en cada request (sin `user`).
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nombre = user.nombre;
        token.rol = user.rol;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    // Expone al cliente solo lo necesario desde el token.
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.id = token.id;
        session.user.nombre = token.nombre;
        session.user.rol = token.rol;
      }
      return session;
    },
  },
});
