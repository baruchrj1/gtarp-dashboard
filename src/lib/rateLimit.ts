// Simple in-memory rate limiter for API routes
// For production, consider using Redis or a dedicated rate limiting service

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
    maxRequests: number;      // Maximum requests allowed
    windowMs: number;         // Time window in milliseconds
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetIn: number;          // Seconds until reset
}

const DEFAULT_CONFIG: RateLimitConfig = {
    maxRequests: 60,          // 60 requests
    windowMs: 60 * 1000,      // per minute
};

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., user ID or IP)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with allowed status and remaining requests
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig = DEFAULT_CONFIG
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitMap.get(identifier);

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
        cleanupExpiredEntries();
    }

    if (!entry || now > entry.resetTime) {
        // First request or window expired - create new entry
        rateLimitMap.set(identifier, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetIn: Math.ceil(config.windowMs / 1000),
        };
    }

    // Existing entry within window
    if (entry.count >= config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: Math.ceil((entry.resetTime - now) / 1000),
        };
    }

    // Increment counter
    entry.count++;
    return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
}

/**
 * Clean up expired entries to prevent memory leaks
 */
function cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetTime) {
            rateLimitMap.delete(key);
        }
    }
}

/**
 * Get identifier from request (IP address or user ID)
 */
export function getRequestIdentifier(
    request: Request,
    userId?: string | null
): string {
    if (userId) {
        return `user:${userId}`;
    }

    // Try to get IP from headers
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";

    return `ip:${ip}`;
}

// Preset configurations for different API types
export const RATE_LIMITS = {
    // Auth routes - stricter limits
    auth: { maxRequests: 10, windowMs: 60 * 1000 },

    // Report creation - moderate limits
    createReport: { maxRequests: 5, windowMs: 60 * 1000 },

    // Admin actions - normal limits
    admin: { maxRequests: 100, windowMs: 60 * 1000 },

    // Read operations - relaxed limits
    read: { maxRequests: 120, windowMs: 60 * 1000 },
} as const;
