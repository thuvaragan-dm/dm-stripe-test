This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## POC: SaaS with Stripe + Prisma Tokens

This POC demonstrates a subscription SaaS with token-based usage.

Features:
- Plans (Pro, Ultra, Team) with tokens per cycle
- Stripe Checkout for subscriptions and one-time token top-ups
- Stripe Webhooks to sync plan, tokens, and renewals
- Dashboard to view balances and simulate usage

### Setup

1) Install deps
```bash
npm install
```

2) Environment variables: create `.env`
```bash
DATABASE_URL="file:./dev.db"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

3) Prisma: generate and migrate
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4) Replace Stripe Price IDs in `config/plans.ts` with your own ids

5) Run the app
```bash
npm run dev
```

6) Run Stripe CLI for webhooks
```bash
stripe listen --forward-to localhost:3000/api/webhook
```

### Hardcoded User

The app uses a hardcoded user for the POC. APIs will create it automatically on first use.

### Flows

- Subscribe: from `/` pricing page → Stripe Checkout → on success, webhook sets `plan`, `subscriptionTokens`.
- Top-up: from `/` or `/dashboard` → Stripe Checkout (payment) → webhook increments `purchasedTokens`.
- Usage: `/dashboard` → enter tokens and deduct. Deducts from subscription first, then purchased.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
