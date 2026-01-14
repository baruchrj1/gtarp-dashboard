import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth"; // Custom wrapper

export async function POST(req: NextRequest) {
    const session = await getServerSession();

    // Security: Only Super Admin can switch tenants
    if (!(session?.user as any)?.isSuperAdmin) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { slug } = body;

    const response = NextResponse.json({ success: true });

    if (slug) {
        // Set cookie to force this tenant
        response.cookies.set("x-super-admin-tenant", slug, {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 // 1 day
        });
    } else {
        // Clear cookie to return to normal
        response.cookies.delete("x-super-admin-tenant");
    }

    return response;
}
