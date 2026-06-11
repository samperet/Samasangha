import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

// Admin sign-in uses the ADMIN_PASSWORD env var — no user records needed.
// Seed a starter set of retreat rooms (edit freely in the admin).
const ROOMS = ["Yurt", "Main House", "Camping"];

async function main() {
  for (const [i, name] of ROOMS.entries()) {
    await prisma.room.upsert({
      where: { name },
      update: {},
      create: { name, order: i + 1 },
    });
  }
  console.log(`Seed complete. Rooms: ${ROOMS.join(", ")}`);
  console.log("Admin login uses the ADMIN_PASSWORD env var.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
