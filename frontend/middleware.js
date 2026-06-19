// Protege las rutas privadas. Sin sesión, redirige a /login.
import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return Response.redirect(loginUrl);
  }
});

// Solo intercepta lo que cuelga de /dashboard.
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
