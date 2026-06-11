"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BedDouble, Check, Pencil, Plus, Trash2, X } from "lucide-react";

type Room = { id: string; name: string; capacity: number | null };

async function updateRegistration(id: string, body: Record<string, unknown>) {
  await fetch(`/api/admin/registrations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Per-registration room dropdown ─────────────────────────────────────────

export function RoomSelect({
  registrationId,
  roomId,
  rooms,
}: {
  registrationId: string;
  roomId: string | null;
  rooms: Room[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setBusy(true);
    await updateRegistration(registrationId, { roomId: e.target.value || null });
    router.refresh();
    setBusy(false);
  }

  return (
    <select
      value={roomId ?? ""}
      onChange={onChange}
      disabled={busy}
      className={`text-xs border rounded-md px-2 py-1.5 bg-white max-w-[10rem] disabled:opacity-50 ${
        roomId ? "border-gray-300 text-gray-800" : "border-dashed border-gray-300 text-gray-400"
      }`}
    >
      <option value="">Unassigned</option>
      {rooms.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  );
}

// ── Per-registration check-in checkbox ─────────────────────────────────────

export function CheckInBox({
  registrationId,
  checkedIn,
}: {
  registrationId: string;
  checkedIn: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setBusy(true);
    await updateRegistration(registrationId, { checkedIn: e.target.checked });
    router.refresh();
    setBusy(false);
  }

  return (
    <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checkedIn}
        onChange={onChange}
        disabled={busy}
        className="h-4 w-4 rounded border-gray-300 accent-green-600 disabled:opacity-50"
      />
      <span className={`text-xs ${checkedIn ? "text-green-700 font-medium" : "text-gray-400"}`}>
        {checkedIn ? "Checked in" : "Check in"}
      </span>
    </label>
  );
}

// ── Rooms manager (add / rename / delete the available room names) ─────────

export function RoomsManager({ rooms }: { rooms: (Room & { occupants: number })[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [newCapacity, setNewCapacity] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCapacity, setEditCapacity] = useState("");

  async function handle(res: Response) {
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong");
    } else {
      setError("");
      router.refresh();
    }
    setBusy(false);
  }

  async function addRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    const res = await fetch("/api/admin/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, capacity: newCapacity || null }),
    });
    if (res.ok) {
      setNewName("");
      setNewCapacity("");
    }
    await handle(res);
  }

  async function saveRoom(id: string) {
    setBusy(true);
    const res = await fetch(`/api/admin/rooms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, capacity: editCapacity || null }),
    });
    if (res.ok) setEditingId(null);
    await handle(res);
  }

  async function deleteRoom(id: string, name: string, occupants: number) {
    const note = occupants > 0 ? ` ${occupants} assigned participant(s) will become unassigned.` : "";
    if (!confirm(`Delete room "${name}"?${note}`)) return;
    setBusy(true);
    await handle(await fetch(`/api/admin/rooms/${id}`, { method: "DELETE" }));
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <BedDouble size={15} className="text-[#c4922b]" />
          Manage rooms
          <span className="text-gray-400 font-normal">({rooms.length})</span>
        </span>
        <span className="text-gray-400">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          {rooms.length > 0 && (
            <ul className="space-y-1.5 mb-4">
              {rooms.map((room) =>
                editingId === room.id ? (
                  <li key={room.id} className="flex items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 text-sm border border-gray-300 rounded-md px-2.5 py-1.5"
                      autoFocus
                    />
                    <input
                      value={editCapacity}
                      onChange={(e) => setEditCapacity(e.target.value.replace(/\D/g, ""))}
                      placeholder="Beds"
                      className="w-16 text-sm border border-gray-300 rounded-md px-2.5 py-1.5"
                    />
                    <button
                      onClick={() => saveRoom(room.id)}
                      disabled={busy}
                      className="p-1.5 text-green-700 hover:bg-green-50 rounded-md disabled:opacity-50"
                      title="Save"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md"
                      title="Cancel"
                    >
                      <X size={15} />
                    </button>
                  </li>
                ) : (
                  <li key={room.id} className="flex items-center gap-2 group">
                    <span className="flex-1 text-sm text-gray-800">
                      {room.name}
                      <span className="text-xs text-gray-400 ml-2">
                        {room.occupants}{room.capacity ? ` / ${room.capacity}` : ""} sleeping
                      </span>
                    </span>
                    <button
                      onClick={() => {
                        setEditingId(room.id);
                        setEditName(room.name);
                        setEditCapacity(room.capacity?.toString() ?? "");
                      }}
                      className="p-1.5 text-gray-300 group-hover:text-gray-500 hover:bg-gray-100 rounded-md"
                      title="Rename"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteRoom(room.id, room.name, room.occupants)}
                      disabled={busy}
                      className="p-1.5 text-gray-300 group-hover:text-red-500 hover:bg-red-50 rounded-md disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                )
              )}
            </ul>
          )}

          <form onSubmit={addRoom} className="flex items-center gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New room name (e.g. Yurt, Lotus Room)"
              className="flex-1 text-sm border border-gray-300 rounded-md px-2.5 py-1.5"
            />
            <input
              value={newCapacity}
              onChange={(e) => setNewCapacity(e.target.value.replace(/\D/g, ""))}
              placeholder="Beds"
              className="w-16 text-sm border border-gray-300 rounded-md px-2.5 py-1.5"
            />
            <button
              type="submit"
              disabled={busy || !newName.trim()}
              className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md bg-[#c4922b] text-white hover:bg-[#a87b20] transition-colors disabled:opacity-50"
            >
              <Plus size={14} />
              Add
            </button>
          </form>
          {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}
