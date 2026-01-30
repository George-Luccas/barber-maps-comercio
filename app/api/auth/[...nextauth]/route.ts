import { handlers } from "@/app/_lib/auth"

export const GET = handlers.GET

export async function POST(req: Request) {
    if (!handlers.POST) {
        console.error("Handlers.POST is undefined!");
        return new Response("Internal Server Error: Handlers.POST missing", { status: 500 });
    }
    console.log("Handlers.POST exists, calling it...");
    return handlers.POST(req);
}

export const runtime = "nodejs"