import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { findPlanByPriceId } from '@/config/plans'
import type Stripe from 'stripe'

export const config = {
  api: { bodyParser: false },
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  const rawBody = await req.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown webhook error'
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string | undefined
        const mode = session.mode as 'subscription' | 'payment'
        const userId = session.metadata?.userId as string | undefined
        if (!userId) break

        if (mode === 'subscription') {
          const subscriptionId = session.subscription as string
          // Try to determine the priceId for the subscribed plan from line items first,
          // then fall back to the subscription object if needed.
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 })
          let priceId = lineItems.data[0]?.price?.id || undefined
          if (!priceId) {
            const sub = await stripe.subscriptions.retrieve(subscriptionId)
            priceId = sub.items.data[0]?.price?.id || undefined
          }
          const planEntry = priceId ? findPlanByPriceId(priceId) : undefined
          const tokens = planEntry ? planEntry[1].tokensPerCycle : 0
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: customerId || undefined,
              stripeSubscriptionId: subscriptionId,
              plan: planEntry ? planEntry[0] : null,
              subscriptionTokens: tokens,
            },
          })
        } else if (mode === 'payment') {
          // Dynamic token top-up based on metadata.topUpTokens
          const increment = Number(session.metadata?.topUpTokens || 0)
          if (Number.isFinite(increment) && increment > 0) {
            await prisma.user.update({
              where: { id: userId },
              data: { purchasedTokens: { increment } },
            })
          }
        }
        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string | undefined
        if (!subscriptionId) break
        // Find user by subscription
        const user = await prisma.user.findFirst({ where: { stripeSubscriptionId: subscriptionId } })
        if (!user) break

        // Determine tokens for plan key
        const planKey = user.plan as string | null
        let tokens = 0
        if (planKey) {
          const priced = await stripe.subscriptions.retrieve(subscriptionId)
          const priceId = priced.items?.data?.[0]?.price?.id || undefined
          const planEntry = priceId ? findPlanByPriceId(priceId) : undefined
          tokens = planEntry ? planEntry[1].tokensPerCycle : 0
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionTokens: tokens },
        })
        break
      }
      default:
        break
    }
  } catch (err) {
    console.error('Webhook handler error', err)
    return NextResponse.json({ received: true, warning: 'handler error' })
  }

  return NextResponse.json({ received: true })
}


