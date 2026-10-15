import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const alt = siteConfig.brand;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/logo-dark.png"), "base64");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFF8F2 0%, #F6EDE6 50%, #E8D8CE 100%)",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "60px",
          }}
        >
          <p
            style={{
              fontSize: 24,
              color: "#C8A45D",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Premium Makeup Artist
          </p>
          <img
            src={`data:image/png;base64,${logo}`}
            alt={siteConfig.brand}
            width={720}
            height={58}
          />
          <p
            style={{
              fontSize: 28,
              color: "#6F5A50",
              marginTop: 24,
              textAlign: "center",
              maxWidth: 700,
            }}
          >
            Soft Glam, Event & Bridal Makeup in Lagos, Nigeria
          </p>
          <div
            style={{
              marginTop: 40,
              padding: "12px 32px",
              background: "#B76E79",
              color: "white",
              borderRadius: 999,
              fontSize: 22,
            }}
          >
            Check Availability
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
