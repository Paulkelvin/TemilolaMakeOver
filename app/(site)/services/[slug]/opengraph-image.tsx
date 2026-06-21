import { ImageResponse } from "next/og";
import { getServiceBySlug } from "@/sanity/fetch";
import { formatPrice } from "@/lib/utils";

export const alt = "Service";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  const name = service?.name ?? "Service";
  const description = service?.shortDescription ?? "";
  const price = service?.priceFrom ? `From ${formatPrice(service.priceFrom)}` : "";

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
        <p
          style={{
            fontSize: 20,
            color: "#C8A45D",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Makeup Service
        </p>
        <h1
          style={{
            fontSize: 64,
            color: "#241A17",
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          {name}
        </h1>
        {description && (
          <p
            style={{
              fontSize: 24,
              color: "#6F5A50",
              marginTop: 20,
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginTop: 40,
          }}
        >
          {price && (
            <span
              style={{
                fontSize: 28,
                color: "#B76E79",
                fontWeight: 700,
              }}
            >
              {price}
            </span>
          )}
          <div
            style={{
              padding: "10px 28px",
              background: "#B76E79",
              color: "white",
              borderRadius: 999,
              fontSize: 18,
            }}
          >
            Book Now
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
