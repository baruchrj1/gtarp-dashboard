import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DebugAuthPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className="p-10 bg-black text-white font-mono min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Debug Auth State</h1>
            <div className="border p-4 rounded bg-gray-900">
                <h2 className="text-xl mb-2">Session Data:</h2>
                <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(session, null, 2)}
                </pre>
            </div>

            <div className="mt-8 border p-4 rounded bg-gray-900">
                <h2 className="text-xl mb-2">Environment Check:</h2>
                <p>NODE_ENV: {process.env.NODE_ENV}</p>
                <p>Expected Super Admin: 405844020967899137</p>
            </div>

            <div className="mt-8">
                <p>If "user" is null, you are not logged in or cookie is blocked.</p>
                <p>If "user" exists, check "id" and "role".</p>
            </div>
        </div>
    );
}
