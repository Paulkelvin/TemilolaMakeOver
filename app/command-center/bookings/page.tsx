import { client } from "@/sanity/client";
import {
  getBookingFunnel,
  getRevenueSummary,
  getMostBookedServices,
  getMostBookedLocations,
  getAverageLeadTime,
  getUpcomingBookings,
} from "@/lib/intelligence/sources/sanity";
import { MetricBadge } from "@/components/command-center/MetricBadge";
import { formatPrice } from "@/lib/utils";

export default async function BookingsPage() {
  const [funnel, revenue, topServices, topLocations, leadTime, upcoming] = await Promise.all([
    getBookingFunnel(client),
    getRevenueSummary(client),
    getMostBookedServices(client),
    getMostBookedLocations(client),
    getAverageLeadTime(client),
    getUpcomingBookings(client),
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
