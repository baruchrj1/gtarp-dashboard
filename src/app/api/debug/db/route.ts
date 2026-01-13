import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Tenta conectar e fazer uma query simples
        await prisma.$connect();
        const result = await prisma.$queryRaw`SELECT 1 as test`;

        return NextResponse.json({
            status: 'success',
            message: 'Database connection successful',
            result,
            env: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                urlPrefix: process.env.DATABASE_URL?.substring(0, 30) + '...',
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            code: error.code,
            env: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                urlPrefix: process.env.DATABASE_URL?.substring(0, 30) + '...',
            }
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
