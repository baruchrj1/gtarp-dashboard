import { NextResponse } from "next/server";
import { prisma } from './db';


type RateLimitRecord = {
    count: number;
    resetTime: number;
};

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
        if (record.resetTime < now) {
            rateLimitMap.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
    limit: number;      // Max requests
    window: number;     // Time window in milliseconds
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetIn: number;
}

/**
 * Check rate limit for a given identifier
 */
export function checkRateLimit(
    identifier: string,
    options: RateLimitOptions = { limit: 10, window: 60000 }
): RateLimitResult {
    const now = Date.now();
    const record = rateLimitMap.get(identifier);

    if (!record || record.resetTime < now) {
        // Create new record
        rateLimitMap.set(identifier, {
            count: 1,
            resetTime: now + options.window,
        });
        return {
            success: true,
            remaining: options.limit - 1,
            resetIn: options.window,
        };
    }

    if (record.count >= options.limit) {
        return {
            success: false,
            remaining: 0,
            resetIn: record.resetTime - now,
        };
    }

    record.count++;
    return {
        success: true,
        remaining: options.limit - record.count,
        resetIn: record.resetTime - now,
    };
}

/**
 * Rate limit middleware helper
 */
export function rateLimitResponse(resetIn: number): NextResponse {
    return NextResponse.json(
        { error: "Muitas requisições. Tente novamente mais tarde." },
        {
            status: 429,
            headers: {
                "Retry-After": Math.ceil(resetIn / 1000).toString(),
            },
        }
    );
}


export interface ReportRateLimitResult {
    allowed: boolean;
    remaining: number;
    current: number;
    resetAt: Date;
}

/**
 * Check if user can create a new report
 * Limit: 3 reports per 24 hours
 */
export async function checkReportRateLimit(
    userId: string,
    tenantId: string
): Promise<ReportRateLimitResult> {
    const LIMIT = 3;
    const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

    const windowStart = new Date(Date.now() - WINDOW_MS);

    // Count reports in the last 24 hours
    const recentReports = await prisma.report.count({
        where: {
            reporterId: userId,
            tenantId: tenantId,
            createdAt: {
                gte: windowStart
            }
        }
    });

    const allowed = recentReports < LIMIT;
    const remaining = Math.max(0, LIMIT - recentReports);
    const resetAt = new Date(Date.now() + WINDOW_MS);

    return {
        allowed,
        remaining,
        current: recentReports,
        resetAt
    };
}

/**
 * Get when the user can submit their next report
 */
export async function getNextAvailableReportTime(
    userId: string,
    tenantId: string
): Promise<Date | null> {
    const WINDOW_MS = 24 * 60 * 60 * 1000;
    const windowStart = new Date(Date.now() - WINDOW_MS);

    const oldestReport = await prisma.report.findFirst({
        where: {
            reporterId: userId,
            tenantId: tenantId,
            createdAt: {
                gte: windowStart
            }
        },
        orderBy: {
            createdAt: 'asc'
        },
        select: {
            createdAt: true
        }
    });

    if (!oldestReport) {
        return null; // Can report now
    }

    const nextAvailable = new Date(oldestReport.createdAt.getTime() + WINDOW_MS);


    // If next available time is in the past, user can report now
    if (nextAvailable.getTime() <= Date.now()) {
        return null;
    }

    return nextAvailable;
}

