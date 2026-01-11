import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Health check endpoint
 * Returns the status of the application and its dependencies
 */
export async function GET() {
    const health: {
        status: "healthy" | "unhealthy";
        timestamp: string;
        database: "connected" | "disconnected";
        uptime: number;
        version: string;
    } = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        uptime: process.uptime(),
        version: process.env.npm_package_version || "1.0.0",
    };

    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;
        health.database = "connected";
    } catch (error) {
        console.error("Health check - Database error:", error);
        health.status = "unhealthy";
        health.database = "disconnected";
    }

    const statusCode = health.status === "healthy" ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
}
