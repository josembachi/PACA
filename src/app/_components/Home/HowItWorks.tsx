import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Encontra o parceiro certo",
    description:
      "Procura tutores, professores e especialistas por assunto, disponibilidade e avaliações reais.",
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    number: "02",
    title: "Agenda e comunica em segundos",
    description:
      "Cria pedidos, responde em chat, coordena aulas e mantém tudo centralizado no mesmo espaço.",
    accent: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  {
    number: "03",
    title: "Aprende, paga e acompanha progresso",
    description:
      "Acompanha aulas, milestones, pagamentos, conteúdos e resultados sem depender de múltiplas ferramentas.",
    accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-white/60 dark:bg-gray-950/20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
            Como funciona
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            O PACA torna a aprendizagem clara e organizada
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Uma experiência pensada para estudantes, pais, professores e quem quer aprender sem perder controlo do processo.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${step.accent}`}>
                {step.number}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100 p-8 dark:border-emerald-900/60 dark:from-emerald-950/60 dark:to-slate-900">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                PACA em ação
              </p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                Melhorar resultados começa com uma experiência simples.
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Criar conta
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Ver processo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
