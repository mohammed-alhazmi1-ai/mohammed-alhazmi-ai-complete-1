export const PAYMENT_GATEWAYS = [
  { id: 'stripe', name: 'Stripe', enabled: false },
  { id: 'paypal', name: 'PayPal', enabled: false },
  { id: 'binance', name: 'Binance Pay', enabled: false },
  { id: 'coinbase', name: 'Coinbase Commerce', enabled: false },
  { id: 'payoneer', name: 'Payoneer', enabled: false },
  { id: 'wise', name: 'Wise', enabled: false },
  { id: 'usdt', name: 'USDT (TRC20 / ERC20)', enabled: false },
  { id: 'local', name: 'محافظ محلية', enabled: false },
] as const;
