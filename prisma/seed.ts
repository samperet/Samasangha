import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@samasangha.org" },
    update: {},
    create: {
      email: "admin@samasangha.org",
      password,
      name: "Admin",
      role: "ADMIN",
    },
  });
  console.log("Seed complete. Admin: admin@samasangha.org / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
