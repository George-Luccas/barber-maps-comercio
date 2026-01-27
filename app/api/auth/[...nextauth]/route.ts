import { handlers } from "@/app/_lib/auth"

export const { GET, POST } = handlers
console.log("Auth Route Loaded");
export const runtime = "nodejs" 
export const dynamic = "force-dynamic"