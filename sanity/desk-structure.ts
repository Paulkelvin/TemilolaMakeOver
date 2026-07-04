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

      // ── Page Copy (one doc per page) ──
      S.listItem()
        .title("Page Copy")
        .id("pageCopy")
        .child(
          S.list()
            .title("Page Copy")
            .items([
              { id: "pageCopy-home", title: "Home" },
              { id: "pageCopy-about", title: "About" },
              { id: "pageCopy-services", title: "Services" },
              { id: "pageCopy-portfolio", title: "Portfolio" },
              { id: "pageCopy-pricing", title: "Pricing" },
              { id: "pageCopy-book", title: "Book" },
              { id: "pageCopy-transformations", title: "Transformations" },
            ].map(({ id, title }) =>
              S.listItem()
                .title(title)
                .id(id)
                .child(
                  S.document()
                    .schemaType("pageCopy")
                    .documentId(id)
                    .title(title)
                )
            ))
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
              S.documentTypeListItem("aboutValue").title("About — Philosophy Cards"),
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
              S.documentTypeListItem("travelZone").title("Travel Zones & Fees"),
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

      S.divider(),

      // ── Shop & Links ──
      S.listItem()
        .title("Shop & Links")
        .child(
          S.list()
            .title("Shop & Links")
            .items([
              S.listItem()
                .title("Page Settings")
                .id("shopPageSettings")
                .child(
                  S.document()
                    .schemaType("shopPageSettings")
                    .documentId("shopPageSettings")
                    .title("Shop Page Settings")
                ),
              S.documentTypeListItem("shopLink").title("Shop Links"),
            ])
        ),
    ]);
