export interface Testimonial {
  id: string;
  name: string;
  event: string;
  text: string;
  rating: number;
  initials: string;
  avatarUrl?: string;
  audienceType?: "client" | "student";
  service?: string;
  style?: string;
  occasion?: string;
  weddingType?: string;
  location?: string;
  artist?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Adaeze O.",
    event: "Wedding Day Bride",
    text: "I was nervous about looking too 'done' but Temilola got it exactly right. My makeup still looked fresh at the reception — and I cried twice before then. She was so calm on the morning, which helped more than I expected.",
    rating: 5,
    initials: "AO",
  },
  {
    id: "2",
    name: "Funmi K.",
    event: "30th Birthday",
    text: "Booked soft glam for my birthday dinner and sent a Pinterest board. She matched the vibe without making it look copied. My friends kept asking for her number — already trying to book her for my sister's engagement.",
    rating: 5,
    initials: "FK",
  },
  {
    id: "3",
    name: "Chioma M.",
    event: "Traditional Wedding",
    text: "The gele and makeup worked together perfectly — I didn't have to worry about either. She arrived early, was organised, and checked everything in natural light before I left. Worth every naira.",
    rating: 5,
    initials: "CM",
  },
  {
    id: "4",
    name: "Tolu A.",
    event: "Bridesmaids (4 faces)",
    text: "Four bridesmaids, different skin tones, one timeline. Everyone looked cohesive but not identical. She kept us on schedule and the bride wasn't stressed — that alone was a gift.",
    rating: 5,
    initials: "TA",
  },
  {
    id: "5",
    name: "Ngozi E.",
    event: "Corporate Event",
    text: "I needed makeup that worked for photos and a long evening. It held up without looking cakey. Quick WhatsApp booking, clear pricing upfront — no awkward surprises.",
    rating: 5,
    initials: "NE",
  },
];
