import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";

interface VideoReelProps {
  youtubeUrl?: string;
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

export function VideoReel({ youtubeUrl }: VideoReelProps) {
  if (!youtubeUrl) return null;
  const videoId = getYouTubeId(youtubeUrl);
  if (!videoId) return null;

  return (
    <SectionWrapper variant="blush" id="reel">
      <Container size="narrow">
        <SectionHeading
          label="Our Work"
          title="Watch the Transformation"
          subtitle="From bare skin to camera-ready — see how a Gleam by Temi session unfolds."
        />
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border shadow-xl">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
            title="Gleam by Temi — Work Reel"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </Container>
    </SectionWrapper>
  );
}
