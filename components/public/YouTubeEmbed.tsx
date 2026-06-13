// Extract the 11-char video id from any YouTube URL form
// (watch?v=, youtu.be/, /embed/, /shorts/, or a bare id).
export function youtubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const url = input.trim();
  const patterns = [
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url;
  return null;
}

/** Thumbnail image URL for any YouTube URL form, or null. */
export function youtubeThumbnail(input: string | null | undefined): string | null {
  const id = youtubeId(input);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

// Normalize any YouTube URL form into an embeddable URL.
export function youtubeEmbedUrl(input: string | null | undefined): string | null {
  const id = youtubeId(input);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export default function YouTubeEmbed({
  url,
  title = "Video",
  className,
}: {
  url: string | null | undefined;
  title?: string;
  className?: string;
}) {
  const src = youtubeEmbedUrl(url);
  if (!src) return null;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        paddingBottom: "56.25%",
        height: 0,
        overflow: "hidden",
        borderRadius: 8,
        margin: "0 0 2rem",
      }}
    >
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
      />
    </div>
  );
}
