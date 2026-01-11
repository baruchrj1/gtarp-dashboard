import { NextRequest, NextResponse } from "next/server";

/**
 * Validate that the request comes from an allowed origin
 * This provides basic CSRF protection for API routes
 */
export function validateOrigin(req: NextRequest): boolean {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");

    // Allow requests without origin (same-origin requests, API clients)
    if (!origin) {
        return true;
    }

    // Build list of allowed origins
    const allowedOrigins: string[] = [];

    if (host) {
        allowedOrigins.push(`https://${host}`);
        allowedOrigins.push(`http://${host}`);
    }

    // Add NEXTAUTH_URL if configured
    if (process.env.NEXTAUTH_URL) {
        allowedOrigins.push(process.env.NEXTAUTH_URL);
    }

    // In development, allow localhost
    if (process.env.NODE_ENV === "development") {
        allowedOrigins.push("http://localhost:3000");
        allowedOrigins.push("http://127.0.0.1:3000");
    }

    return allowedOrigins.includes(origin);
}

/**
 * CSRF error response
 */
export function csrfErrorResponse(): NextResponse {
    return NextResponse.json(
        { error: "Invalid request origin" },
        { status: 403 }
    );
}

/**
 * Middleware helper to check CSRF on state-changing methods
 */
export function requireValidOrigin(req: NextRequest): NextResponse | null {
    const method = req.method.toUpperCase();
    const stateChangingMethods = ["POST", "PUT", "PATCH", "DELETE"];

    if (stateChangingMethods.includes(method) && !validateOrigin(req)) {
        return csrfErrorResponse();
    }

    return null;
}
