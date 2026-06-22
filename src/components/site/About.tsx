import { Reveal } from "@/components/Reveal";
import { Hammer, TreePine, ShieldCheck } from "lucide-react";

const POINTS = [
  { icon: Hammer, title: "Lucru manual", text: "Fiecare poartă este realizată manual de meșteri cu experiență." },
  { icon: TreePine, title: "Lemn de calitate", text: "Folosim stejar și lemn masiv selectat, finisat natural." },
  { icon: ShieldCheck, title: "Durabilitate", text: "Tratamente profesionale pentru rezistență în timp și la intemperii." },
];

export function About() {
  return (
    <section id="despre" className="bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
              Despre noi
            </p>
            <h2 className="text-balance text-3xl font-bold sm:text-4xl">
              Porți din lemn cu suflet și tradiție românească
            </h2>
            <p className="mt-5 text-muted-foreground">
              La PortiDinLemn îmbinăm meșteșugul tradițional cu execuția precisă.
              Lucrăm lemn masiv și stejar pentru porți care rezistă generații
              întregi, păstrând estetica autentică a curților românești.
            </p>
            <p className="mt-4 text-muted-foreground">
              De la consultare la montaj, ne ocupăm de fiecare detaliu, ca poarta
              ta să fie solidă, frumoasă și pe măsura locului tău.
            </p>
          </Reveal>

          <div className="grid gap-4">
            {POINTS.map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-warm text-primary-foreground">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">{p.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
