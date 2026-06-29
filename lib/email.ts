import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface BookingEmailData {
  name: string;
  phone: string;
  email?: string;
  service: string;
  eventType: string;
  eventDate: string;
  location: string;
  faces: string;
  preferredTime?: string;
  message?: string;
}

export async function sendBookingNotification(data: BookingEmailData) {
  const gmailUser = process.env.GMAIL_USER;
  if (!gmailUser || !process.env.GMAIL_APP_PASSWORD) return;

  const subject = `New Booking Request — ${data.name} | ${data.service}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #c0687b; margin-bottom: 4px;">New Booking Request</h2>
      <p style="color: #666; font-size: 13px; margin-top: 0;">Received at ${new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666; width: 140px;">Name</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">${data.name}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Phone</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.phone}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Email</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.email || "—"}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Service</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.service}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Event Type</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.eventType}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Event Date</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.eventDate}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Location</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.location}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Faces</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.faces}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Preferred Time</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.preferredTime || "—"}</td></tr>
        ${data.message ? `<tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Message</td><td style="padding: 8px 0;">${data.message.replace(/\n/g, "<br>")}</td></tr>` : ""}
      </table>

      <div style="margin-top: 24px; padding: 16px; background: #fdf5f6; border-radius: 8px;">
        <p style="margin: 0; font-size: 13px; color: #666;">Reply directly to this client via phone or WhatsApp to confirm availability.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Gleam by Temi" <${gmailUser}>`,
    to: gmailUser,
    subject,
    html,
    replyTo: data.email || undefined,
  });
}

interface PaymentConfirmationData {
  name: string;
  email: string;
  service: string;
  eventDate: string;
  amountPaid: number;
  currency: string;
  reference: string;
}

export async function sendPaymentConfirmation(data: PaymentConfirmationData) {
  const gmailUser = process.env.GMAIL_USER;
  if (!gmailUser || !process.env.GMAIL_APP_PASSWORD) return;

  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: data.currency === "NGN" ? "NGN" : "USD",
    minimumFractionDigits: 0,
  }).format(data.amountPaid);

  const clientHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #c0687b;">Deposit Received — You're Booked!</h2>
      <p>Hi ${data.name}, your deposit payment of <strong>${formattedAmount}</strong> for <strong>${data.service}</strong> on <strong>${data.eventDate}</strong> has been confirmed.</p>
      <p>Your date is now secured. I'll be in touch with final preparation details closer to your event.</p>

      <div style="margin: 24px 0; padding: 20px; background: #fdf5f6; border-radius: 8px;">
        <h3 style="margin-top: 0; font-size: 15px; color: #c0687b;">Payment Receipt</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #666; width: 140px;">Reference</td><td style="padding: 6px 0; font-family: monospace; font-size: 12px;">${data.reference}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Amount Paid</td><td style="padding: 6px 0; font-weight: 600;">${formattedAmount}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Service</td><td style="padding: 6px 0;">${data.service}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Event Date</td><td style="padding: 6px 0;">${data.eventDate}</td></tr>
        </table>
      </div>

      <p style="font-size: 14px; color: #666;">
        Questions? Reach me on <a href="https://wa.me/2347058596531" style="color: #c0687b;">WhatsApp</a> anytime.
      </p>

      <p style="font-size: 13px; color: #999; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
        Gleam by Temi — Lagos, Nigeria<br>
        <a href="https://www.instagram.com/gleambytemi/" style="color: #c0687b;">@gleambytemi</a>
      </p>
    </div>
  `;

  const ownerHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #c0687b; margin-bottom: 4px;">Deposit Payment Confirmed</h2>
      <p style="color: #666; font-size: 13px; margin-top: 0;">Paid at ${new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666; width: 140px;">Client</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600;">${data.name}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Email</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.email}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Service</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.service}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Event Date</td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.eventDate}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Amount</td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: 600; color: #c0687b;">${formattedAmount}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Reference</td><td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${data.reference}</td></tr>
      </table>
    </div>
  `;

  await Promise.allSettled([
    transporter.sendMail({
      from: `"Gleam by Temi" <${gmailUser}>`,
      to: data.email,
      subject: `Deposit Confirmed — ${data.service} on ${data.eventDate}`,
      html: clientHtml,
    }),
    transporter.sendMail({
      from: `"Gleam by Temi" <${gmailUser}>`,
      to: gmailUser,
      subject: `💳 Deposit Received — ${data.name} | ${data.service}`,
      html: ownerHtml,
    }),
  ]);
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  if (!data.email || !process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #c0687b;">Thank You, ${data.name}!</h2>
      <p>Your booking request for <strong>${data.service}</strong> on <strong>${data.eventDate}</strong> has been received.</p>
      <p>I'll review your details and get back to you within 24 hours to confirm availability and next steps.</p>

      <div style="margin: 24px 0; padding: 20px; background: #fdf5f6; border-radius: 8px;">
        <h3 style="margin-top: 0; font-size: 15px; color: #c0687b;">Your Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #666; width: 120px;">Service</td><td style="padding: 6px 0; font-weight: 600;">${data.service}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Event Date</td><td style="padding: 6px 0;">${data.eventDate}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Location</td><td style="padding: 6px 0;">${data.location}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Faces</td><td style="padding: 6px 0;">${data.faces}</td></tr>
        </table>
      </div>

      <p style="font-size: 14px; color: #666;">
        For a faster response, you can also reach me on
        <a href="https://wa.me/2347058596531" style="color: #c0687b;">WhatsApp</a>.
        A 50% deposit is required to secure your date once we confirm availability.
      </p>

      <p style="font-size: 13px; color: #999; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
        Gleam by Temi — Lagos, Nigeria<br>
        <a href="https://www.instagram.com/gleambytemi/" style="color: #c0687b;">@gleambytemi</a>
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Gleam by Temi" <${process.env.GMAIL_USER}>`,
    to: data.email,
    subject: `Booking Request Received — ${data.service} on ${data.eventDate}`,
    html,
  });
}
