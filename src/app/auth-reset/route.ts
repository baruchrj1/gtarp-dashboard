import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const cookieStore = await cookies();

    // Force delete all NextAuth cookies
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
        if (cookie.name.includes("next-auth")) {
            cookieStore.delete(cookie.name);
        }
    }

    // Redirect to login with a clean slate
    return NextResponse.redirect(new URL("/login?state=reset", request.url));
}
