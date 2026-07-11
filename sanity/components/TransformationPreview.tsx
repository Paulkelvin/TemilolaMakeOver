import { useCallback, useMemo, useRef, useState } from "react";
import { useClient, PatchEvent, set } from "sanity";
import { useDocumentPane } from "sanity/structure";
import imageUrlBuilder from "@sanity/image-url";
import { Badge, Box, Card, Flex, Stack, Text } from "@sanity/ui";

const API_VERSION = "2024-01-01";
// Matches BeforeAfterSlider's aspect-[4/5] container and getTransformations'
// TRANSFORMATION_ASPECT_RATIO on the live site — this preview must stay in
// lockstep with those or "what you see here" stops being "what ships".
const ASPECT_RATIO = 4 / 5;
const PREVIEW_WIDTH = 800;
const EDITOR_BOX_CSS_WIDTH = 280;
const EDITOR_BOX_CSS_HEIGHT = EDITOR_BOX_CSS_WIDTH / ASPECT_RATIO;
const MAX_ZOOM = 3;

interface CropRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

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

// Sanity image asset refs encode native pixel dimensions in the id itself
// (image-<hash>-<width>x<height>-<format>) — reading them straight out of
// the ref avoids a network round-trip just to learn the image's own size.
function parseAssetDimensions(ref: string | undefined): { width: number; height: number } | null {
  if (!ref) return null;
  const match = ref.match(/-(\d+)x(\d+)-/);
  if (!match) return null;
  return { width: parseInt(match[1], 10), height: parseInt(match[2], 10) };
}

// The largest 4:5 rectangle that fits inside a W×H image — "zoom level 1",
// showing as much of the original photo as this crop shape allows.
function baseCropSize(width: number, height: number): { width: number; height: number } {
  const widthConstrained = width / ASPECT_RATIO <= height;
  if (widthConstrained) return { width, height: width / ASPECT_RATIO };
  return { width: height * ASPECT_RATIO, height };
}

function cropRectToFractions(rect: { left: number; top: number; width: number; height: number }, imgW: number, imgH: number) {
  const crop: CropRect = {
    left: rect.left / imgW,
    top: rect.top / imgH,
    right: (imgW - rect.left - rect.width) / imgW,
    bottom: (imgH - rect.top - rect.height) / imgH,
  };
  const hotspot = {
    x: (rect.left + rect.width / 2) / imgW,
    y: (rect.top + rect.height / 2) / imgH,
    width: rect.width / imgW,
    height: rect.height / imgH,
  };
  return { crop, hotspot };
}

interface PanZoomCropEditorProps {
  label: string;
  fieldName: "beforeImage" | "afterImage";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any;
  builder: ReturnType<typeof imageUrlBuilder>;
  onCommit: (fieldName: "beforeImage" | "afterImage", crop: CropRect, hotspot: { x: number; y: number; width: number; height: number }) => void;
}

function PanZoomCropEditor({ label, fieldName, image, builder, onCommit }: PanZoomCropEditorProps) {
  const dims = useMemo(() => parseAssetDimensions(image?.asset?._ref), [image?.asset?._ref]);
  const base = useMemo(() => (dims ? baseCropSize(dims.width, dims.height) : null), [dims]);

  // Initialize from whatever crop is already stored (so re-opening this
  // tab continues from the current framing instead of resetting it), else
  // start at zoom 1 / centered — same default the site itself falls back to.
  const initial = useMemo(() => {
    if (!dims || !base) return { cropWidth: 0, cropLeft: 0, cropTop: 0 };
    const crop = image?.crop as CropRect | undefined;
    if (crop) {
      const left = crop.left * dims.width;
      const top = crop.top * dims.height;
      const width = dims.width - left - crop.right * dims.width;
      return { cropWidth: width, cropLeft: left, cropTop: top };
    }
    const cropWidth = base.width;
    const cropHeight = base.height;
    return { cropWidth, cropLeft: (dims.width - cropWidth) / 2, cropTop: (dims.height - cropHeight) / 2 };
  }, [dims, base, image?.crop]);

  const [cropWidth, setCropWidth] = useState(initial.cropWidth);
  const [cropLeft, setCropLeft] = useState(initial.cropLeft);
  const [cropTop, setCropTop] = useState(initial.cropTop);
  const dragState = useRef<{ startX: number; startY: number; cropLeft: number; cropTop: number } | null>(null);

  const previewUrl = useMemo(() => (image?.asset ? builder.image(image).auto("format").width(1000).url() : null), [builder, image]);

  if (!dims || !base || !previewUrl) {
    return (
      <Stack space={2} flex={1}>
        <Text size={1} weight="semibold">{label}</Text>
        <Card padding={3} radius={2} tone="transparent" border style={{ height: EDITOR_BOX_CSS_HEIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Text size={1} muted>No image yet</Text>
        </Card>
      </Stack>
    );
  }

  const cropHeight = cropWidth / ASPECT_RATIO;
  const maxLeft = Math.max(0, dims.width - cropWidth);
  const maxTop = Math.max(0, dims.height - cropHeight);
  const displayScale = EDITOR_BOX_CSS_WIDTH / cropWidth;
  const zoom = base.width / cropWidth;

  const commit = useCallback(
    (finalLeft: number, finalTop: number, finalWidth: number) => {
      const finalHeight = finalWidth / ASPECT_RATIO;
      const { crop, hotspot } = cropRectToFractions({ left: finalLeft, top: finalTop, width: finalWidth, height: finalHeight }, dims.width, dims.height);
      onCommit(fieldName, crop, hotspot);
    },
    [dims, fieldName, onCommit]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragState.current = { startX: e.clientX, startY: e.clientY, cropLeft, cropTop };
    },
    [cropLeft, cropTop]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.current) return;
      const dxScreen = e.clientX - dragState.current.startX;
      const dyScreen = e.clientY - dragState.current.startY;
      const dxNative = dxScreen / displayScale;
      const dyNative = dyScreen / displayScale;
      const newLeft = Math.min(Math.max(dragState.current.cropLeft - dxNative, 0), maxLeft);
      const newTop = Math.min(Math.max(dragState.current.cropTop - dyNative, 0), maxTop);
      setCropLeft(newLeft);
      setCropTop(newTop);
    },
    [displayScale, maxLeft, maxTop]
  );

  const onPointerUp = useCallback(() => {
    if (!dragState.current) return;
    dragState.current = null;
    commit(cropLeft, cropTop, cropWidth);
  }, [commit, cropLeft, cropTop, cropWidth]);

  const onZoomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newZoom = parseFloat(e.target.value);
      const newWidth = base.width / newZoom;
      const newHeight = newWidth / ASPECT_RATIO;
      const centerX = cropLeft + cropWidth / 2;
      const centerY = cropTop + cropHeight / 2;
      const newMaxLeft = Math.max(0, dims.width - newWidth);
      const newMaxTop = Math.max(0, dims.height - newHeight);
      const newLeft = Math.min(Math.max(centerX - newWidth / 2, 0), newMaxLeft);
      const newTop = Math.min(Math.max(centerY - newHeight / 2, 0), newMaxTop);
      setCropWidth(newWidth);
      setCropLeft(newLeft);
      setCropTop(newTop);
      commit(newLeft, newTop, newWidth);
    },
    [base, cropLeft, cropTop, cropWidth, cropHeight, dims, commit]
  );

  return (
    <Stack space={2} flex={1}>
      <Flex align="center" justify="space-between">
        <Text size={1} weight="semibold">{label}</Text>
        <Badge tone="default" fontSize={0}>{zoom.toFixed(1)}×</Badge>
      </Flex>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: "relative",
          width: EDITOR_BOX_CSS_WIDTH,
          height: EDITOR_BOX_CSS_HEIGHT,
          overflow: "hidden",
          borderRadius: 10,
          border: "1px solid var(--card-border-color, #d8d8d8)",
          cursor: "grab",
          touchAction: "none",
          userSelect: "none",
          background: "#e5e5e5",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt={label}
          draggable={false}
          style={{
            position: "absolute",
            left: -cropLeft * displayScale,
            top: -cropTop * displayScale,
            width: dims.width * displayScale,
            height: dims.height * displayScale,
            maxWidth: "none",
            pointerEvents: "none",
          }}
        />
      </div>
      <label style={{ display: "block" }}>
        <Text size={0} muted style={{ marginBottom: 2, display: "block" }}>Zoom</Text>
        <input
          type="range"
          min={1}
          max={MAX_ZOOM}
          step={0.05}
          value={zoom}
          onChange={onZoomChange}
          style={{ width: "100%" }}
        />
      </label>
      <Text size={0} muted>Drag the photo to reposition · slide to zoom</Text>
    </Stack>
  );
}

function LiveSlider({ beforeUrl, afterUrl }: { beforeUrl: string; afterUrl: string }) {
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

export function TransformationPreview() {
  const client = useClient({ apiVersion: API_VERSION });
  const { displayed, onChange } = useDocumentPane();
  const builder = useMemo(() => imageUrlBuilder(client), [client]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const beforeImage = (displayed as any)?.beforeImage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const afterImage = (displayed as any)?.afterImage;

  const beforeUrl = useMemo(() => croppedUrl(builder, beforeImage), [builder, beforeImage]);
  const afterUrl = useMemo(() => croppedUrl(builder, afterImage), [builder, afterImage]);

  const handleCommit = useCallback(
    (fieldName: "beforeImage" | "afterImage", crop: CropRect, hotspot: { x: number; y: number; width: number; height: number }) => {
      onChange(
        PatchEvent.from([
          set({ _type: "sanity.imageCrop", ...crop }, [fieldName, "crop"]),
          set({ _type: "sanity.imageHotspot", ...hotspot }, [fieldName, "hotspot"]),
        ])
      );
    },
    [onChange]
  );

  if (!beforeImage?.asset || !afterImage?.asset) {
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
            Drag either photo to reposition it, slide to zoom in or out — this writes directly to that image&rsquo;s crop, the
            same field the crop tool on the Form tab edits. The slider below always shows the current result, exactly as it
            will appear on the website.
          </Text>
        </Card>

        <Flex gap={4} wrap="wrap">
          <PanZoomCropEditor label="Before" fieldName="beforeImage" image={beforeImage} builder={builder} onCommit={handleCommit} />
          <PanZoomCropEditor label="After" fieldName="afterImage" image={afterImage} builder={builder} onCommit={handleCommit} />
        </Flex>

        <Stack space={2}>
          <Text size={1} weight="semibold">
            Live slider (drag to compare, same as the website)
          </Text>
          {beforeUrl && afterUrl && <LiveSlider beforeUrl={beforeUrl} afterUrl={afterUrl} />}
        </Stack>
      </Stack>
    </Box>
  );
}
