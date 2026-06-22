import { Reveal } from "@/components/Reveal";
import { DoorOpen, Trees, Landmark, Square, Wrench, Ruler } from "lucide-react";

const SERVICES = [
  { icon: DoorOpen, title: "Porți din lemn masiv", text: "Porți robuste din lemn masiv, durabile și elegante." },
  { icon: Trees, title: "Porți din stejar", text: "Stejar selectat, finisat natural pentru o viață lungă." },
  { icon: Landmark, title: "Porți rustice / tradiționale", text: "Modele tradiționale cu detalii sculptate manual." },
  { icon: Square, title: "Porți moderne din lemn", text: "Linii curate, minimaliste, pentru locuințe moderne." },
  { icon: Wrench, title: "Recondiționare porți", text: "Readucem la viață porțile vechi din lemn." },
  { icon: Ruler, title: "Montaj și consultanță", text: "Măsurători, proiectare și montaj profesional la fața locului." },
];

export function Services() {
  return (
    <section id="servicii" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
            Servicii
          </p>
          <h2 className="text-balance text-3xl font-bold sm:text-4xl">
            Tot ce ai nevoie pentru o poartă din lemn
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 100}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-gradient-warm group-hover:text-primary-foreground">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
