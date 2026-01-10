import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full -z-10 opacity-30"></div>

      <div className="space-y-6 max-w-4xl mx-auto fade-in">
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm mb-4">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-zinc-400 tracking-wide uppercase">Sistema Online & Operacional</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent drop-shadow-sm">
          JUSTIÇA <br /> GTA RP
        </h1>

        <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light">
          A plataforma definitiva para gestão de denúncias e transparência na cidade.
          <span className="text-zinc-200 font-medium"> Rápido. Seguro. Justo.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link href="/reports/new" className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-xl bg-primary px-8 font-medium text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-primary/40">
            <span className="mr-2">Fazer Denúncia</span>
            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link href="/about" className="group inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 px-8 font-medium text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white hover:border-zinc-700">
            Saiba Mais
          </Link>
        </div>
      </div>

      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4">
        {[
          {
            title: "Criptografia de Ponta",
            desc: "Seus dados e identidade são protegidos com os mais altos padrões de segurança.",
            icon: (
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )
          },
          {
            title: "Integração Discord",
            desc: "Login simplificado e notificações automáticas para a administração em tempo real.",
            icon: (
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            )
          },
          {
            title: "Transparência Total",
            desc: "Acompanhe cada etapa do processo da sua denúncia através do nosso painel público.",
            icon: (
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )
          }
        ].map((feature, i) => (
          <div key={i} className="glass-card p-8 text-left hover:-translate-y-2 transition-transform duration-300">
            <div className="w-12 h-12 bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-center justify-center mb-6 group-hover:border-primary/30 transition-colors">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-zinc-100">{feature.title}</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
