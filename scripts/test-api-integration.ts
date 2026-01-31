
// Scripts must be run with: npx tsx scripts/test-api-integration.ts
import { db } from "../app/_lib/prisma";

const API_URL = "http://localhost:3000/api/external/v1";
const API_KEY = "dev-api-key-123";

// HARDCODED IDs FROM PREVIOUS STEP (Replace these manually or fetch dynamically)
// Since I can't interactively paste, I will fetch them dynamically inside this script too
// but strictly via DB implementation just to get the IDs, then test the HTTP layer.

async function main() {
  console.log("🚀 Starting Integration Test for Barber Maps API...");

  // 1. Setup: Get Valid IDs (Targeting the Demo Shop specifically)
  const shop = await db.barbershop.findUnique({ 
      where: { id: "demo-shop-uuid" },
      include: { BarbershopService: true }
  });
  if (!shop || shop.BarbershopService.length === 0) {
    console.error("❌ Setup Failed: No shop/service found in DB to test with.");
    return;
  }
  const SHOP_ID = shop.id;
  const SERVICE_ID = shop.BarbershopService[0].id; // First service
  
  console.log(`📍 Testing with Shop: ${shop.name} (${SHOP_ID})`);

  // 2. Test GET /shops/[id]
  console.log("\n📡 Testing GET /shops/[id]...");
  const shopRes = await fetch(`${API_URL}/shops/${SHOP_ID}`, {
    headers: { "Authorization": `Bearer ${API_KEY}` }
  });
  
  if (shopRes.status === 200) {
    const data = await shopRes.json();
    console.log("✅ Shop Details OK:", data.name);
  } else {
    console.error("❌ Shop Details Failed:", shopRes.status, await shopRes.text());
  }

  // 3. Test GET /availability
  console.log("\n📡 Testing GET /availability...");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  
  const availRes = await fetch(`${API_URL}/shops/${SHOP_ID}/availability?date=${dateStr}`, {
    headers: { "Authorization": `Bearer ${API_KEY}` }
  });

  let validSlot = "10:00"; 
  if (availRes.status === 200) {
    const data = await availRes.json();
    console.log(`✅ Availability OK for ${dateStr}. Slots found: ${data.availableSlots?.length}`);
    if (data.availableSlots?.length > 0) validSlot = data.availableSlots[0];
  } else {
    console.error("❌ Availability Failed:", availRes.status, await availRes.text());
  }

  // 4. Test POST /bookings
  console.log("\n📡 Testing POST /bookings...");
  const bookingPayload = {
    barbershopId: SHOP_ID,
    serviceId: SERVICE_ID,
    date: `${dateStr}T${validSlot}:00.000Z`, // Construct pseudo-ISO
    clientName: "Test API Client",
    clientEmail: "testapi@example.com",
    clientPhone: "11999998888"
  };

  const bookingRes = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: { 
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
    },
    body: JSON.stringify(bookingPayload)
  });

  if (bookingRes.status === 201) {
    const data = await bookingRes.json();
    console.log("✅ Booking Created Successfully!");
    console.log(`   ID: ${data.id}`);
    console.log(`   Status: ${data.status}`);
    console.log(`   Client: ${bookingPayload.clientName}`);
  } else {
    console.error("❌ Booking Creation Failed:", bookingRes.status, await bookingRes.text());
  }
}

main().then(() => console.log("\n🏁 Test Completed"));
