import { client } from "@/sanity/client";
import {
  getBookingFunnel,
  getRevenueSummary,
  getMostBookedServices,
  getMostBookedLocations,
  getAverageLeadTime,
  getUpcomingBookings,
} from "@/lib/intelligence/sources/sanity";
import { isAnalyticsConfigured, getBookingFunnelEvents } from "@/lib/intelligence/sources/analytics";
import { MetricBadge } from "@/components/command-center/MetricBadge";
import { formatPrice } from "@/lib/utils";

function dropOffRow(label: string, count: number, priorCount: number | null) {
  const pct = priorCount && priorCount > 0 ? Math.round((count / priorCount) * 100) : null;
  return (
    <div className="cc-pending-row">
      <span style={{ color: "var(--cc-text)" }}>{label}</span>
      <span>{count}{pct !== null ? ` (${pct}% of previous step)` : ""}</span>
    </div>
  );
}

export default async function BookingsPage() {
  const analyticsOk = isAnalyticsConfigured();
  const [funnel, revenue, topServices, topLocations, leadTime, upcoming, trafficFunnel] = await Promise.all([
    getBookingFunnel(client),
    getRevenueSummary(client),
    getMostBookedServices(client),
    getMostBookedLocations(client),
    getAverageLeadTime(client),
    getUpcomingBookings(client),
    analyticsOk ? getBookingFunnelEvents() : Promise.resolve(null),
  ]);

  return (
    <div>
      <h1 className="cc-page-title">Bookings &amp; Revenue</h1>
      <p className="cc-page-dek">
        Revenue reads only <code>booking.amountPaid</code>, set by the Paystack webhook when a deposit clears
        — never inferred from a service&rsquo;s price list.
      </p>

      <div className="cc-tiles">
        <div className="cc-tile">
          <div className="cc-tile__label">Revenue (paid deposits)</div>
          <div className="cc-tile__value">{formatPrice(revenue.totalRevenue)}</div>
          <MetricBadge source="paystack" freshness="live" />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Average booking value</div>
          <div className="cc-tile__value">{revenue.averageBookingValue !== null ? formatPrice(revenue.averageBookingValue) : "—"}</div>
          <MetricBadge source="paystack" freshness="live" />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Conversion rate</div>
          <div className="cc-tile__value">{Math.round(funnel.conversionRate * 100)}%</div>
          <MetricBadge source="sanity" freshness="live" />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Cancellation rate</div>
          <div className="cc-tile__value">{Math.round(funnel.cancellationRate * 100)}%</div>
          <MetricBadge source="sanity" freshness="live" />
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Traffic funnel</h2>
        <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
          Visitors who never became a booking — the drop-off the funnel below can&rsquo;t see.
        </p>
        {trafficFunnel ? (
          <>
            {dropOffRow("Viewed /book", trafficFunnel.pageViews, null)}
            {dropOffRow("Started the form", trafficFunnel.formStarts, trafficFunnel.pageViews)}
            {dropOffRow("Reached step 2", trafficFunnel.step2Reached, trafficFunnel.formStarts)}
            {dropOffRow("Submitted", trafficFunnel.submitted, trafficFunnel.step2Reached)}
            {dropOffRow("Sent via WhatsApp instead", trafficFunnel.whatsappSent, trafficFunnel.step2Reached)}
            <div style={{ marginTop: 8 }}>
              <MetricBadge source="ga4" freshness={trafficFunnel.fetchedAt} />
            </div>
          </>
        ) : (
          <div className="cc-empty">Connect Google Analytics (GA4) on the Website page to see this.</div>
        )}
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Booking funnel</h2>
        <div className="cc-pending-row"><span style={{ color: "var(--cc-text)" }}>Total</span><span>{funnel.total}</span></div>
        <div className="cc-pending-row"><span style={{ color: "var(--cc-text)" }}>Pending</span><span>{funnel.pending}</span></div>
        <div className="cc-pending-row"><span style={{ color: "var(--cc-text)" }}>Confirmed</span><span>{funnel.confirmed}</span></div>
        <div className="cc-pending-row"><span style={{ color: "var(--cc-text)" }}>Paid</span><span>{funnel.paid}</span></div>
        <div className="cc-pending-row"><span style={{ color: "var(--cc-text)" }}>Cancelled</span><span>{funnel.cancelled}</span></div>
        <div className="cc-pending-row">
          <span style={{ color: "var(--cc-text)" }}>Average lead time</span>
          <span>{leadTime.averageDays !== null ? `${leadTime.averageDays} days (n=${leadTime.sampleSize})` : "—"}</span>
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Most booked</h2>
        <h3 style={{ margin: "0 0 8px", fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>Services</h3>
        {topServices.length === 0 && <div className="cc-empty">No bookings recorded yet.</div>}
        {topServices.map((s) => (
          <div key={s.label} className="cc-pending-row"><span style={{ color: "var(--cc-text)" }}>{s.label}</span><span>{s.count}</span></div>
        ))}
        <h3 style={{ margin: "16px 0 8px", fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>Locations</h3>
        {topLocations.length === 0 && <div className="cc-empty">No bookings recorded yet.</div>}
        {topLocations.map((l) => (
          <div key={l.label} className="cc-pending-row"><span style={{ color: "var(--cc-text)" }}>{l.label}</span><span>{l.count}</span></div>
        ))}
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Upcoming bookings</h2>
        {upcoming.length === 0 && <div className="cc-empty">Nothing on the calendar yet.</div>}
        {upcoming.map((b) => (
          <div key={b.id} className="cc-pending-row" style={{ color: "var(--cc-text)" }}>
            <span>{b.eventDate} — {b.clientName} ({b.service})</span>
            <span style={{ color: "var(--cc-text-muted)" }}>{b.eventLocation} · {b.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
