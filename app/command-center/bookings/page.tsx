import { client } from "@/sanity/client";
import { MetricBadge } from "@/components/command-center/MetricBadge";

interface BookingRow {
  _id: string;
  clientName?: string;
  eventDate?: string;
  eventLocation?: string;
  service?: string;
  status?: string;
}

const BOOKINGS_QUERY = `*[_type == "booking"] | order(submittedAt desc)[0...20]{
  _id, clientName, eventDate, eventLocation, service, status
}`;

export default async function BookingsPage() {
  const [total, pending, confirmed, paid, cancelled, recent] = await Promise.all([
    client.fetch<number>(`count(*[_type == "booking"])`),
    client.fetch<number>(`count(*[_type == "booking" && status == "pending"])`),
    client.fetch<number>(`count(*[_type == "booking" && status == "confirmed"])`),
    client.fetch<number>(`count(*[_type == "booking" && status == "paid"])`),
    client.fetch<number>(`count(*[_type == "booking" && status == "cancelled"])`),
    client.fetch<BookingRow[]>(BOOKINGS_QUERY),
  ]);

  return (
    <div>
      <h1 className="cc-page-title">Bookings &amp; Revenue</h1>
      <p className="cc-page-dek">
        Bookings are live from Sanity today. Revenue, average booking value, and the conversion funnel arrive
        in Phase 3, once <code>booking.amountPaid</code> is reconciled against Paystack.
      </p>

      <div className="cc-tiles">
        <div className="cc-tile">
          <div className="cc-tile__label">Total bookings</div>
          <div className="cc-tile__value">{total}</div>
          <MetricBadge source="sanity" freshness="live" />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Pending</div>
          <div className="cc-tile__value">{pending}</div>
          <MetricBadge source="sanity" freshness="live" />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Confirmed / Paid</div>
          <div className="cc-tile__value">{confirmed + paid}</div>
          <MetricBadge source="sanity" freshness="live" />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Cancelled</div>
          <div className="cc-tile__value">{cancelled}</div>
          <MetricBadge source="sanity" freshness="live" />
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Recent bookings</h2>
        {recent.length === 0 && <div className="cc-empty">No bookings recorded yet.</div>}
        {recent.map((b) => (
          <div key={b._id} className="cc-pending-row" style={{ color: "var(--cc-text)" }}>
            <span>{b.clientName ?? "Unknown"} — {b.service ?? "—"}</span>
            <span style={{ color: "var(--cc-text-muted)" }}>
              {b.eventDate ?? "—"} · {b.eventLocation ?? "—"} · {b.status ?? "—"}
            </span>
          </div>
        ))}
      </div>

      <div className="cc-empty">
        Revenue, average booking value, the conversion funnel, most-booked services/locations, and the
        booking calendar arrive in Phase 3.
      </div>
    </div>
  );
}
