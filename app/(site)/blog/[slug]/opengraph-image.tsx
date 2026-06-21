import { ImageResponse } from "next/og";
import { getBlogPostBySlug } from "@/sanity/fetch";

export const alt = "Blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  const title = post?.title ?? "Blog";
  const category = post?.category ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #FFF8F2 0%, #F6EDE6 50%, #E8D8CE 100%)",
          fontFamily: "Georgia, serif",
          padding: "60px 80px",
        }}
      >
        {category && (
          <p
            style={{
              fontSize: 20,
              color: "#C8A45D",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            {category}
          </p>
        )}
        <h1
          style={{
            fontSize: title.length > 60 ? 48 : 56,
            color: "#241A17",
            margin: 0,
            lineHeight: 1.2,
            maxWidth: 900,
          }}
        >
          {title}
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 40,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 999,
              background: "#B76E79",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            T
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 18, color: "#241A17", fontWeight: 600 }}>
              Temilola Makeup
            </span>
            <span style={{ fontSize: 14, color: "#6F5A50" }}>
              Beauty Tips & Inspiration
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
