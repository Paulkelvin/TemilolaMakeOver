import { client } from "@/sanity/client";
import {
  getCustomerSummary,
  getReviewTrend,
  getStyleOccasionPopularityFromTestimonials,
} from "@/lib/intelligence/sources/sanity";
import { MetricBadge } from "@/components/command-center/MetricBadge";
import { formatPrice } from "@/lib/utils";

export default async function CustomersPage() {
  const [summary, reviews, popularity] = await Promise.all([
    getCustomerSummary(client),
    getReviewTrend(client),
    getStyleOccasionPopularityFromTestimonials(client),
  ]);

  return (
    <div>
      <h1 className="cc-page-title">Customers</h1>
      <p className="cc-page-dek">
        A per-person lens on the same booking data — de-duplicated by email/phone, no separate customer
        records to maintain.
      </p>

      <div className="cc-tiles">
        <div className="cc-tile">
          <div className="cc-tile__label">Unique customers</div>
          <div className="cc-tile__value">{summary.uniqueCustomers}</div>
          <MetricBadge source="sanity" freshness="live" />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Returning</div>
          <div className="cc-tile__value">{summary.returningCustomers}</div>
          <MetricBadge source="sanity" freshness="live" />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Average spend</div>
          <div className="cc-tile__value">{summary.averageSpend !== null ? formatPrice(summary.averageSpend) : "—"}</div>
          <MetricBadge source="paystack" freshness="live" />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Reviews (last 90d)</div>
          <div className="cc-tile__value">
            {reviews.recent90Days}
            <span style={{ fontSize: "0.75rem", color: "var(--cc-text-muted)" }}> / {reviews.total} total</span>
          </div>
          <MetricBadge source="sanity" freshness="live" />
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Popular by booking</h2>
        <h3 style={{ margin: "0 0 8px", fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>Services</h3>
        {summary.topServices.length === 0 && <div className="cc-empty">No confirmed/paid bookings yet.</div>}
        {summary.topServices.map((s) => (
          <div key={s.label} className="cc-pending-row"><span style={{ color: "var(--cc-text)" }}>{s.label}</span><span>{s.count}</span></div>
        ))}
        <h3 style={{ margin: "16px 0 8px", fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>Locations</h3>
        {summary.topLocations.length === 0 && <div className="cc-empty">No confirmed/paid bookings yet.</div>}
        {summary.topLocations.map((l) => (
          <div key={l.label} className="cc-pending-row"><span style={{ color: "var(--cc-text)" }}>{l.label}</span><span>{l.count}</span></div>
        ))}
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 6px", fontSize: "1.0625rem" }}>Popular by style &amp; occasion</h2>
        <p style={{ fontSize: "0.8125rem", color: "var(--cc-text-muted)", margin: "0 0 12px" }}>
          Bookings don&rsquo;t capture style/occasion directly — this reads tagged testimonials as the closest
          real proxy for what customers actually booked.
        </p>
        <h3 style={{ margin: "0 0 8px", fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>Styles</h3>
        {popularity.topStyles.length === 0 && <div className="cc-empty">No tagged testimonials yet.</div>}
        {popularity.topStyles.map((s) => (
          <div key={s.label} className="cc-pending-row"><span style={{ color: "var(--cc-text)" }}>{s.label}</span><span>{s.count}</span></div>
        ))}
        <h3 style={{ margin: "16px 0 8px", fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>Occasions</h3>
        {popularity.topOccasions.length === 0 && <div className="cc-empty">No tagged testimonials yet.</div>}
        {popularity.topOccasions.map((o) => (
          <div key={o.label} className="cc-pending-row"><span style={{ color: "var(--cc-text)" }}>{o.label}</span><span>{o.count}</span></div>
        ))}
      </div>
    </div>
  );
}
