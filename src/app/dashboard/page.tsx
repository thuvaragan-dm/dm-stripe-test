"use client"
import { useEffect, useState } from 'react'

type Balances = { subscriptionTokens: number; purchasedTokens: number; plan?: string | null }

export default function DashboardPage() {
  const [balances, setBalances] = useState<Balances | null>(null)
  const [amount, setAmount] = useState('100')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => setBalances(d))
      .catch(() => setBalances({ subscriptionTokens: 0, purchasedTokens: 0 }))
  }, [])

  async function deduct() {
    setLoading(true)
    try {
      const res = await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount) }),
      })
      const data = await res.json()
      if (res.ok) setBalances((b) => b && { ...b, ...data })
      else alert(data.error || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  async function topup(tokens: number) {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'payment', topUpTokens: tokens }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Dashboard</h1>
      {balances && (
        <div style={{ marginBottom: 16, border: '1px solid #e5e5e5', borderRadius: 12, padding: 16, background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p style={{ margin: 0, color: '#6b7280' }}>Plan</p>
          <p style={{ margin: '4px 0 12px', fontWeight: 600 }}>{balances.plan ?? 'None'}</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: '#6b7280' }}>Subscription tokens</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{balances.subscriptionTokens}</p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: '#6b7280' }}>Purchased tokens</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{balances.purchasedTokens}</p>
            </div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={1}
          style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 8 }}
        />
        <button onClick={deduct} disabled={loading} style={{ background: '#111827', color: '#fff', border: 0, borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>Deduct Tokens</button>
      </div>
      <hr style={{ margin: '24px 0' }} />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="number"
          min={1}
          placeholder="Tokens to buy"
          style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 8 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = Number((e.target as HTMLInputElement).value)
              if (Number.isFinite(value) && value > 0) topup(value)
            }
          }}
        />
        <button onClick={() => {
          const el = document.querySelector<HTMLInputElement>('input[placeholder="Tokens to buy"]')
          const value = Number(el?.value || 0)
          if (Number.isFinite(value) && value > 0) topup(value)
        }} style={{ background: '#2563eb', color: '#fff', border: 0, borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}>Buy Tokens</button>
      </div>
    </main>
  )
}


