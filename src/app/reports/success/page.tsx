import Link from "next/link";

export default function SuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Denúncia Enviada!</h1>
            <p className="text-muted mb-8 max-w-md">
                Sua denúncia foi registrada com sucesso e nossa equipe administrativa irá analisá-la em breve.
                Você será notificado pelo Discord.
            </p>
            <div className="flex gap-4">
                <Link href="/" className="btn bg-surface hover:bg-surface-highlight border border-border">
                    Voltar ao Início
                </Link>
                <Link href="/reports/new" className="btn btn-primary">
                    Nova Denúncia
                </Link>
            </div>
        </div>
    );
}
