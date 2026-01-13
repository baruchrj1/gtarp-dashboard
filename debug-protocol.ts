
import { PrismaClient } from '@prisma/client';

async function main() {
    // URL CORRETA (prisma+postgres)
    const originalUrl = "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19ZeWxnZ3VFODlHN21aeUFod0EtUDEiLCJhcGlfa2V5IjoiMDFLRVRTQldSVDROMktQUVlaUUFOM1NTM0UiLCJ0ZW5hbnRfaWQiOiJjZGU2YTdkY2JhMDFlZTg1ZmUwYTEzMzk1Y2M2NzJlNzJlOWY2NTVjZTlmYmM2ZDIxMWRhZTM5OWE3NjNiMjQ0IiwiaW50ZXJuYWxfc2VjcmV0IjoiNzRlYzY0ZDEtYmYzMC00MmNkLTk1MjItNDZhYzM0NDU0M2U0In0.DqeRrjgOmRnHhV7xY071wJGduRx3KbZXllCOed-X9FU";

    // URL SIMULANDO ERRO (postgres apenas)
    const wrongProtocolUrl = originalUrl.replace("prisma+postgres://", "postgres://");

    console.log("Testando URL com protocolo ERRADO (postgres://):");
    console.log(wrongProtocolUrl.substring(0, 50) + "...");

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: wrongProtocolUrl
            }
        }
    });

    try {
        await prisma.$connect();
        console.log("Conectou (inesperado)!");
    } catch (error: any) {
        console.log("Erro capturado:");
        console.log(error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
