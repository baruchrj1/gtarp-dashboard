import Link from "next/link";
import { Shield, ChevronRight, Lock, Activity, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

      <div className="space-y-8 max-w-5xl mx-auto fade-in z-10">
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded border border-primary/20 bg-primary/5 backdrop-blur-sm mb-4">
          <span className="relative flex h-2 w-2 mr-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-xs font-bold text-primary tracking-widest uppercase font-display">LSPD Database: Online</span>
        </div>

        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter uppercase font-display leading-none">
          <span className="text-white">System</span>
          <span className="block text-primary text-6xl md:text-9xl mt-[-10px] opacity-90">Reports</span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
          Sistema oficial de denúncias e registros criminais da cidade. <br />
          <span className="text-white font-medium">Transparência total, resposta imediata.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link href="/player" className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded bg-primary px-10 font-bold text-black uppercase tracking-wider transition-all hover:bg-white hover:scale-105">
            <span className="mr-2">Dashboard Pessoal</span>
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4 z-10">
        {[
          {
            title: "Criptografia Militar",
            desc: "Dados protegidos com protocolos de nível estadual. Sua identidade é preservada.",
            icon: <Lock className="w-6 h-6 text-primary" />
          },
          {
            title: "Integração Neural",
            desc: "Conexão direta com o banco de dados da prefeitura via Discord.",
            icon: <Activity className="w-6 h-6 text-primary" />
          },
          {
            title: "Auditoria Pública",
            desc: "Cada denúncia gera um protocolo rastreável publicamente em tempo real.",
            icon: <FileText className="w-6 h-6 text-primary" />
          }
        ].map((feature, i) => (
          <div key={i} className="gta-card p-8 text-left hover:-translate-y-1 transition-transform duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield className="w-24 h-24 text-primary" />
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center mb-6 border border-primary/20 group-hover:bg-primary/20 transition-colors">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white font-display tracking-wide">{feature.title}</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
