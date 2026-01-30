import { handlers } from "@/app/_lib/auth"

// export const { GET, POST } = handlers
export const GET = handlers.GET

// PROVA DE INFRAESTRUTURA:
// Se isso retornar 200, o problema é DENTRO do NextAuth.
// Se retornar 405, o problema é na ROTA/VERCEL.
export async function POST(req: Request) {
    return Response.json({ message: "INFRAESTRUTURA PROBE: OK" });
}

export const runtime = "nodejs"