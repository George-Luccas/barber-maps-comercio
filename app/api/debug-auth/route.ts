import { NextResponse } from "next/server";
import { handlers } from "@/app/_lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    return NextResponse.json({
        message: "Debug Auth Handlers",
        handlersKeys: Object.keys(handlers),
        hasGET: typeof handlers.GET === 'function',
        hasPOST: typeof handlers.POST === 'function',
        nodeEnv: process.env.NODE_ENV,
        runtime: process.release?.name || "edge/unknown"
    });
}
