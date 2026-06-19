// Route handler de NextAuth: expone GET y POST desde la config central (auth.js).
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
