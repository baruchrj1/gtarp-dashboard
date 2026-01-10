"use client";

import { signIn, useSession } from "next-auth/react";
import { Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/player");
        }
    }, [status, router]);

    const handleLogin = () => {
        signIn("discord", { callbackUrl: "/player" });
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Noise */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('/noise.svg')] mix-blend-overlay z-0"></div>

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="gta-card bg-black/60 backdrop-blur-xl border-zinc-800 p-10 flex flex-col items-center text-center shadow-2xl shadow-primary/10">
                    <div className="bg-primary/20 p-4 rounded-2xl mb-6 ring-1 ring-primary/30">
                        <Shield className="w-10 h-10 text-primary" />
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2 font-display tracking-wider uppercase">
                        Acesso <span className="text-primary">Restrito</span>
                    </h1>

                    <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                        Sistema HYPE REPORTS. Identifique-se para acessar o painel administrativo e gerenciar denúncias.
                    </p>

                    <button
                        onClick={handleLogin}
                        className="w-full gta-btn h-14 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all"
                    >
                        <span className="flex items-center gap-3">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" /></svg>
                            Entrar com Discord
                        </span>
                    </button>

                    <div className="mt-8 flex items-center justify-between w-full text-xs text-zinc-500 uppercase tracking-wider">
                        <Link href="/" className="hover:text-white transition-colors">Voltar ao Início</Link>
                        <span>v1.0.0 Stable</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
