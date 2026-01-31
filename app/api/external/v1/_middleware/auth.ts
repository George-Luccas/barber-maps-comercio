import { db } from "@/app/_lib/prisma";

export async function validateApiKey(request: Request) {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const key = authHeader.split(" ")[1];

  const apiKey = await db.apiKey.findUnique({
    where: { key, isActive: true },
  });

  return apiKey;
}
