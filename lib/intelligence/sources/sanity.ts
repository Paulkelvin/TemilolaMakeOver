import type { FetchClient } from "../content";

/**
 * Booking, revenue, and customer aggregates read straight from Sanity's
 * `booking` documents. Revenue-bearing numbers only ever read
 * `booking.amountPaid` (populated by the Paystack webhook) — never a
 * service's price list, so a figure here can't silently drift from what
 * Paystack actually settled.
 */

export interface BookingFunnel {
  total: number;
  pending: number;
  confirmed: number;
  paid: number;
  cancelled: number;
  conversionRate: number;
  cancellationRate: number;
}

export async function getBookingFunnel(client: FetchClient): Promise<BookingFunnel> {
  const [total, pending, confirmed, paid, cancelled] = await Promise.all([
    client.fetch<number>(`count(*[_type == "booking"])`),
    client.fetch<number>(`count(*[_type == "booking" && status == "pending"])`),
    client.fetch<number>(`count(*[_type == "booking" && status == "confirmed"])`),
    client.fetch<number>(`count(*[_type == "booking" && status == "paid"])`),
    client.fetch<number>(`count(*[_type == "booking" && status == "cancelled"])`),
  ]);
  return {
    total,
    pending,
    confirmed,
    paid,
    cancelled,
    conversionRate: total > 0 ? (confirmed + paid) / total : 0,
    cancellationRate: total > 0 ? cancelled / total : 0,
  };
}

export interface RevenueSummary {
  totalRevenue: number;
  paidCount: number;
  averageBookingValue: number | null;
}

export async function getRevenueSummary(client: FetchClient): Promise<RevenueSummary> {
  const paidBookings = await client.fetch<{ amountPaid?: number }[]>(
    `*[_type == "booking" && status == "paid" && defined(amountPaid)]{ amountPaid }`
  );
  const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.amountPaid ?? 0), 0);
  const paidCount = paidBookings.length;
  return { totalRevenue, paidCount, averageBookingValue: paidCount > 0 ? Math.round(totalRevenue / paidCount) : null };
}

export interface RankedCount {
  label: string;
  count: number;
}

function rankByLabel(labels: string[], limit: number): RankedCount[] {
  const counts = new Map<string, number>();
  for (const label of labels) counts.set(label, (counts.get(label) ?? 0) + 1);
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getMostBookedServices(client: FetchClient, limit = 5): Promise<RankedCount[]> {
  const rows = await client.fetch<{ service?: string }[]>(`*[_type == "booking" && defined(service)]{ service }`);
  return rankByLabel(rows.map((r) => r.service!), limit);
}

export async function getMostBookedLocations(client: FetchClient, limit = 5): Promise<RankedCount[]> {
  const rows = await client.fetch<{ eventLocation?: string }[]>(
    `*[_type == "booking" && defined(eventLocation)]{ eventLocation }`
  );
  return rankByLabel(rows.map((r) => r.eventLocation!), limit);
}

export interface LeadTimeSummary {
  averageDays: number | null;
  sampleSize: number;
}

export async function getAverageLeadTime(client: FetchClient): Promise<LeadTimeSummary> {
  const rows = await client.fetch<{ submittedAt?: string; eventDate?: string }[]>(
    `*[_type == "booking" && defined(submittedAt) && defined(eventDate)]{ submittedAt, eventDate }`
  );
  const days = rows
    .map((r) => {
      const submitted = new Date(r.submittedAt!).getTime();
      const event = new Date(r.eventDate!).getTime();
      if (Number.isNaN(submitted) || Number.isNaN(event)) return null;
      return Math.round((event - submitted) / 86_400_000);
    })
    .filter((d): d is number => d !== null && d >= 0);

  if (days.length === 0) return { averageDays: null, sampleSize: 0 };
  return { averageDays: Math.round(days.reduce((a, b) => a + b, 0) / days.length), sampleSize: days.length };
}

export interface UpcomingBooking {
  id: string;
  clientName: string;
  service: string;
  eventDate: string;
  eventLocation: string;
  status: string;
}

export async function getUpcomingBookings(client: FetchClient, limit = 10): Promise<UpcomingBooking[]> {
  const today = new Date().toISOString().slice(0, 10);
  return client.fetch<UpcomingBooking[]>(
    `*[_type == "booking" && defined(eventDate) && eventDate >= $today && status != "cancelled"] | order(eventDate asc)[0...${limit}]{
      "id": _id, "clientName": coalesce(clientName, "Unknown"), "service": coalesce(service, "—"),
      eventDate, "eventLocation": coalesce(eventLocation, "—"), status
    }`,
    { today }
  );
}

// ─── Customers ───────────────────────────────────────────────────────────────

export interface CustomerSummary {
  uniqueCustomers: number;
  returningCustomers: number;
  averageSpend: number | null;
  topLocations: RankedCount[];
  topServices: RankedCount[];
}

export async function getCustomerSummary(client: FetchClient): Promise<CustomerSummary> {
  const bookings = await client.fetch<{ email?: string; phone?: string; amountPaid?: number; eventLocation?: string; service?: string }[]>(
    `*[_type == "booking" && status in ["confirmed", "paid"]]{ email, phone, amountPaid, eventLocation, service }`
  );

  const perCustomer = new Map<string, { count: number; spend: number }>();
  for (const b of bookings) {
    const identity = b.email?.trim().toLowerCase() || b.phone?.trim();
    if (!identity) continue;
    const existing = perCustomer.get(identity) ?? { count: 0, spend: 0 };
    existing.count += 1;
    existing.spend += b.amountPaid ?? 0;
    perCustomer.set(identity, existing);
  }

  const uniqueCustomers = perCustomer.size;
  const returningCustomers = [...perCustomer.values()].filter((c) => c.count > 1).length;
  const totalSpend = [...perCustomer.values()].reduce((sum, c) => sum + c.spend, 0);
  const spendingCustomers = [...perCustomer.values()].filter((c) => c.spend > 0).length;

  return {
    uniqueCustomers,
    returningCustomers,
    averageSpend: spendingCustomers > 0 ? Math.round(totalSpend / spendingCustomers) : null,
    topLocations: rankByLabel(bookings.map((b) => b.eventLocation).filter((v): v is string => Boolean(v)), 5),
    topServices: rankByLabel(bookings.map((b) => b.service).filter((v): v is string => Boolean(v)), 5),
  };
}

export interface ReviewTrend {
  total: number;
  recent90Days: number;
}

export async function getReviewTrend(client: FetchClient): Promise<ReviewTrend> {
  const cutoff = new Date(Date.now() - 90 * 86_400_000).toISOString();
  const [total, recent90Days] = await Promise.all([
    client.fetch<number>(`count(*[_type == "testimonial" && audienceType != "student"])`),
    client.fetch<number>(`count(*[_type == "testimonial" && audienceType != "student" && _createdAt >= $cutoff])`, { cutoff }),
  ]);
  return { total, recent90Days };
}

export interface StyleOccasionPopularity {
  topStyles: RankedCount[];
  topOccasions: RankedCount[];
}

// Bookings don't carry style/occasion references today (only a free-text
// service + eventType) — so "popular styles/occasions" reads from tagged
// testimonials instead, as the closest real proxy for what customers
// actually booked. Labeled as such wherever it's shown, not passed off as
// a direct booking metric.
export async function getStyleOccasionPopularityFromTestimonials(client: FetchClient): Promise<StyleOccasionPopularity> {
  const [styles, occasions] = await Promise.all([
    client.fetch<{ name?: string }[]>(`*[_type == "testimonial" && defined(style)]{ "name": style->name }`),
    client.fetch<{ name?: string }[]>(`*[_type == "testimonial" && defined(occasion)]{ "name": occasion->name }`),
  ]);
  return {
    topStyles: rankByLabel(styles.map((s) => s.name).filter((v): v is string => Boolean(v)), 5),
    topOccasions: rankByLabel(occasions.map((o) => o.name).filter((v): v is string => Boolean(v)), 5),
  };
}
