
const API_URL = "http://localhost:3000/api/external/v1/shops";
const API_KEY = "dummy-key"; // We might need a real key or mock auth

// We can't easily mock validation in a script hitting localhost unless we have a valid key in DB.
// But we can check if it returns 401 (Auth working) or 500 (Crash).
// To test fully, we'd need to insert a key or bypass auth temporarily.
// Let's assume we can hit it.

async function testReview() {
    console.log("Testing Review API...");
    // Find a shop first? Or use hardcoded if known.
    // Let's mock a shop ID and User ID.
    const shopId = "test-shop-id";
    const userId = "test-user-" + Date.now();
    
    // We will fail on Auth likely, but let's see response.
    try {
        const res = await fetch(`${API_URL}/${shopId}/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + API_KEY
            },
            body: JSON.stringify({
                userId,
                rating: 5,
                comment: "Test review",
                userName: "Tester Agent"
            })
        });
        
        console.log("Status:", res.status);
        console.log("Response:", await res.text());
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testReview();
