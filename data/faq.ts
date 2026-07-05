export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: ("general" | "pricing")[];
  service?: string;
  occasion?: string;
  location?: string;
}

export const faqItems: FAQItem[] = [
  {
    id: "1",
    question: "How early should I book my makeup session?",
    answer:
      "For weddings, I recommend booking 3–6 months ahead — popular dates in Lagos fill quickly. Events and birthdays can often be secured 2–4 weeks out, but earlier is always safer. If your date is soon, message me on WhatsApp and I'll check availability honestly.",
    category: ["general"],
  },
  {
    id: "2",
    question: "Is a deposit required to confirm my booking?",
    answer:
      "Yes. A 50% deposit secures your date in my calendar. The balance is due on or before your appointment. You'll receive written confirmation once the deposit is received, along with prep notes for your skin and schedule.",
    category: ["general"],
  },
  {
    id: "3",
    question: "Do you offer home service in Lagos?",
    answer:
      "Yes — I travel across Lagos including Ikeja, Lekki, Victoria Island, and Mainland areas. I bring a full professional kit and set up at your home, hotel, or venue. A travel fee may apply depending on distance and timing.",
    category: ["general"],
  },
  {
    id: "4",
    question: "Can you travel outside Lagos for my event?",
    answer:
      "Outside Lagos may be possible for bridal and larger bookings. Share your location, date, and service needs when you inquire — I'll confirm if I can travel and include any travel costs in your quote.",
    category: ["general"],
  },
  {
    id: "5",
    question: "What is your rescheduling policy?",
    answer:
      "Please notify me at least 7 days before your appointment if your date changes. Rescheduling depends on availability. Late changes may affect deposit terms — I'll always communicate clearly before you commit.",
    category: ["general"],
  },
  {
    id: "6",
    question: "Do you offer bridal makeup trials?",
    answer:
      "Yes, and I recommend them. A trial lets us test your look, adjust for your skin and outfit, and remove guesswork from the wedding morning. Book your trial when you reserve your wedding date.",
    category: ["general"],
  },
  {
    id: "7",
    question: "Can I book makeup for my full bridal party?",
    answer:
      "Absolutely. Share how many faces, the looks you want (matching or individual), and your timeline. I'll plan a schedule that keeps everyone ready before the bride needs to leave.",
    category: ["general"],
  },
  {
    id: "8",
    question: "How long does each makeup session take?",
    answer:
      "Bridal makeup: 2–3 hours. Soft glam and event makeup: 1.5–2 hours. Group bookings are timed per face at roughly 1–1.5 hours each. I'll confirm timing when we book.",
    category: ["general"],
  },
  {
    id: "9",
    question: "Can I send reference photos of a look I want?",
    answer:
      "Please do — via WhatsApp or with your booking form. I'll advise what's achievable for your features, skin, and event lighting. References help us start aligned; your face guides the final result.",
    category: ["general"],
  },
  {
    id: "10",
    question: "How do I confirm payment and final booking?",
    answer:
      "After we agree on your date and quote, you'll receive deposit payment details. Once received, your date is confirmed. I'll follow up with arrival time, prep tips, and anything I need from you before the day.",
    category: ["general"],
  },
  {
    id: "11",
    question: "How much does bridal makeup cost in Lagos?",
    answer:
      "Bridal makeup at Gleam by Temi starts from ₦120,000 for a white wedding look and ₦130,000 for traditional bridal makeup. The final price depends on location, whether you need a trial session, and the number of faces in your bridal party. You'll get a clear quote before committing.",
    category: ["general", "pricing"],
  },
  {
    id: "12",
    question: "How much does a makeup session cost in Lagos?",
    answer:
      "Soft glam starts from ₦35,000, event glam from ₦45,000, and birthday glam from ₦40,000. Bridal starts from ₦120,000. Home service is an additional ₦10,000. Every quote is customised to your needs — message me with your event details for exact pricing.",
    category: ["general"],
  },
  {
    id: "13",
    question: "What is the best makeup artist in Lagos for weddings?",
    answer:
      "The best makeup artist is one who listens, preps your skin properly, and delivers a look that lasts all day. At Gleam by Temi, I specialise in bridal makeup across Lagos — from Ikeja to Lekki to Victoria Island. Check my portfolio to see real bridal looks, then decide if my style matches your vision.",
    category: ["general"],
  },
  {
    id: "15",
    question: "What should I do to prepare my skin before makeup?",
    answer:
      "Drink plenty of water in the days leading up to your appointment. Cleanse and moisturise the night before, but skip heavy skincare products on the morning. Arrive with a clean, bare face — no foundation or sunscreen. I'll handle skin prep from there.",
    category: ["general"],
  },
  {
    id: "16",
    question: "Can I book same-day or last-minute makeup in Lagos?",
    answer:
      "Same-day bookings depend on my schedule. If I have availability, I'll fit you in — message me on WhatsApp and I'll confirm honestly. For the best experience, especially for events and bridal, booking at least 2–4 weeks ahead is ideal.",
    category: ["general"],
  },
  {
    id: "17",
    question: "What areas in Lagos do you cover for home service?",
    answer:
      "I cover Ikeja, Lekki, Victoria Island, Ikoyi, Ajah, Yaba, Surulere, Mainland, and surrounding Lagos areas. For locations outside central Lagos, a travel fee may apply. Share your address when booking and I'll confirm coverage and any additional cost.",
    category: ["general"],
  },
];

export const pricingFaqItems: FAQItem[] = [
  {
    id: "p2",
    question: "What does makeup artist pricing include?",
    answer:
      "Every package includes skin prep, professional-grade product application, lash enhancement, and long-wear setting. Bridal packages also include a consultation and touch-up guidance. The price shown is a starting point — your custom quote covers your specific needs.",
    category: ["pricing"],
  },
  {
    id: "p3",
    question: "Is a bridal trial included in the price?",
    answer:
      "A bridal trial is a separate session and not included in the base bridal price. However, I strongly recommend it — we test your look, adjust for your skin and outfit, and fine-tune everything so your wedding morning is stress-free. Ask about trial pricing when booking.",
    category: ["pricing"],
  },
  {
    id: "p4",
    question: "Do you charge extra for home service?",
    answer:
      "Yes, home service is an add-on starting from ₦10,000 depending on location within Lagos. I bring a full professional kit and set up at your home, hotel, or venue. The fee covers travel and on-location setup.",
    category: ["pricing"],
  },
  {
    id: "p5",
    question: "Can I get a discount for booking multiple faces?",
    answer:
      "Group bookings are priced per face starting from ₦30,000 each, which is already our most competitive rate. For larger bridal parties (5+ faces), message me with the details and I'll work out the best package for your group.",
    category: ["pricing"],
  },
];
