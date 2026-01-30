import { NextResponse } from "next/server";
import { handlers } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    let userCheck = null;
    try {
        const email = "georgeluccas300@gmail.com";
        const user = await db.user.findUnique({
            where: { email },
            include: { Barbershop: true }
        });
        userCheck = {
            found: !!user,
            id: user?.id,
            role: user?.role,
            hasBarbershop: !!user?.Barbershop,
            barbershopId: user?.Barbershop?.id,
            isSuspended: user?.Barbershop?.isSuspended
        };
    } catch (e: any) {
        userCheck = { error: e.message };
    }

    return NextResponse.json({
        message: "Debug Auth Handlers & User Data",
        handlersKeys: Object.keys(handlers),
        hasGET: typeof handlers.GET === 'function',
        hasPOST: typeof handlers.POST === 'function',
        userCheck
    });
}
