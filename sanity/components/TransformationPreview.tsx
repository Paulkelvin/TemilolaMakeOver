import { useCallback, useMemo, useRef, useState } from "react";
import { useClient } from "sanity";
import { useDocumentPane } from "sanity/structure";
import imageUrlBuilder from "@sanity/image-url";
import { Box, Card, Flex, Stack, Text } from "@sanity/ui";

const API_VERSION = "2024-01-01";
// Matches BeforeAfterSlider's aspect-[4/5] container and getTransformations'
// TRANSFORMATION_ASPECT_RATIO on the live site — requesting the same
// width/height here bakes in the same Studio-set crop the site will use,
// so what's shown here is what actually ships, not an approximation.
const ASPECT_RATIO = 4 / 5;
const PREVIEW_WIDTH = 480;

function croppedUrl(builder: ReturnType<typeof imageUrlBuilder>, image: unknown): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(image as any)?.asset) return null;
  return builder
    .image(image as never)
    .auto("format")
    .width(PREVIEW_WIDTH)
    .height(Math.round(PREVIEW_WIDTH / ASPECT_RATIO))
    .url();
}

function Slider({ beforeUrl, afterUrl }: { beforeUrl: string; afterUrl: string }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(Math.max(x, 0), 100));
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: PREVIEW_WIDTH,
        aspectRatio: `${ASPECT_RATIO}`,
        overflow: "hidden",
        borderRadius: 12,
        userSelect: "none",
        touchAction: "pan-y",
        cursor: "ew-resize",
      }}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        updatePosition(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && updatePosition(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beforeUrl}
        alt="Before"
        draggable={false}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
      />
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterUrl}
          alt="After"
          draggable={false}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${position}%`,
          width: 2,
          background: "white",
          transform: "translateX(-50%)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.3)",
        }}
      />
      <span style={{ position: "absolute", left: 10, top: 10, background: "#c0446a", color: "#fff", fontSize: 11, padding: "2px 10px", borderRadius: 999 }}>
        After
      </span>
      <span style={{ position: "absolute", right: 10, top: 10, background: "rgba(20,15,14,0.8)", color: "#fff", fontSize: 11, padding: "2px 10px", borderRadius: 999 }}>
        Before
      </span>
    </div>
  );
}

function SideBySide({ beforeUrl, afterUrl }: { beforeUrl: string; afterUrl: string }) {
  const halfWidth = PREVIEW_WIDTH / 2;
  return (
    <Flex gap={0} style={{ maxWidth: PREVIEW_WIDTH, borderRadius: 12, overflow: "hidden" }}>
      {[
        { url: beforeUrl, label: "Before" },
        { url: afterUrl, label: "After" },
      ].map(({ url, label }) => (
        <div key={label} style={{ position: "relative", width: halfWidth, aspectRatio: `${ASPECT_RATIO}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          {/* Fixed reference line — not tied to any measured feature, just a
              shared ruler so eye-lines/hairlines can be compared by eye
              between the two crops. */}
          <div style={{ position: "absolute", left: 0, right: 0, top: "32%", height: 1, background: "rgba(220,60,90,0.85)" }} />
          <span style={{ position: "absolute", left: 8, bottom: 8, background: "rgba(20,15,14,0.75)", color: "#fff", fontSize: 11, padding: "1px 8px", borderRadius: 999 }}>
            {label}
          </span>
        </div>
      ))}
    </Flex>
  );
}

export function TransformationPreview() {
  const client = useClient({ apiVersion: API_VERSION });
  const { displayed } = useDocumentPane();
  const builder = useMemo(() => imageUrlBuilder(client), [client]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const beforeImage = (displayed as any)?.beforeImage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const afterImage = (displayed as any)?.afterImage;

  const beforeUrl = useMemo(() => croppedUrl(builder, beforeImage), [builder, beforeImage]);
  const afterUrl = useMemo(() => croppedUrl(builder, afterImage), [builder, afterImage]);

  if (!beforeUrl || !afterUrl) {
    return (
      <Box padding={4}>
        <Card padding={4} radius={2} tone="caution" border>
          <Text size={1}>Add both a Before and After image on the Form tab first — this preview needs both to show anything.</Text>
        </Card>
      </Box>
    );
  }

  return (
    <Box padding={4}>
      <Stack space={4}>
        <Card padding={3} radius={2} tone="primary" border>
          <Text size={1}>
            This is the exact crop the website uses — cropped and sized the same way as the live slider. Go to the{" "}
            <strong>Form</strong> tab, click an image, use the crop tool (crop icon) to adjust framing, then come back to this
            tab to see the result. The red line below is just a shared ruler for comparing eye/hairline height by eye — it
            isn&rsquo;t measuring anything automatically.
          </Text>
        </Card>

        <Stack space={2}>
          <Text size={1} weight="semibold">
            Side by side
          </Text>
          <SideBySide beforeUrl={beforeUrl} afterUrl={afterUrl} />
        </Stack>

        <Stack space={2}>
          <Text size={1} weight="semibold">
            Live slider (drag to compare, same as the website)
          </Text>
          <Slider beforeUrl={beforeUrl} afterUrl={afterUrl} />
        </Stack>
      </Stack>
    </Box>
  );
}
