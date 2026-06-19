# Temilola Makeup — Premium Website

A high-converting, mobile-first website for a professional makeup artist in Lagos, Nigeria. Built with Next.js, Tailwind CSS, and Framer Motion.

## Features

- **Conversion-focused**: WhatsApp CTAs, booking form, check availability flows
- **8 pages**: Home, Services, Portfolio, Pricing, About, Book, Blog, Privacy Policy
- **Premium design**: Soft glam palette, editorial layouts, scroll animations
- **SEO-ready**: Metadata, JSON-LD, sitemap, robots.txt, Open Graph image
- **Analytics-ready**: Google Analytics & Meta Pixel via env vars

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Customize Your Site

### 1. Business details (one file)

Edit [`lib/site-config.ts`](lib/site-config.ts) (`brandName`, `artistName`, `whatsappNumber`, etc.):

Or import everything from [`lib/data/index.ts`](lib/data/index.ts) when wiring a CMS.

- Phone & WhatsApp number
- Email, Instagram, TikTok
- Service area
- Site URL

### 2. Pricing & services

- [`data/packages.ts`](data/packages.ts) — package prices and features
- [`data/services.ts`](data/services.ts) — service descriptions

### 3. Portfolio images

Replace Unsplash URLs in [`data/portfolio.ts`](data/portfolio.ts) with your own images in `/public/images/`.

### 4. Testimonials & FAQ

- [`data/testimonials.ts`](data/testimonials.ts)
- [`data/faq.ts`](data/faq.ts)

### 5. Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

## Deploy to Vercel

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables from `.env.example`
4. Deploy

## Booking Form

Submissions POST to `/api/booking`. By default, requests are logged server-side.

To forward submissions to a webhook (Zapier, Make, etc.), set:

```
BOOKING_WEBHOOK_URL=https://hooks.zapier.com/...
```

WhatsApp remains the primary fast-booking channel.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- Framer Motion
- React Hook Form + Zod
- TypeScript
- yet-another-react-lightbox
- CMS-ready local data (`lib/data/`)

## License

Private — Temilola Makeup.
