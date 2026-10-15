import { readFile } from "node:fs/promises";
import { join } from "node:path";
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
  const [icon, logo] = await Promise.all([
    readFile(join(process.cwd(), "public/brand/icon-192.png"), "base64"),
    readFile(join(process.cwd(), "public/brand/logo-dark.png"), "base64"),
  ]);

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
          <img
            src={`data:image/png;base64,${icon}`}
            alt=""
            width={48}
            height={48}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <img
              src={`data:image/png;base64,${logo}`}
              alt="Gleam by Temi"
              width={220}
              height={18}
            />
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
