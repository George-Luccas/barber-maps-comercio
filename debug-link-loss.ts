
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const fs = require('fs');

async function main() {
  const email = 'georgeluccas300@gmail.com';
  let output = `Searching for user with email: ${email}\n`;

  const users = await db.user.findMany({
    where: { email: email },
    include: { Barbershop: true }
  });

  output += `Found ${users.length} user(s):\n`;
  users.forEach(u => {
    output += `- ID: ${u.id}, Email: ${u.email}, Provider: ${u.provider}, CreatedAt: ${u.createdAt}\n`;
    output += `  -> Barbershop: ${u.Barbershop ? u.Barbershop.name + ' (' + u.Barbershop.id + ')' : 'NONE'}\n`;
  });

  output += '---\n';
  output += 'Searching for ALL Barbershops to see if one looks like it belongs to George:\n';
  const allShops = await db.barbershop.findMany();
  allShops.forEach(s => {
    output += `- Shop ID: ${s.id}, Name: ${s.name}, ManagerID: ${s.managerId}\n`;
  });

  fs.writeFileSync('debug_output.txt', output);
  console.log("Debug info written to debug_output.txt");
}

main()
  .catch(e => console.error(e)) // Use console.error for errors
  .finally(async () => {
    await db.$disconnect();
  });
