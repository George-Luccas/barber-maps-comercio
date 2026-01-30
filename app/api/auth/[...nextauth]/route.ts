import { handlers } from "@/app/_lib/auth"

// export const { GET, POST } = handlers
export async function GET(req: Request) {
    return handlers.GET(req);
}

export async function POST(req: Request) {
    console.log("Auth Route POST called:", req.url);
    const res = await handlers.POST(req);
    console.log("Auth Route POST result status:", res.status);
    return res;
}

export const runtime = "nodejs"