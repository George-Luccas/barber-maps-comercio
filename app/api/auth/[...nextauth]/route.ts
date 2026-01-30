import { handlers } from "@/app/_lib/auth"

// export const { GET, POST } = handlers
export async function GET(req: Request) {
    return handlers.GET(req);
}

export async function POST(req: Request) {
    return handlers.POST(req);
}

export const runtime = "nodejs"