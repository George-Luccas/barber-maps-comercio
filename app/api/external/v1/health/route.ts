
import { db } from "@/app/_lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Check basic response
    console.log("[HEALTH] Checking API health...");
    
    // 2. Check DB Connection
    const start = Date.now();
    const count = await db.user.count();
    const duration = Date.now() - start;

    console.log(`[HEALTH] DB OK. User count: ${count}. Duration: ${duration}ms`);

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        latencyMs: duration,
        userCount: count
      },
      env: {
        nodeEnv: process.env.NODE_ENV,
      }
    });

  } catch (error) {
    console.error("[HEALTH] CRITICAL ERROR:", error);
    return NextResponse.json({
      status: "error",
      message: String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
