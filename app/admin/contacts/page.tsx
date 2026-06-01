import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import MarkReadButton from "./MarkReadButton";

async function getContacts() {
  try {
    return await prisma.contact.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

export default async function AdminContactsPage() {
  const contacts = await getContacts();
  const unread = contacts.filter((c) => !c.read).length;

  return (
    <>
      <h1 className="text-2xl font-bold text-[#1a2744] mb-2">Contact Inbox</h1>
      <p className="text-gray-500 mb-6">{unread} unread message{unread !== 1 ? "s" : ""}</p>

      {contacts.length === 0 ? (
        <p className="text-gray-400">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {contacts.map((c) => (
            <div key={c.id} className={`bg-white rounded-xl border p-5 ${!c.read ? "border-[#c9a84c]" : ""}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold text-[#1a2744]">{c.name}</span>
                  <span className="text-gray-400 text-sm ml-2">&lt;{c.email}&gt;</span>
                  {!c.read && <span className="ml-2 px-1.5 py-0.5 bg-[#c9a84c] text-white text-xs rounded">New</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs">{formatDate(c.createdAt)}</span>
                  {!c.read && <MarkReadButton id={c.id} />}
                </div>
              </div>
              {c.subject && <p className="text-sm font-medium text-gray-600 mb-1">Re: {c.subject}</p>}
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{c.message}</p>
              <a href={`mailto:${c.email}`} className="inline-block mt-3 text-sm text-[#1a2744] hover:underline">
                Reply via email →
              </a>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
