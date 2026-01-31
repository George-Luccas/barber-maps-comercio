
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const deleted = await prisma.barbershop.deleteMany({
    where: {
      name: { not: "Car barber" }
    }
  })
  console.log(`Deleted ${deleted.count} orphaned/test shops.`)
  
  const shops = await prisma.barbershop.findMany()
  console.log(`Remaining shops: ${shops.map(s => s.name).join(', ')}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
