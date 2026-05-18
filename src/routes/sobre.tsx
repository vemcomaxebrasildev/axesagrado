import { createFileRoute } from "@tanstack/react-router";
import hero from "@/assets/hero-altar.jpg";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "A Casa — Vem com Axé" },
      { name: "description", content: "Conheça a história e os valores da casa Vem com Axé." },
    ],
  }),
  component: () => (
    <div className="bg-warm">
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-12 md:gap-16 md:px-8 md:py-28">
        <div className="md:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">A Casa</p>
          <h1 className="mt-3 text-balance font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
            Onde o axé encontra <em className="not-italic text-primary">forma</em>.
          </h1>
          <p className="mt-6 text-pretty text-foreground/85">
            O Vem com Axé nasceu do desejo de aproximar irmãos de Umbanda do trabalho de
            artesãos brasileiros que dedicam suas vidas a esculpir o sagrado em barro,
            madeira, cera e contas.
          </p>
          <p className="mt-4 text-pretty text-foreground/85">
            Trabalhamos diretamente com 18 artesãos em quatro estados, garantindo que cada
            peça carregue história, respeito e qualidade. Saravá!
          </p>
        </div>
        <div className="md:col-span-7">
          <div className="overflow-hidden rounded-2xl shadow-altar">
            <img src={hero} alt="Altar de Umbanda" width={1600} height={1200} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>
    </div>
  ),
});
