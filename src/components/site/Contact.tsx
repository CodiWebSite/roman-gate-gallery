import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Reveal } from "@/components/Reveal";
import { useSettings, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { Mail, Phone, MapPin } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(2, "Introdu numele").max(100),
  phone: z.string().trim().min(6, "Introdu un telefon valid").max(30),
  city: z.string().trim().min(2, "Introdu localitatea").max(100),
  message: z.string().trim().min(5, "Scrie un mesaj").max(1000),
});

export function Contact() {
  const { data: settings } = useSettings();
  const [form, setForm] = useState({ name: "", phone: "", city: "", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    const msg = `Bună ziua! Numele meu este ${form.name} (${form.phone}), din ${form.city}. ${form.message}`;
    window.open(whatsappLink(settings?.whatsapp_number, msg), "_blank");
    toast.success("Vă redirecționăm către WhatsApp.");
  };

  return (
    <section id="contact" className="bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Contact
            </p>
            <h2 className="text-balance text-3xl font-bold sm:text-4xl">
              Cereți o ofertă pentru poarta dumneavoastră
            </h2>
            <p className="mt-4 text-muted-foreground">
              Completați formularul sau scrieți-ne direct pe WhatsApp. Revenim cu
              o ofertă personalizată cât mai curând.
            </p>

            <div className="mt-8 space-y-3 text-sm">
              {settings?.company_phone && (
                <a href={`tel:${settings.company_phone}`} className="flex items-center gap-3 text-foreground hover:text-primary">
                  <Phone className="h-5 w-5 text-primary" /> {settings.company_phone}
                </a>
              )}
              {settings?.company_email && (
                <a href={`mailto:${settings.company_email}`} className="flex items-center gap-3 text-foreground hover:text-primary">
                  <Mail className="h-5 w-5 text-primary" /> {settings.company_email}
                </a>
              )}
              {settings?.company_address && (
                <p className="flex items-center gap-3 text-foreground">
                  <MapPin className="h-5 w-5 text-primary" /> {settings.company_address}
                </p>
              )}
            </div>

            <a
              href={whatsappLink(settings?.whatsapp_number)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-105"
              style={{ backgroundColor: "oklch(0.6 0.16 150)" }}
            >
              <WhatsAppIcon className="h-5 w-5" /> Scrie-ne pe WhatsApp
            </a>
          </Reveal>

          <Reveal delay={100}>
            <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
              <Field label="Nume" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Telefon" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" />
              <Field label="Localitate" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
              <div>
                <label className="mb-1.5 block text-sm font-medium">Mesaj</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  maxLength={1000}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Descrieți pe scurt ce poartă vă doriți..."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-gradient-warm px-6 py-3 font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
              >
                Trimite cererea
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
