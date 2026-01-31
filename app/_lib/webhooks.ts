
import { db } from "@/app/_lib/prisma";

type WebhookEvent = "booking.created" | "booking.cancelled" | "booking.rescheduled";

export async function triggerWebhooks(event: WebhookEvent, payload: any) {
  try {
    // 1. Fetch active webhooks interacting with this event
    const webhooks = await db.webhook.findMany({
      where: {
        isActive: true,
        events: {
          has: event
        }
      }
    });

    if (webhooks.length === 0) return;

    console.log(`📡 Triggering ${webhooks.length} webhooks for event: ${event}`);

    // 2. Fire and forget (don't block the main thread)
    // In a production env, this should go to a queue (Redis/SQS/background job)
    // For now we use Promise.allSettled to not fail the main request
    
    Promise.allSettled(webhooks.map(async (hook) => {
      try {
        const res = await fetch(hook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Secret": hook.secret || "",
            "X-Webhook-Event": event
          },
          body: JSON.stringify({
            event,
            timestamp: new Date().toISOString(),
            data: payload
          })
        });

        if (!res.ok) {
            console.warn(`⚠️ Webhook failed [${hook.name}]: ${res.statusText}`);
        }
      } catch (err) {
        console.error(`❌ Webhook error [${hook.name}]:`, err);
      }
    }));

  } catch (error) {
    console.error("🔥 Error fetching webhooks:", error);
  }
}
