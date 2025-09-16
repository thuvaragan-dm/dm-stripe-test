"use client"
import { useState } from 'react'
import { PLANS } from '@/config/plans'

async function createCheckout(priceId: string, mode: 'subscription' | 'payment', email?: string) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId, mode, email }),
  })
  const data = await res.json()
  if (data.url) {
    window.location.href = data.url as string
  } else {
    alert('Failed to create checkout session')
  }
}

export default function Home() {
  const [buyTokens, setBuyTokens] = useState<string>('')
  const [deductTokens, setDeductTokens] = useState<string>('')
  const [me, setMe] = useState<{ name?: string; email?: string; subscriptionTokens?: number; purchasedTokens?: number; plan?: string | null } | null>(null)
  const [email, setEmail] = useState<string>('')

  // Load user info for the table
  if (typeof window !== 'undefined' && !me) {
    fetch('/api/me').then((r) => r.json()).then(setMe).catch(() => setMe(null))
  }
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Pricing</h1>
      <p style={{ color: '#6b7280', marginBottom: 8 }}>Choose a plan. Tokens are included each billing cycle.</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <input
          type="email"
          placeholder="Enter your email for checkout"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 8, flex: 1 }}
        />
        <button
          style={{ background: '#e5e7eb', color: '#111827', border: 0, borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}
          onClick={() => setEmail(me?.email || '')}
        >
          Use my saved email
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
        {Object.entries(PLANS).map(([key, plan]) => (
          <div key={key} style={{ border: '1px solid #e5e5e5', borderRadius: 12, padding: 20, background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>{plan.label}</h3>
            <p style={{ fontSize: 28, margin: '8px 0', fontWeight: 700 }}>${plan.priceUsd}/{plan.billingInterval}</p>
            <p style={{ marginTop: 4, color: '#6b7280' }}>{plan.tokensPerCycle} tokens per cycle</p>
            <button style={{ marginTop: 12, background: '#111827', color: '#fff', border: 0, borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }} onClick={() => createCheckout(plan.stripePriceId, 'subscription', email || me?.email)} disabled={!((email || me?.email) && (email || me?.email)?.includes('@'))}>Subscribe</button>
          </div>
        ))}
      </div>
      <hr style={{ margin: '24px 0' }} />
      <h2 style={{ fontSize: 24, fontWeight: 600 }}>Need more tokens?</h2>
      <p style={{ color: '#6b7280' }}>Buy a one-time top-up at $0.01 per token.</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="number"
          min={1}
          placeholder="Enter tokens"
          value={buyTokens}
          onChange={(e) => setBuyTokens(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              const tokens = Number(buyTokens)
              if (Number.isFinite(tokens) && tokens > 0) {
                const res = await fetch('/api/checkout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ mode: 'payment', topUpTokens: tokens }),
                })
                const data = await res.json()
                if (data.url) window.location.href = data.url
              }
            }
          }}
          style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 8 }}
        />
        <button
          style={{ background: '#2563eb', color: '#fff', border: 0, borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}
          onClick={async () => {
            const tokens = Number(buyTokens)
            if (Number.isFinite(tokens) && tokens > 0) {
              const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: 'payment', topUpTokens: tokens }),
              })
              const data = await res.json()
              if (data.url) window.location.href = data.url
            }
          }}
        >
          Buy Tokens
        </button>
      </div>
      <hr style={{ margin: '24px 0' }} />
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>User & Tokens</h2>
      {me && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Name</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Email</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Plan</th>
                <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Subscription Tokens</th>
                <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #e5e7eb' }}>Purchased Tokens</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: 8 }}>{me.name}</td>
                <td style={{ padding: 8 }}>{me.email}</td>
                <td style={{ padding: 8 }}>{me.plan ?? 'None'}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{me.subscriptionTokens}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{me.purchasedTokens}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
        <input
          type="number"
          min={1}
          placeholder="Tokens to use"
          value={deductTokens}
          onChange={(e) => setDeductTokens(e.target.value)}
          style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 8 }}
        />
        <button
          style={{ background: '#111827', color: '#fff', border: 0, borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}
          onClick={async () => {
            const amount = Number(deductTokens)
            if (!Number.isFinite(amount) || amount <= 0) return
            const res = await fetch('/api/usage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount }),
            })
            const data = await res.json()
            if (res.ok) setMe((m) => (m ? { ...m, ...data } : m))
            else alert(data.error || 'Failed')
          }}
        >
          Report Usage
        </button>
      </div>
    </main>
  )
}
