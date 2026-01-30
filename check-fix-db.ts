
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const db = new PrismaClient();

async function main() {
  let output = "";
  const log = (msg) => { console.log(msg); output += msg + "\n"; };

  try {
    const email = "georgeluccas300@gmail.com";
    log(`Checking email: ${email}`);
    const user = await db.user.findUnique({
      where: { email },
      include: { Barbershop: true }
    });

    if (!user) {
      log("RESULT: USER_NOT_FOUND");
    } else {
      log(`RESULT: USER_FOUND | ID: ${user.id}`);
      if (user.Barbershop) {
        log(`RESULT: BARBERSHOP_FOUND | ID: ${user.Barbershop.id} | Suspended: ${user.Barbershop.isSuspended}`);
      } else {
        log("RESULT: BARBERSHOP_MISSING");
        log("Attempting to restore barbershop...");
        const newShop = await db.barbershop.create({
            data: {
                name: "George Luccas Barber",
                managerId: user.id,
                phones: ["(00) 00000-0000"],
                description: "Restored via AntiGravity"
            }
        });
        log(`RESULT: BARBERSHOP_RESTORED | ID: ${newShop.id}`);
      }
    }
  } catch (e) {
    log("ERROR: " + e.message);
  } finally {
    fs.writeFileSync("debug-output.txt", output);
    await db.$disconnect();
  }
}

main();
