import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        // Only allow specific keys
        const allowedKeys = ["theme_color"];

        // Filter body
        const safeBody = Object.keys(body)
            .filter(key => allowedKeys.includes(key))
            .reduce((obj, key) => {
                obj[key] = body[key];
                return obj;
            }, {} as any);

        if (Object.keys(safeBody).length === 0) {
            return NextResponse.json({ message: "No valid settings provided" });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        let currentPrefs = {};
        // @ts-ignore
        const userPrefs = (user as any)?.preferences;

        if (userPrefs) {
            try {
                currentPrefs = JSON.parse(userPrefs as string);
            } catch (e) {
                // Ignore parsing errors, just reset
            }
        }

        const newPrefs = { ...currentPrefs, ...safeBody };

        await prisma.user.update({
            where: { id: session.user.id },
            data: { preferences: JSON.stringify(newPrefs) } as any
        });

        return NextResponse.json({ success: true, preferences: newPrefs });
    } catch (error) {
        console.error("Error saving preferences:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
