interface VideoEmbedProps {
  url: string;
  caption?: string;
}

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

export function VideoEmbed({ url, caption }: VideoEmbedProps) {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  return (
    <figure className="my-8">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border shadow-lg">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={caption ?? "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-text-muted">{caption}</figcaption>
      )}
    </figure>
  );
}
