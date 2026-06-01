import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
