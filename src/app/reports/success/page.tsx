import Link from "next/link";

export default function SuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-emerald-500/20 animate-pulse">
                <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Denúncia Recebida!</h1>
            <p className="text-zinc-400 mb-8 max-w-lg text-lg leading-relaxed">
                Sua denúncia foi registrada em nosso sistema seguro e criptografado. Nossa equipe administrativa analisará as provas em breve.
                <span className="block mt-2 text-sm text-zinc-500">Você será notificado automaticamente via Discord.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/" className="px-8 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all font-medium">
                    Voltar ao Início
                </Link>
                <Link href="/reports/new" className="px-8 py-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/40 transition-all font-medium">
                    Nova Denúncia
                </Link>
            </div>
        </div>
    );
}
