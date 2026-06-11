// Normalize any YouTube URL form (watch?v=, youtu.be/, /embed/, or a bare id)
// into an embeddable URL. Returns null if no id can be found.
export function youtubeEmbedUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const url = input.trim();

  // Already an embed URL
  const embed = url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/);
  if (embed) return `https://www.youtube.com/embed/${embed[1]}`;

  // watch?v=ID
  const watch = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;

  // youtu.be/ID
  const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;

  // /shorts/ID
  const shorts = url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/);
  if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`;

  // Bare 11-char id
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) return `https://www.youtube.com/embed/${url}`;

  return null;
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
