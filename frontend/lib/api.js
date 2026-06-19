// Cliente fetch para hablar con el backend Express. Lee la sesión de NextAuth y
// adjunta Authorization: Bearer <accessToken> en cada llamada.
// Uso desde el servidor (Server Components, Route Handlers, Server Actions),
// ya que auth() necesita acceso a las cookies de la petición.
import { auth } from "@/auth";

const API_URL = process.env.API_URL;

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const session = await auth();
  const token = session?.accessToken;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store", // datos siempre frescos; nunca cachear respuestas autenticadas
  });

  // 204 No Content (p. ej. DELETE) no trae cuerpo.
  const texto = await res.text();
  const data = texto ? JSON.parse(texto) : null;

  if (!res.ok) {
    const error = new Error(data?.error || `Error ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const apiGet = (path, opts) => request(path, { ...opts, method: "GET" });
export const apiPost = (path, body, opts) => request(path, { ...opts, method: "POST", body });
export const apiPut = (path, body, opts) => request(path, { ...opts, method: "PUT", body });
export const apiPatch = (path, body, opts) => request(path, { ...opts, method: "PATCH", body });
export const apiDelete = (path, opts) => request(path, { ...opts, method: "DELETE" });
