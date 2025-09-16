## Project Brief

This POC implements a SaaS subscription with usage-based billing via tokens using Next.js (App Router), Prisma (SQLite), and Stripe. Users receive plan tokens per billing cycle and can purchase top-up tokens. Subscription tokens reset each cycle; purchased tokens roll over. Usage deducts from subscription tokens first, then purchased tokens.

Core features:
- Plans: Pro, Ultra, Team with configurable pricing and tokens.
- Stripe Checkout for subscriptions and one-time token top-ups.
- Stripe Webhooks to sync subscriptions and token balances.
- Dashboard to view balances and simulate token usage.

Assumptions:
- A single hardcoded user is considered logged in for the POC.
- Placeholder Stripe Price IDs are used and must be replaced in deployment.


