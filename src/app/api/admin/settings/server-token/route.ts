import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isStaff } from "@/lib/permissions";
import crypto from "crypto";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isStaff(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const setting = await prisma.systemSetting.findFirst({
            where: {
                tenantId: session.user.tenantId,
                key: 'fivem_secret_token'
            }
        });

        return NextResponse.json({ token: setting?.value || null });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user || !isStaff(session)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        // Generate new token
        const newToken = crypto.randomBytes(32).toString('hex');

        // Upsert setting
        await prisma.systemSetting.upsert({
            where: {
                key_tenantId: {
                    key: 'fivem_secret_token',
                    tenantId: session.user.tenantId
                }
            },
            update: {
                value: newToken,
                description: 'Secret token for FiveM Server Integration'
            },
            create: {
                key: 'fivem_secret_token',
                value: newToken,
                description: 'Secret token for FiveM Server Integration',
                tenantId: session.user.tenantId
            }
        });

        return NextResponse.json({ token: newToken });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
