import { handlers } from "@/app/_lib/auth"

import { NextResponse, NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    return await handlers.GET(req);
  } catch (error: any) {
    console.error("Auth GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await handlers.POST(req);
  } catch (error: any) {
    console.error("Auth POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}