import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getOrCreateHardcodedUser } from '@/lib/user'

export async function POST(req: NextRequest) {
  try {
    const { priceId, mode, topUpTokens } = await req.json()
    if (!mode || !['subscription', 'payment'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const user = await getOrCreateHardcodedUser()

    let stripeCustomerId = user.stripeCustomerId
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      })
      stripeCustomerId = customer.id
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    let session
    if (mode === 'subscription') {
      if (!priceId) return NextResponse.json({ error: 'Missing priceId' }, { status: 400 })
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: stripeCustomerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/dashboard?success=1`,
        cancel_url: `${baseUrl}/dashboard?canceled=1`,
        metadata: { userId: user.id },
      })
    } else {
      // Dynamic top-up using price_data; 1 token = $0.01 = 1 cent
      const tokens = Number(topUpTokens)
      if (!Number.isFinite(tokens) || tokens <= 0) {
        return NextResponse.json({ error: 'Invalid topUpTokens' }, { status: 400 })
      }
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer: stripeCustomerId,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: 'Token Top-up' },
              unit_amount: 1, // 1 cent per token
            },
            quantity: tokens,
          },
        ],
        success_url: `${baseUrl}/dashboard?success=1`,
        cancel_url: `${baseUrl}/dashboard?canceled=1`,
        metadata: { userId: user.id, topUpTokens: String(tokens) },
      })
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error'
    console.error(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


