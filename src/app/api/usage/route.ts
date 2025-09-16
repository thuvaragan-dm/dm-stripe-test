import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { getOrCreateHardcodedUser } from '@/lib/user'

function deductTokens(currentSub: number, currentPurchased: number, amount: number) {
  const fromSub = Math.min(currentSub, amount)
  const remaining = amount - fromSub
  const fromPurchased = Math.min(currentPurchased, remaining)
  if (fromSub + fromPurchased < amount) {
    throw new Error('Insufficient tokens')
  }
  return {
    subscriptionTokens: currentSub - fromSub,
    purchasedTokens: currentPurchased - fromPurchased,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const amount = parseInt(body?.amount, 10)
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const user = await getOrCreateHardcodedUser()
    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const fresh = await tx.user.findUnique({ where: { id: user.id } })
      if (!fresh) throw new Error('User not found')
      const result = deductTokens(fresh.subscriptionTokens, fresh.purchasedTokens, amount)
      return tx.user.update({
        where: { id: user.id },
        data: result,
      })
    })

    return NextResponse.json({
      subscriptionTokens: updated.subscriptionTokens,
      purchasedTokens: updated.purchasedTokens,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error'
    const status = message === 'Insufficient tokens' ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}


