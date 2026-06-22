import { Reveal } from "@/components/Reveal";

const STEPS = [
  { n: "01", title: "Consultare", text: "Discutăm nevoile, stilul și bugetul tău." },
  { n: "02", title: "Măsurători", text: "Venim la fața locului pentru măsurători precise." },
  { n: "03", title: "Proiectare", text: "Realizăm proiectul și alegem lemnul potrivit." },
  { n: "04", title: "Execuție", text: "Construim poarta manual, în atelierul nostru." },
  { n: "05", title: "Montaj", text: "Montăm poarta și ne asigurăm că totul e perfect." },
];

export function Process() {
  return (
    <section id="proces" className="bg-forest py-20 text-forest-foreground sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-forest-foreground/70">
            Procesul nostru
          </p>
          <h2 className="text-balance text-3xl font-bold sm:text-4xl">
            De la idee la poarta montată
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="h-full rounded-2xl border border-forest-foreground/15 bg-forest-foreground/5 p-5 backdrop-blur-sm">
                <span className="font-display text-3xl font-bold text-forest-foreground/40">
                  {s.n}
                </span>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-forest-foreground/80">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
