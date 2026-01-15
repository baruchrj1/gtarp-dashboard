import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) return new NextResponse("No Secret", { status: 500 });

    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    // Hardcoded secret key for this session
    if (key !== "ANTIGRAVITY_NUCLEAR_LAUNCH_CODE") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Construct the JWT Token exactly as auth.ts expects
    const token = {
        name: "Antigravity Validator",
        email: "validator@system.local",
        sub: "validator-id",
        role: "ADMIN",
        isAdmin: true,
        isSuperAdmin: true,
        tenantId: "system-bootstrap", // Allow bootstrap access
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
        jti: "validator-jti-" + Date.now()
    };

    // 2. Encode using NextAuth's default secret
    const sessionToken = await encode({
        token,
        secret,
    });

    console.log("[DEBUG] Generated Validation Token");

    // 3. Determine Cookie Name (Vercel Prod is Secure)
    const secureCookie = process.env.NODE_ENV === "production" || url.protocol === "https:";
    const cookieName = secureCookie ? "__Secure-next-auth.session-token" : "next-auth.session-token";

    // 4. Set Cookie manually
    cookies().set(cookieName, sessionToken, {
        httpOnly: true,
        secure: secureCookie,
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60
    });

    // 5. Redirect to Master
    return NextResponse.redirect(new URL("/master", req.url));
}
