
import { db } from "../app/_lib/prisma";

async function main() {
  const key = "dev-api-key-123";
  const exists = await db.apiKey.findUnique({ where: { key } });

  if (!exists) {
    await db.apiKey.create({
      data: {
        key,
        name: "Dev Test Key",
      },
    });
    console.log("Created Dev API Key:", key);
  } else {
    console.log("Dev API Key already exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
