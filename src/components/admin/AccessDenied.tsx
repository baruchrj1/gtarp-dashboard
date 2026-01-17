import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

interface AccessDeniedProps {
    message?: string;
    returnTo?: string;
    returnLabel?: string;
}

export function AccessDenied({
    message = "Apenas administradores e avaliadores podem acessar esta área.",
    returnTo = "/",
    returnLabel = "Voltar ao Início"
}: AccessDeniedProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl group-hover:bg-red-500/30 transition-all duration-500"></div>
                <div className="w-24 h-24 bg-gradient-to-br from-red-500/10 to-red-900/10 rounded-2xl border border-red-500/20 flex items-center justify-center relative backdrop-blur-sm shadow-xl shadow-red-500/10 group-hover:scale-105 transition-transform duration-300">
                    <ShieldAlert className="w-10 h-10 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-3 font-display uppercase tracking-widest text-foreground drop-shadow-sm">
                Acesso <span className="text-red-500">Negado</span>
            </h2>

            <p className="text-muted-foreground text-center max-w-md mb-8 font-medium">
                {message}
            </p>

            <Link
                href={returnTo}
                className="gta-btn gta-btn-secondary group pl-4 pr-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                {returnLabel}
            </Link>
        </div>
    );
}
