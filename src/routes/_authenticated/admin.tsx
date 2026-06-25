import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { claimAdmin } from "@/lib/admin.functions";
import { CATEGORIES, type Project, type VideoItem, type Testimonial, type ProjectSketch, type ProjectPhoto } from "@/lib/site";
import {
  LogOut, Plus, Trash2, ArrowUp, ArrowDown, Loader2, ImageIcon, Video, Star, Settings as SettingsIcon, ExternalLink, Ruler, Hammer,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Administrare · Porți Din Lemn" }] }),
  component: AdminPage,
});

const TABS = [
  { id: "projects", label: "Modele 3D", icon: ImageIcon },
  { id: "real", label: "Lucrări reale", icon: Hammer },
  { id: "videos", label: "Video", icon: Video },
  { id: "testimonials", label: "Testimoniale", icon: Star },
  { id: "settings", label: "Setări", icon: SettingsIcon },
] as const;


const SIGNED_EXPIRY = 60 * 60 * 24 * 365 * 10; // 10 years
const MAX_IMAGE = 200 * 1024 * 1024;
const MAX_VIDEO = 200 * 1024 * 1024;

async function uploadFile(file: File, kind: "image" | "video") {
  const allowed =
    kind === "image"
      ? ["image/jpeg", "image/png", "image/webp"]
      : ["video/mp4", "video/webm", "video/quicktime"];
  if (!allowed.includes(file.type)) {
    throw new Error("Tip de fișier neacceptat.");
  }
  if (file.size > (kind === "image" ? MAX_IMAGE : MAX_VIDEO)) {
    throw new Error(`Fișier prea mare (max 200MB).`);
  }
  const ext = file.name.split(".").pop() || (kind === "image" ? "jpg" : "mp4");
  const path = `${kind}s/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage
    .from("media")
    .createSignedUrl(path, SIGNED_EXPIRY);
  if (signErr) throw signErr;
  return data.signedUrl;
}

function AdminPage() {
  const navigate = useNavigate();
  const claim = useServerFn(claimAdmin);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("projects");

  useEffect(() => {
    claim({})
      .then((r) => setIsAdmin(r.isAdmin))
      .catch(() => setIsAdmin(false))
      .finally(() => setChecking(false));
  }, [claim]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-4 text-center">
        <h1 className="text-2xl font-bold">Acces restricționat</h1>
        <p className="max-w-md text-muted-foreground">
          Contul tău nu are drepturi de administrator. Contactează administratorul site-ului.
        </p>
        <button onClick={signOut} className="rounded-full bg-gradient-warm px-6 py-2.5 font-semibold text-primary-foreground">
          Deconectare
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-display text-xl font-bold">
            Porți <span className="text-primary">Din Lemn</span>
            <span className="ml-2 text-sm font-normal text-muted-foreground">Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary sm:inline-flex">
              <ExternalLink className="h-4 w-4" /> Vezi site
            </Link>
            <button onClick={signOut} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-2 text-sm font-medium hover:bg-muted">
              <LogOut className="h-4 w-4" /> Ieși
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <nav className="mb-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id ? "bg-gradient-warm text-primary-foreground shadow-soft" : "border border-border bg-card hover:bg-secondary"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>

        {tab === "projects" && <ProjectsManager />}
        {tab === "videos" && <VideosManager />}
        {tab === "testimonials" && <TestimonialsManager />}
        {tab === "settings" && <SettingsManager />}
      </div>
    </div>
  );
}

/* ---------- Projects ---------- */
function ProjectsManager() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("sort_order");
      if (error) throw error;
      return data as Project[];
    },
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "projects"] });
    qc.invalidateQueries({ queryKey: ["projects", "published"] });
  };

  const addProject = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadFile(file, "image");
      const max = Math.max(0, ...(data ?? []).map((p) => p.sort_order));
      const { error } = await supabase.from("projects").insert({
        title: "Lucrare nouă",
        image_url: url,
        category: "rustice",
        alt_text: "Poartă din lemn",
        sort_order: max + 1,
      });
      if (error) throw error;
      toast.success("Imagine adăugată. Editează detaliile.");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Eroare la încărcare.");
    } finally {
      setUploading(false);
    }
  };

  const update = async (id: string, patch: Partial<Project>) => {
    const { error } = await supabase.from("projects").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Ștergi această lucrare?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Șters.");
    refresh();
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const list = data ?? [];
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    const a = list[idx], b = list[target];
    await supabase.from("projects").update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabase.from("projects").update({ sort_order: a.sort_order }).eq("id", b.id);
    refresh();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Lucrări portofoliu</h2>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-warm px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Adaugă lucrare
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && addProject(e.target.files[0])}
        />
      </div>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="space-y-4">
          {(data ?? []).map((p, idx) => (
            <div key={p.id} className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[120px_1fr_auto]">
              <img src={p.image_url} alt={p.alt_text || p.title} className="h-24 w-full rounded-lg object-cover sm:w-[120px]" />
              <div className="grid gap-2 sm:grid-cols-2">
                <Input label="Titlu" value={p.title} onBlur={(v) => update(p.id, { title: v })} />
                <Input label="Localitate" value={p.location || ""} onBlur={(v) => update(p.id, { location: v })} />
                <div>
                  <Lbl>Categorie</Lbl>
                  <select
                    defaultValue={p.category}
                    onChange={(e) => update(p.id, { category: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <Input label="Text ALT (SEO)" value={p.alt_text || ""} onBlur={(v) => update(p.id, { alt_text: v })} />
                <div className="sm:col-span-2">
                  <Input label="Descriere" value={p.description || ""} onBlur={(v) => update(p.id, { description: v })} />
                </div>
                <div className="flex flex-wrap gap-4 sm:col-span-2">
                  <Toggle label="Publicat" checked={p.published} onChange={(v) => update(p.id, { published: v })} />
                  <Toggle label="Featured" checked={p.featured} onChange={(v) => update(p.id, { featured: v })} />
                </div>
                <div className="sm:col-span-2">
                  <PhotosManager projectId={p.id} />
                </div>
                <div className="sm:col-span-2">
                  <SketchesManager projectId={p.id} />
                </div>
              </div>
              <div className="flex flex-row gap-2 sm:flex-col">
                <IconBtn onClick={() => move(idx, -1)}><ArrowUp className="h-4 w-4" /></IconBtn>
                <IconBtn onClick={() => move(idx, 1)}><ArrowDown className="h-4 w-4" /></IconBtn>
                <IconBtn danger onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Sketches (per project) ---------- */
function SketchesManager({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "sketches", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_sketches")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order");
      if (error) throw error;
      return data as ProjectSketch[];
    },
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "sketches", projectId] });
    qc.invalidateQueries({ queryKey: ["project_sketches", "all"] });
  };

  const addSketches = async (files: FileList) => {
    setUploading(true);
    try {
      let max = Math.max(0, ...(data ?? []).map((s) => s.sort_order));
      const rows: { project_id: string; image_url: string; alt_text: string; sort_order: number }[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadFile(file, "image");
        max += 1;
        rows.push({ project_id: projectId, image_url: url, alt_text: "Schiță poartă din lemn", sort_order: max });
      }
      const { error } = await supabase.from("project_sketches").insert(rows);
      if (error) throw error;
      toast.success(`${rows.length} schiț${rows.length === 1 ? "ă adăugată" : "e adăugate"}.`);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Eroare la încărcare.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Ștergi această schiță?")) return;
    const { error } = await supabase.from("project_sketches").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  return (
    <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <Lbl>
          <span className="inline-flex items-center gap-1">
            <Ruler className="h-3.5 w-3.5" /> Schițe (dimensiuni)
          </span>
        </Lbl>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Adaugă schițe
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files?.length && addSketches(e.target.files)}
        />
      </div>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (data ?? []).length === 0 ? (
        <p className="text-xs text-muted-foreground">Nicio schiță. Poți încărca mai multe odată.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(data ?? []).map((s) => (
            <div key={s.id} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-white">
              <img src={s.image_url} alt={s.alt_text || "Schiță"} className="h-full w-full object-contain" />
              <button
                onClick={() => remove(s.id)}
                aria-label="Șterge schița"
                className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Photos (per project) ---------- */
function PhotosManager({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "photos", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_photos")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order");
      if (error) throw error;
      return data as ProjectPhoto[];
    },
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "photos", projectId] });
    qc.invalidateQueries({ queryKey: ["project_photos", "all"] });
  };

  const addPhotos = async (files: FileList) => {
    setUploading(true);
    try {
      let max = Math.max(0, ...(data ?? []).map((s) => s.sort_order));
      const rows: { project_id: string; image_url: string; alt_text: string; sort_order: number }[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadFile(file, "image");
        max += 1;
        rows.push({ project_id: projectId, image_url: url, alt_text: "Poartă din lemn", sort_order: max });
      }
      const { error } = await supabase.from("project_photos").insert(rows);
      if (error) throw error;
      toast.success(`${rows.length} poz${rows.length === 1 ? "ă adăugată" : "e adăugate"}.`);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Eroare la încărcare.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Ștergi această poză?")) return;
    const { error } = await supabase.from("project_photos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  return (
    <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <Lbl>
          <span className="inline-flex items-center gap-1">
            <ImageIcon className="h-3.5 w-3.5" /> Poze lucrare (galerie)
          </span>
        </Lbl>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Adaugă poze
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files?.length && addPhotos(e.target.files)}
        />
      </div>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (data ?? []).length === 0 ? (
        <p className="text-xs text-muted-foreground">Nicio poză suplimentară. Poți încărca mai multe odată.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(data ?? []).map((s) => (
            <div key={s.id} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-white">
              <img src={s.image_url} alt={s.alt_text || "Poză"} className="h-full w-full object-cover" />
              <button
                onClick={() => remove(s.id)}
                aria-label="Șterge poza"
                className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/* ---------- Videos ---------- */

function VideosManager() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "videos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("videos").select("*").order("sort_order");
      if (error) throw error;
      return data as VideoItem[];
    },
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "videos"] });
    qc.invalidateQueries({ queryKey: ["videos", "published"] });
  };

  const addVideo = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadFile(file, "video");
      const max = Math.max(0, ...(data ?? []).map((v) => v.sort_order));
      const { error } = await supabase.from("videos").insert({
        title: "Videoclip nou",
        video_url: url,
        sort_order: max + 1,
      });
      if (error) throw error;
      toast.success("Video adăugat.");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Eroare la încărcare.");
    } finally {
      setUploading(false);
    }
  };

  const update = async (id: string, patch: Partial<VideoItem>) => {
    const { error } = await supabase.from("videos").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Ștergi acest video?")) return;
    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Videoclipuri</h2>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-warm px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Adaugă video
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && addVideo(e.target.files[0])}
        />
      </div>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="space-y-4">
          {(data ?? []).map((v) => (
            <div key={v.id} className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[200px_1fr_auto]">
              <video src={v.video_url} controls preload="none" className="aspect-video w-full rounded-lg bg-black sm:w-[200px]" />
              <div className="grid gap-2">
                <Input label="Titlu" value={v.title} onBlur={(val) => update(v.id, { title: val })} />
                <Input label="Descriere" value={v.description || ""} onBlur={(val) => update(v.id, { description: val })} />
                <div className="flex flex-wrap gap-4">
                  <Toggle label="Publicat" checked={v.published} onChange={(val) => update(v.id, { published: val })} />
                  <Toggle label="Featured" checked={v.featured} onChange={(val) => update(v.id, { featured: val })} />
                </div>
              </div>
              <div className="flex sm:flex-col">
                <IconBtn danger onClick={() => remove(v.id)}><Trash2 className="h-4 w-4" /></IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Testimonials ---------- */
function TestimonialsManager() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("testimonials").select("*").order("sort_order");
      if (error) throw error;
      return data as Testimonial[];
    },
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
    qc.invalidateQueries({ queryKey: ["testimonials", "published"] });
  };
  const add = async () => {
    const max = Math.max(0, ...(data ?? []).map((t) => t.sort_order));
    const { error } = await supabase.from("testimonials").insert({
      author: "Client nou", content: "Recenzie...", rating: 5, sort_order: max + 1,
    });
    if (error) return toast.error(error.message);
    refresh();
  };
  const update = async (id: string, patch: Partial<Testimonial>) => {
    const { error } = await supabase.from("testimonials").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Ștergi acest testimonial?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Testimoniale</h2>
        <button onClick={add} className="inline-flex items-center gap-2 rounded-full bg-gradient-warm px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> Adaugă
        </button>
      </div>
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="space-y-4">
          {(data ?? []).map((t) => (
            <div key={t.id} className="grid gap-2 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto]">
              <div className="grid gap-2 sm:grid-cols-2">
                <Input label="Autor" value={t.author} onBlur={(v) => update(t.id, { author: v })} />
                <Input label="Localitate" value={t.location || ""} onBlur={(v) => update(t.id, { location: v })} />
                <div className="sm:col-span-2">
                  <Input label="Recenzie" value={t.content} onBlur={(v) => update(t.id, { content: v })} />
                </div>
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <Lbl>Stele</Lbl>
                    <select defaultValue={t.rating} onChange={(e) => update(t.id, { rating: Number(e.target.value) })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <Toggle label="Publicat" checked={t.published} onChange={(v) => update(t.id, { published: v })} />
                </div>
              </div>
              <div className="flex sm:flex-col">
                <IconBtn danger onClick={() => remove(t.id)}><Trash2 className="h-4 w-4" /></IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Settings ---------- */
const SETTING_FIELDS = [
  { key: "whatsapp_number", label: "Număr WhatsApp (cu prefix țară, fără +)" },
  { key: "company_name", label: "Denumire firmă" },
  { key: "company_cui", label: "CUI" },
  { key: "company_reg", label: "Nr. Reg. Comerțului" },
  { key: "company_address", label: "Sediu social" },
  { key: "company_email", label: "Email" },
  { key: "company_phone", label: "Telefon" },
];

function SettingsManager() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key, value");
      if (error) throw error;
      const map: Record<string, string> = {};
      (data ?? []).forEach((r) => { if (r.value != null) map[r.key] = r.value; });
      return map;
    },
  });

  const save = async (key: string, value: string) => {
    const { error } = await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
    if (error) return toast.error(error.message);
    toast.success("Salvat.");
    qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  };

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

  return (
    <div className="max-w-xl">
      <h2 className="mb-4 text-xl font-bold">Setări firmă</h2>
      <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
        {SETTING_FIELDS.map((f) => (
          <Input key={f.key} label={f.label} value={data?.[f.key] || ""} onBlur={(v) => save(f.key, v)} />
        ))}
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */
function Lbl({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-xs font-medium text-muted-foreground">{children}</label>;
}
function Input({ label, value, onBlur }: { label: string; value: string; onBlur: (v: string) => void }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <div>
      <Lbl>{label}</Lbl>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => v !== value && onBlur(v)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
      {label}
    </label>
  );
}
function IconBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors ${
        danger ? "text-destructive hover:bg-destructive/10" : "hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}
