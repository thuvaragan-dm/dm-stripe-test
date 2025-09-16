export type PlanKey = 'pro_monthly' | 'pro_yearly' | 'ultra_monthly' | 'team_monthly' | 'team_yearly'

export const TOKEN_RATE = {
  // 100 tokens for $20 => 5 tokens per USD
  tokensPerUsd: 5,
}

export const TOP_UP = {
  productName: 'Token Top-up 500',
  tokens: 500,
  priceId: 'price_topup_500_placeholder',
}

export const PLANS: Record<PlanKey, {
  label: string
  billingInterval: 'month' | 'year'
  priceUsd: number
  tokensPerCycle: number
  stripePriceId: string
}> = {
  pro_monthly: {
    label: 'Pro (Monthly)',
    billingInterval: 'month',
    priceUsd: 20,
    tokensPerCycle: 100,
    stripePriceId: 'price_1S7wL6FN7JnFFtgeI2CtNS10',
  },
  pro_yearly: {
    label: 'Pro (Yearly)',
    billingInterval: 'year',
    priceUsd: 192, // $16/month effective
    tokensPerCycle: 100,
    stripePriceId: 'price_1S7wM9FN7JnFFtgemHQJu7kx',
  },
  ultra_monthly: {
    label: 'Ultra (Monthly)',
    billingInterval: 'month',
    priceUsd: 200,
    tokensPerCycle: 1200,
    stripePriceId: 'price_1S7wR3FN7JnFFtgexSlaEN8B',
  },
  team_monthly: {
    label: 'Team (Monthly)',
    billingInterval: 'month',
    priceUsd: 40, // per user per month; POC uses single user
    tokensPerCycle: 250,
    stripePriceId: 'price_1S7wc2FN7JnFFtgeFMehKgHq',
  },
  team_yearly: {
    label: 'Team (Yearly)',
    billingInterval: 'year',
    priceUsd: 480, // $40/mo effective per user
    tokensPerCycle: 250,
    stripePriceId: 'price_1S7wc2FN7JnFFtgeUO562ZJ4',
  },
}

export function findPlanByPriceId(priceId: string) {
  return Object.entries(PLANS).find(([, v]) => v.stripePriceId === priceId) as
    | [PlanKey, (typeof PLANS)[PlanKey]]
    | undefined
}


