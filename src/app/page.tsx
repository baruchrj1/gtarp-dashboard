import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>

      <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent mb-6 drop-shadow-2xl">
        GTA RP JUSTICE
      </h1>

      <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
        Sistema avançado de gestão de denúncias e punições.
        Transparência e agilidade para uma cidade melhor.
      </p>

      <div className="flex flex-col sm:flex-row gap-6">
        <Link href="/reports/new" className="btn btn-primary text-lg px-8 py-4">
          Fazer Denúncia
        </Link>
        <Link href="/about" className="btn bg-surface hover:bg-surface-highlight border border-border text-lg px-8 py-4">
          Como Funciona?
        </Link>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="card glass text-left">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">100% Seguro</h3>
          <p className="text-muted">Todas as denúncias são criptografadas e tratadas com sigilo absoluto pela nossa equipe.</p>
        </div>

        <div className="card glass text-left">
          <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Resposta Rápida</h3>
          <p className="text-muted">Integração direta com Discord garante que os administradores sejam notificados instantaneamente.</p>
        </div>

        <div className="card glass text-left">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Transparência</h3>
          <p className="text-muted">Acompanhe o status da sua denúncia em tempo real pelo painel ou notificações.</p>
        </div>
      </div>
    </div>
  );
}
