import { Reveal } from "@/components/Reveal";
import { usePublishedTestimonials } from "@/lib/site";
import { Star, Quote } from "lucide-react";

export function Testimonials() {
  const { data: testimonials, isLoading } = usePublishedTestimonials();
  const list = testimonials ?? [];

  if (!isLoading && list.length === 0) return null;

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Testimoniale
          </p>
          <h2 className="text-balance text-3xl font-bold sm:text-4xl">
            Ce spun clienții noștri
          </h2>
        </Reveal>

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
      </div>
    </section>
  );
}
