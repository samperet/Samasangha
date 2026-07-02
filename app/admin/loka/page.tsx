import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import LokaRowActions from "./LokaRowActions";

export const dynamic = "force-dynamic";

export default async function AdminLokaPage() {
  const recordings = await prisma.lokaRecording
    .findMany({ orderBy: { createdAt: "desc" } })
    .catch(() => []);

  const pending = recordings.filter((r) => !r.approved);
  const approved = recordings.filter((r) => r.approved);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">Loka Samasta voices</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Review submitted recordings. Only approved takes appear in the public mix at{" "}
          <a href="/loka" target="_blank" className="text-[#8f2a23] hover:underline">/loka</a>.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total", value: recordings.length, color: "text-gray-800" },
          { label: "Pending", value: pending.length, color: "text-amber-700" },
          { label: "Approved", value: approved.length, color: "text-green-700" },
          {
            label: "Higher / Lower",
            value: `${approved.filter((r) => r.voiceType === "HIGHER").length} / ${approved.filter((r) => r.voiceType === "LOWER").length}`,
            color: "text-[#c4922b]",
          },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {recordings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
          No recordings yet.
        </div>
      ) : (
        <div className="space-y-3">
          {[...pending, ...approved].map((r) => (
            <div
              key={r.id}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-800">{r.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.voiceType === "HIGHER" ? "bg-sky-100 text-sky-700" : "bg-violet-100 text-violet-700"
                    }`}
                  >
                    {r.voiceType === "HIGHER" ? "Higher" : "Lower"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.approved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {r.approved ? "Approved" : "Pending"}
                  </span>
                  {(r.mimeType ?? "").startsWith("video/") && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                      🎥 Video
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  <a href={`mailto:${r.email}`} className="hover:underline">{r.email}</a>
                  {" · "}
                  {formatDate(r.createdAt)}
                </p>
                {(r.mimeType ?? "").startsWith("video/") ? (
                  <video controls preload="metadata" src={r.audioUrl} className="mt-2 w-full max-w-md rounded-lg bg-black" />
                ) : (
                  <audio controls preload="none" src={r.audioUrl} className="mt-2 w-full max-w-md h-9" />
                )}
              </div>
              <LokaRowActions id={r.id} approved={r.approved} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
