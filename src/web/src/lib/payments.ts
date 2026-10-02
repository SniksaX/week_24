import { api } from './api.ts'

export function paymentStatus() {
  return api<{ hasPaid: boolean }>('/api/payments/status')
}

export async function startCheckout(): Promise<void> {
  const data = await api<{ url: string }>('/api/payments/checkout', { method: 'POST' })
  window.location.href = data.url
}
