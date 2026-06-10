import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

const updates = [
  {
    slug: "hazrat-inayat-khan",
    order: 1,
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Hazrat_Inayat_Khan_001.jpg",
  },
  {
    slug: "murshid-samuel-lewis",
    order: 2,
    photoUrl: "http://www.dervish-healing-order.org/wp-content/uploads/2012/04/SAM.Lewis-1962.jpg",
  },
  {
    slug: "pir-moineddin-jablonski",
    order: 3,
    photoUrl: "https://www.ruhaniat.org/images/stories/Moineddin/moineddin%20jablonski_1.gif",
  },
  {
    slug: "pir-shabda-kahn",
    order: 4,
    photoUrl: "https://pirshabda.org/imager/assets/photos/pShabdaMurshidPhoto_dbf8d6a38dd21a4600d81f78eddca413.jpg",
  },
  {
    slug: "abraham-sussman",
    order: 5,
    photoUrl: "https://ruhaniat.org/images/stories/Murshids_Circl/Abraham_Sussman_MC.png",
  },
  {
    slug: "halima-sussman",
    order: 6,
    photoUrl: "https://ruhaniat.org/images/stories/Murshids_Circl/halima%20sussman.gif",
  },
  {
    slug: "frida-waterhouse",
    order: 7,
    photoUrl: "http://www.dervish-healing-order.org/wp-content/uploads/2012/06/Frida-1.jpg",
  },
  {
    slug: "karmu",
    order: 8,
    photoUrl: "https://www.god-helmet.com/wp/karmu/karmu_front_cover.jpg",
  },
];

async function main() {
  for (const u of updates) {
    await prisma.teacher.update({
      where: { slug: u.slug },
      data: { photoUrl: u.photoUrl, order: u.order },
    });
    console.log(`  updated: ${u.slug}`);
  }
  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
