"use client";

import { useMemo, useState } from "react";

type Profile = {
  id: string;
  name: string;
  location: string;
  email: string;
  phone: string | null;
  photoUrl: string | null;
};

export default function DirectoryList({ profiles }: { profiles: Profile[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedQuery) return profiles;
    return profiles.filter((profile) =>
      [profile.name, profile.location, profile.email, profile.phone ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [normalizedQuery, profiles]);

  if (profiles.length === 0) {
    return (
      <p className="text-center italic mb-12" style={{ color: "var(--fg3)" }}>
        No one here yet, be the first to add yourself below.
      </p>
    );
  }

  return (
    <section className="mb-14" aria-label="Mureed listings">
      <label className="block mb-5">
        <span className="eyebrow mb-2 block" style={{ fontSize: "0.62rem", color: "var(--gold-600)" }}>
          Search directory
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, location, email, or phone"
          className="w-full rounded-lg px-4 py-3 text-sm outline-none"
          style={{
            background: "var(--parch-50)",
            border: "1px solid var(--surface-border)",
            color: "var(--ink-900)",
            boxShadow: "var(--shadow-sm)",
          }}
        />
      </label>

      {filtered.length === 0 ? (
        <p className="text-center italic" style={{ color: "var(--fg3)" }}>
          No matching mureeds found.
        </p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((profile) => (
            <li
              key={profile.id}
              className="flex items-center gap-5 rounded-2xl px-6 py-5"
              style={{
                background: "var(--parch-50)",
                border: "1px solid var(--surface-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full object-cover shrink-0"
                  style={{ border: "1px solid var(--surface-border)" }}
                />
              ) : (
                <span
                  className="w-16 h-16 rounded-full shrink-0 flex items-center justify-center font-serif text-xl"
                  style={{ background: "var(--parch-100)", color: "var(--gold-700)", border: "1px solid var(--surface-border)" }}
                  aria-hidden
                >
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 500, color: "var(--ink-900)" }}>
                  {profile.name}
                </p>
                <p className="text-sm" style={{ color: "var(--fg2)" }}>{profile.location}</p>
                <p className="text-sm break-words" style={{ color: "var(--fg2)" }}>
                  <a href={`mailto:${profile.email}`} style={{ color: "var(--crimson-700)" }}>{profile.email}</a>
                  {profile.phone && (
                    <span style={{ color: "var(--fg3)" }}>{"  ·  "}{profile.phone}</span>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
