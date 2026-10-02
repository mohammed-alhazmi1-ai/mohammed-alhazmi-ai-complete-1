const baseUrl = () => (process.env.PAYPAL_ENV || 'sandbox').toLowerCase() === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

export function paypalConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID?.trim() && process.env.PAYPAL_CLIENT_SECRET?.trim())
}

async function accessToken() {
  if (!paypalConfigured()) throw new Error('PayPal REST credentials are not configured')
  const basic = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')
  const res = await fetch(`${baseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.access_token) throw new Error(data.error_description || 'PayPal authentication failed')
  return data.access_token as string
}

export async function paypalRequest<T>(path: string, init: RequestInit = {}) {
  const token = await accessToken()
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({})) as T & { name?: string; message?: string; details?: unknown[] }
  if (!res.ok) throw new Error(data.message || data.name || `PayPal request failed (${res.status})`)
  return data
}

export function paypalReturnUrl() {
  return process.env.PAYPAL_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'https://mohammed-alhazmi-ai-complete-1.vercel.app'}/dashboard/billing?paypal=success`
}

export function paypalCancelUrl() {
  return process.env.PAYPAL_CANCEL_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'https://mohammed-alhazmi-ai-complete-1.vercel.app'}/dashboard/billing?paypal=cancelled`
}
