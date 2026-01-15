import { getServerSession } from "@/lib/auth"; // Use custom server session
import { cookies } from "next/headers";

export default async function DebugAuthPage() {
    const session = await getServerSession();
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();

    return (
        <div className="p-10 bg-black text-white font-mono min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Debug Auth State (Deep Dive)</h1>

            <div className="border p-4 rounded bg-gray-900 mb-8">
                <h2 className="text-xl mb-2 text-blue-400">1. Raw Cookies (Browser Sent):</h2>
                {allCookies.length === 0 ? (
                    <p className="text-red-500">NO COOKIES RECEIVED. Browser blocked them or domain mismatch.</p>
                ) : (
                    <ul className="list-disc pl-5">
                        {allCookies.map(c => (
                            <li key={c.name}>
                                <span className="font-bold text-yellow-500">{c.name}</span>: {c.value.substring(0, 20)}...
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="border p-4 rounded bg-gray-900 mb-8">
                <h2 className="text-xl mb-2 text-green-400">2. Decoded Session (Server):</h2>
                <pre className="whitespace-pre-wrap break-all text-sm">
                    {session ? JSON.stringify(session, null, 2) : "NULL (Failed to decode or empty)"}
                </pre>
            </div>

            <div className="border p-4 rounded bg-gray-900">
                <h2 className="text-xl mb-2 text-purple-400">3. Environment Config:</h2>
                <p>NODE_ENV: {process.env.NODE_ENV}</p>
                <p>NEXTAUTH_URL: {process.env.NEXTAUTH_URL || "(Not Set)"}</p>
                <p>VERCEL_URL: {process.env.VERCEL_URL || "(Not Set)"}</p>
            </div>
        </div>
    );
}
