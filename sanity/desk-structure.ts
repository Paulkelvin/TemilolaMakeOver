import type { StructureBuilder } from "sanity/structure";

export const deskStructure = (S: StructureBuilder) =>
  S.list()
    .title("Content")
    .items([
      // ── Site Settings (singleton) ──
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Site Settings")
        ),

      // ── Page Copy (singleton) ──
      S.listItem()
        .title("Page Copy")
        .id("pageCopy")
        .child(
          S.document()
            .schemaType("pageCopy")
            .documentId("pageCopy")
            .title("Page Copy")
        ),

      S.divider(),

      // ── Services & Pricing ──
      S.listItem()
        .title("Services & Pricing")
        .child(
          S.list()
            .title("Services & Pricing")
            .items([
              S.documentTypeListItem("service").title("Services"),
              S.documentTypeListItem("pricingPackage").title("Pricing Packages"),
              S.documentTypeListItem("trainingCourse").title("Training Courses"),
            ])
        ),

      // ── Portfolio & Transformations ──
      S.listItem()
        .title("Portfolio & Looks")
        .child(
          S.list()
            .title("Portfolio & Looks")
            .items([
              S.documentTypeListItem("portfolioItem").title("Portfolio Gallery"),
              S.documentTypeListItem("transformation").title("Before & After"),
            ])
        ),

      // ── Client Feedback ──
      S.listItem()
        .title("Client Feedback")
        .child(
          S.list()
            .title("Client Feedback")
            .items([
              S.documentTypeListItem("testimonial").title("Testimonials"),
              S.documentTypeListItem("whyChooseUs").title("Why Gleam by Temi"),
            ])
        ),

      // ── Bookings & Calendar ──
      S.listItem()
        .title("Bookings & Calendar")
        .child(
          S.list()
            .title("Bookings & Calendar")
            .items([
              S.documentTypeListItem("booking").title("Bookings"),
              S.documentTypeListItem("blockedDate").title("Blocked Dates"),
            ])
        ),

      // ── Content ──
      S.listItem()
        .title("Blog & Pages")
        .child(
          S.list()
            .title("Blog & Pages")
            .items([
              S.documentTypeListItem("blogPost").title("Blog Posts"),
              S.documentTypeListItem("faq").title("FAQs"),
              S.documentTypeListItem("bookingStep").title("Booking Steps"),
            ])
        ),
    ]);
