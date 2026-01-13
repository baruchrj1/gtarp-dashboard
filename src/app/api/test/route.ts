import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        status: "debug",
        message: "Simple test endpoint",
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        dbUrl: process.env.DATABASE_URL ? "SET" : "NOT_SET",
    });
}
