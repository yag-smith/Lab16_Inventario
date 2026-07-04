"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  MailIcon,
  LockIcon,
  LogInIcon,
  Loader2Icon,
  StoreIcon,
  AlertCircleIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");

    if (!email || !password) {
      setError("Ingresa tu email y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        const msg = "Credenciales inválidas o cuenta bloqueada.";
        setError(msg);
        toast.error(msg);
        return;
      }

      toast.success("Sesión iniciada.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      const msg = "No se pudo conectar con el servidor.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    handleLogin();
  }

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
      {/* Fondo decorativo con acento índigo */}
      <div aria-hidden className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar-active via-background to-sidebar-active" />
        <div className="absolute -left-24 -top-24 size-72 rounded-full bg-sidebar-accent-strong/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 size-80 rounded-full bg-sidebar-accent-strong/15 blur-3xl" />
      </div>

      <Card className="relative z-10 w-full max-w-sm shadow-xl">
        <CardHeader className="justify-items-center gap-1.5 text-center">
          <div className="mb-1 flex size-12 items-center justify-center rounded-xl bg-sidebar-accent-strong text-white shadow-sm">
            <StoreIcon className="size-6" />
          </div>
          <CardTitle className="text-xl">
            <span className="text-sidebar-accent-strong">Ventas</span> e
            Inventario
          </CardTitle>
          <CardDescription>Inicia sesión para continuar</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@demo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                  className="h-10 pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  className="h-10 pl-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-10 w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Ingresando…
                </>
              ) : (
                <>
                  <LogInIcon className="size-4" />
                  Ingresar
                </>
              )}
            </Button>

            {error ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
