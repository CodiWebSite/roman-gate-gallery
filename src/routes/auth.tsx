import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Autentificare · Porți Din Lemn" },
      { name: "description", content: "Pagina de autentificare pentru administrarea site-ului Porți Din Lemn." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Autentificare · Porți Din Lemn" },
      { property: "og:description", content: "Acces la panoul de administrare Porți Din Lemn." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Email invalid").max(255),
  password: z.string().min(6, "Minim 6 caractere").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/admin" });
    } catch {
      // Mesaj generic pentru a nu dezvălui dacă emailul există sau nu.
      toast.error("Email sau parolă incorecte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
        <Link to="/" className="font-display text-2xl font-bold">
          Porți <span className="text-primary">Din Lemn</span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold">Autentificare admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acces la panoul de administrare al site-ului.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Parolă</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-warm px-6 py-3 font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? "Se procesează..." : "Intră în cont"}
          </button>
        </form>
      </div>
    </div>
  );
}
