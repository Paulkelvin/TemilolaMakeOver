import { useCallback, useMemo, useRef, useState } from "react";
import { useClient, PatchEvent, set } from "sanity";
import { useDocumentPane } from "sanity/structure";
import imageUrlBuilder from "@sanity/image-url";
import { Box, Card, Flex, Stack, Text } from "@sanity/ui";

const API_VERSION = "2024-01-01";
// Matches BeforeAfterSlider's aspect-[4/5] container and getTransformations'
// TRANSFORMATION_ASPECT_RATIO on the live site — this preview must stay in
// lockstep with those or "what you see here" stops being "what ships".
const ASPECT_RATIO = 4 / 5;
const PREVIEW_WIDTH = 800;
const BOX_WIDTH = 340;
const BOX_HEIGHT = BOX_WIDTH / ASPECT_RATIO;
const MAX_ZOOM = 3;

interface CropRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

type FieldName = "beforeImage" | "afterImage";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useImageCropState(image: any) {
  const dims = useMemo(() => parseAssetDimensions(image?.asset?._ref), [image?.asset?._ref]);
  const base = useMemo(() => (dims ? baseCropSize(dims.width, dims.height) : null), [dims]);

  // Initialize from whatever crop is already stored (so re-opening this tab
  // continues from the current framing instead of resetting it), else start
  // at zoom 1 / centered — same default the site itself falls back to.
  const initial = useMemo(() => {
    if (!dims || !base) return { cropWidth: 0, cropLeft: 0, cropTop: 0 };
    const crop = image?.crop as CropRect | undefined;
    if (crop) {
      const left = crop.left * dims.width;
      const top = crop.top * dims.height;
      const width = dims.width - left - crop.right * dims.width;
      return { cropWidth: width, cropLeft: left, cropTop: top };
    }
    return { cropWidth: base.width, cropLeft: (dims.width - base.width) / 2, cropTop: (dims.height - base.height) / 2 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims, base]);

  const [cropWidth, setCropWidth] = useState(initial.cropWidth);
  const [cropLeft, setCropLeft] = useState(initial.cropLeft);
  const [cropTop, setCropTop] = useState(initial.cropTop);

  return { dims, base, cropWidth, cropLeft, cropTop, setCropWidth, setCropLeft, setCropTop };
}

type CropState = ReturnType<typeof useImageCropState>;

function ImageLayer({ image, builder, crop, clipRight }: { image: unknown; builder: ReturnType<typeof imageUrlBuilder>; crop: CropState; clipRight?: number }) {
  const previewUrl = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => ((image as any)?.asset ? builder.image(image as never).auto("format").width(1000).url() : null),
    [builder, image]
  );
  if (!previewUrl || !crop.dims) return null;
  const displayScale = BOX_WIDTH / crop.cropWidth;
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={previewUrl}
      alt=""
      draggable={false}
      style={{
        position: "absolute",
        left: -crop.cropLeft * displayScale,
        top: -crop.cropTop * displayScale,
        width: crop.dims.width * displayScale,
        height: crop.dims.height * displayScale,
        maxWidth: "none",
        pointerEvents: "none",
      }}
    />
  );
  if (clipRight === undefined) return img;
  return (
    <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${clipRight}% 0 0)` }}>{img}</div>
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

  const beforeCrop = useImageCropState(beforeImage);
  const afterCrop = useImageCropState(afterImage);

  const [activeField, setActiveField] = useState<FieldName>("beforeImage");
  const active = activeField === "beforeImage" ? beforeCrop : afterCrop;

  const dragState = useRef<{ startX: number; startY: number; cropLeft: number; cropTop: number } | null>(null);

  const commit = useCallback(
    (field: FieldName, dims: { width: number; height: number }, left: number, top: number, width: number) => {
      const height = width / ASPECT_RATIO;
      const { crop, hotspot } = cropRectToFractions({ left, top, width, height }, dims.width, dims.height);
      onChange(
        PatchEvent.from([
          set({ _type: "sanity.imageCrop", ...crop }, [field, "crop"]),
          set({ _type: "sanity.imageHotspot", ...hotspot }, [field, "hotspot"]),
        ])
      );
    },
    [onChange]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!active.dims) return;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragState.current = { startX: e.clientX, startY: e.clientY, cropLeft: active.cropLeft, cropTop: active.cropTop };
    },
    [active.dims, active.cropLeft, active.cropTop]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.current || !active.dims) return;
      const displayScale = BOX_WIDTH / active.cropWidth;
      const dxNative = (e.clientX - dragState.current.startX) / displayScale;
      const dyNative = (e.clientY - dragState.current.startY) / displayScale;
      const maxLeft = Math.max(0, active.dims.width - active.cropWidth);
      const maxTop = Math.max(0, active.dims.height - active.cropWidth / ASPECT_RATIO);
      active.setCropLeft(Math.min(Math.max(dragState.current.cropLeft - dxNative, 0), maxLeft));
      active.setCropTop(Math.min(Math.max(dragState.current.cropTop - dyNative, 0), maxTop));
    },
    [active]
  );

  const onPointerUp = useCallback(() => {
    if (!dragState.current || !active.dims) return;
    dragState.current = null;
    commit(activeField, active.dims, active.cropLeft, active.cropTop, active.cropWidth);
  }, [active, activeField, commit]);

  const onZoomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!active.dims || !active.base) return;
      const newZoom = parseFloat(e.target.value);
      const newWidth = active.base.width / newZoom;
      const newHeight = newWidth / ASPECT_RATIO;
      const centerX = active.cropLeft + active.cropWidth / 2;
      const centerY = active.cropTop + active.cropWidth / ASPECT_RATIO / 2;
      const newMaxLeft = Math.max(0, active.dims.width - newWidth);
      const newMaxTop = Math.max(0, active.dims.height - newHeight);
      const newLeft = Math.min(Math.max(centerX - newWidth / 2, 0), newMaxLeft);
      const newTop = Math.min(Math.max(centerY - newHeight / 2, 0), newMaxTop);
      active.setCropWidth(newWidth);
      active.setCropLeft(newLeft);
      active.setCropTop(newTop);
      commit(activeField, active.dims, newLeft, newTop, newWidth);
    },
    [active, activeField, commit]
  );

  const beforeUrl = useMemo(() => croppedUrl(builder, beforeImage), [builder, beforeImage]);
  const afterUrl = useMemo(() => croppedUrl(builder, afterImage), [builder, afterImage]);

  if (!beforeImage?.asset || !afterImage?.asset) {
    return (
      <Box padding={4}>
        <Card padding={4} radius={2} tone="caution" border>
          <Text size={1}>Add both a Before and After image on the Form tab first — this preview needs both to show anything.</Text>
        </Card>
      </Box>
    );
  }

  const zoom = active.base ? active.base.width / active.cropWidth : 1;

  return (
    <Box padding={4}>
      <Stack space={4}>
        <Card padding={3} radius={2} tone="primary" border>
          <Text size={1}>
            Split down the middle, just like the website slider — pick which side you&rsquo;re adjusting below, then drag
            directly on the photo to reposition it, or use the zoom bar to crop in or out. Changes save to that image&rsquo;s
            crop as you go.
          </Text>
        </Card>

        <Stack space={3}>
          <Flex gap={2}>
            {(["beforeImage", "afterImage"] as FieldName[]).map((field) => {
              const isActive = activeField === field;
              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => setActiveField(field)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: isActive ? "2px solid #c0446a" : "1px solid var(--card-border-color, #d8d8d8)",
                    background: isActive ? "rgba(192,68,106,0.08)" : "transparent",
                    fontWeight: isActive ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  {field === "beforeImage" ? "Adjust Before" : "Adjust After"}
                </button>
              );
            })}
          </Flex>

          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              position: "relative",
              width: BOX_WIDTH,
              maxWidth: "100%",
              height: BOX_HEIGHT,
              overflow: "hidden",
              borderRadius: 12,
              border: "1px solid var(--card-border-color, #d8d8d8)",
              cursor: "grab",
              touchAction: "none",
              userSelect: "none",
              background: "#e5e5e5",
            }}
          >
            <ImageLayer image={beforeImage} builder={builder} crop={beforeCrop} />
            <ImageLayer image={afterImage} builder={builder} crop={afterCrop} clipRight={50} />
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "50%",
                width: 2,
                background: "white",
                transform: "translateX(-50%)",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.3)",
                pointerEvents: "none",
              }}
            />
            <span style={{ position: "absolute", left: 10, top: 10, background: "#c0446a", color: "#fff", fontSize: 11, padding: "2px 10px", borderRadius: 999, pointerEvents: "none" }}>
              After
            </span>
            <span style={{ position: "absolute", right: 10, top: 10, background: "rgba(20,15,14,0.8)", color: "#fff", fontSize: 11, padding: "2px 10px", borderRadius: 999, pointerEvents: "none" }}>
              Before
            </span>
          </div>

          <label style={{ display: "block" }}>
            <Flex justify="space-between">
              <Text size={0} muted>Zoom ({activeField === "beforeImage" ? "Before" : "After"})</Text>
              <Text size={0} muted>{zoom.toFixed(1)}×</Text>
            </Flex>
            <input type="range" min={1} max={MAX_ZOOM} step={0.05} value={zoom} onChange={onZoomChange} style={{ width: "100%" }} />
          </label>
          <Text size={0} muted>Drag the photo above to reposition · slide to zoom · switch sides with the buttons above</Text>
        </Stack>

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
