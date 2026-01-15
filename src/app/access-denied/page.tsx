import Link from "next/link";
import { ShieldAlert, LogOut } from "lucide-react";

export default function AccessDenied() {
    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-4">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center shadow-2xl">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
                <p className="text-neutral-400 mb-8">
                    Sua conta não tem permissão para acessar esta área (Painel Master).
                    Isso pode acontecer se seu token de acesso estiver desatualizado.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/auth-reset"
                        className="block w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Reiniciar Acesso (Logoff Forçado)
                    </Link>

                    <Link
                        href="/player"
                        className="block w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium transition-colors"
                    >
                        Ir para Painel do Jogador
                    </Link>
                </div>
            </div>
        </div>
    );
}
