import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_COOKIE,
  DEEPENING_COOKIE,
  verifyDeepeningToken,
  verifySessionToken,
} from "@/lib/admin-token";
import DeepeningGate from "../../deepen/deepening/DeepeningGate";
import AddProfileForm from "./AddProfileForm";
import DirectoryList from "./DirectoryList";

export const metadata: Metadata = { title: "Sangha Connections" };
export const dynamic = "force-dynamic";

async function getProfiles() {
  try {
    return await prisma.mureedProfile.findMany({ orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}

export default async function MureedDirectoryPage() {
  // Same gate as the rest of the Mureeds Circle (shared cookie)
  const store = await cookies();
  const unlocked =
    (await verifyDeepeningToken(store.get(DEEPENING_COOKIE)?.value)) ||
    (await verifySessionToken(store.get(ADMIN_COOKIE)?.value));

  if (!unlocked) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-stone-800 mb-10 text-center">
          Sangha Connections
        </h1>
        <DeepeningGate />
      </div>
    );
  }

  const profiles = await getProfiles();

  return (
    <div className="max-w-2xl mx-auto px-5 py-16">
      <div className="text-center mb-4">
        <h1
          className="font-serif"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)", fontWeight: 400, color: "var(--ink-900)", lineHeight: 1.1 }}
        >
          Sangha Connections
        </h1>
        <div className="flex justify-center my-4" aria-hidden>
          <img src="/assets/decorative-line.png" alt="" className="h-6 w-auto" />
        </div>
        <p className="leading-relaxed max-w-xl mx-auto" style={{ color: "var(--fg2)" }}>
          Find one another. Add yourself so friends on the path can reach you.
        </p>
      </div>

      <div className="mb-10" />

      {/* Listings */}
      <DirectoryList profiles={profiles} />

      {/* Submission form */}
      <AddProfileForm />
    </div>
  );
}
