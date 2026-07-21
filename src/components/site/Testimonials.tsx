import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { usePublishedTestimonials } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { Star, Quote, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const feedbackSchema = z.object({
  author: z
    .string()
    .trim()
    .min(2, { message: "Numele trebuie să aibă cel puțin 2 caractere." })
    .max(80, { message: "Numele este prea lung." }),
  location: z
    .string()
    .trim()
    .max(80, { message: "Localitatea este prea lungă." })
    .optional(),
  content: z
    .string()
    .trim()
    .min(10, { message: "Recenzia trebuie să aibă cel puțin 10 caractere." })
    .max(600, { message: "Recenzia este prea lungă (max 600 caractere)." }),
  rating: z.number().int().min(1).max(5),
});

export function Testimonials() {
  const { data: testimonials, isLoading } = usePublishedTestimonials();
  const list = testimonials ?? [];

  const [author, setAuthor] = useState("");
  const [location, setLocation] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = feedbackSchema.safeParse({
      author,
      location: location || undefined,
      content,
      rating,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifică datele introduse.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("testimonials").insert({
      author: parsed.data.author,
      location: parsed.data.location ?? null,
      content: parsed.data.content,
      rating: parsed.data.rating,
      published: false,
      status: "pending",
      sort_order: 0,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Nu am putut trimite recenzia. Încearcă din nou.");
      return;
    }
    setDone(true);
    setAuthor("");
    setLocation("");
    setContent("");
    setRating(5);
    toast.success("Mulțumim! Recenzia va fi publicată după aprobare.");
  };

  return (
    <section id="testimoniale" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Testimoniale
          </p>
          <h2 className="text-balance text-3xl font-bold sm:text-4xl">
            Ce spun clienții noștri
          </h2>
          <p className="mt-4 text-muted-foreground">
            Ai lucrat cu noi? Lasă-ne o recenzie mai jos — o publicăm pe site după
            o scurtă verificare.
          </p>
        </Reveal>

        {!isLoading && list.length > 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {list.map((t, i) => (
              <Reveal key={t.id} delay={(i % 3) * 100}>
                <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <Quote className="h-8 w-8 text-primary/30" />
                  <div className="mt-3 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-current text-primary" />
                    ))}
                  </div>
                  <blockquote className="mt-3 flex-1 text-muted-foreground">
                    „{t.content}"
                  </blockquote>
                  <figcaption className="mt-4 font-semibold">
                    {t.author}
                    {t.location && (
                      <span className="font-normal text-muted-foreground"> · {t.location}</span>
                    )}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}

        {/* Feedback form */}
        <Reveal className="mx-auto mt-16 max-w-2xl">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
            {done ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-forest" />
                <h3 className="mt-4 text-xl font-semibold">Mulțumim pentru recenzie!</h3>
                <p className="mt-2 max-w-md text-muted-foreground">
                  Recenzia dumneavoastră a fost trimisă și va apărea pe site imediat ce este
                  aprobată de echipa noastră.
                </p>
                <button
                  onClick={() => setDone(false)}
                  className="mt-6 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  Lasă altă recenzie
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <h3 className="text-center font-display text-2xl font-bold">
                  Lasă-ne o recenzie
                </h3>

                <div className="flex flex-col items-center">
                  <span className="mb-2 text-sm font-medium text-muted-foreground">
                    Cât de mulțumit ești?
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-label={`${n} stele`}
                        onClick={() => setRating(n)}
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            n <= (hover || rating)
                              ? "fill-current text-primary"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Nume *</label>
                    <input
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      maxLength={80}
                      placeholder="Numele tău"
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Localitate</label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      maxLength={80}
                      placeholder="Orașul tău"
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Recenzia ta *</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={600}
                    rows={4}
                    placeholder="Spune-ne cum a fost experiența ta..."
                    className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {content.length}/600
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-warm px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  Trimite recenzia
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  Recenziile sunt verificate înainte de publicare.
                </p>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
