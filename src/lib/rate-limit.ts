import { NextResponse } from "next/server";

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
