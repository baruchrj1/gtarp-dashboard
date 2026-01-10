'use client';

import { useSession } from "next-auth/react";

export default function DebugAuthPage() {
    const { data: session, status } = useSession();

    return (
        <div className="p-8 bg-black text-white min-h-screen font-mono">
            <h1 className="text-2xl font-bold mb-4">Debug Auth Session</h1>

            <div className="mb-4">
                <strong>Status:</strong> {status}
            </div>

            <div className="mb-8 p-4 border border-gray-700 rounded bg-gray-900">
                <h2 className="text-xl mb-2">Session Data:</h2>
                <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(session, null, 2)}
                </pre>
            </div>

            <div className="p-4 border border-yellow-700 rounded bg-yellow-900/20">
                <h3 className="text-lg font-bold text-yellow-500 mb-2">O que verificar:</h3>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Veja se <strong>role</strong> aparece como "ADMIN" ou "PLAYER".</li>
                    <li>Veja se <strong>isAdmin</strong> está true ou false.</li>
                    <li>Se estiver "PLAYER", o sistema não detectou seu cargo no Discord.</li>
                </ul>
            </div>
        </div>
    );
}
