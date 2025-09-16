import { NextResponse } from 'next/server'
import { getOrCreateHardcodedUser } from '@/lib/user'

export async function GET() {
  const user = await getOrCreateHardcodedUser()
  return NextResponse.json({
    name: user.name,
    email: user.email,
    subscriptionTokens: user.subscriptionTokens,
    purchasedTokens: user.purchasedTokens,
    plan: user.plan,
  })
}


