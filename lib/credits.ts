import { prisma } from '@/lib/prisma';

export const COST_PER_TEXT = 5;

export async function ensureUserByEmail(
  email: string,
  meta?: {
    firstName?: string;
    lastName?: string;
    username?: string;
  }
) {
  const normalized = email.trim().toLowerCase();
  let user = await prisma.user.findUnique({
    where: { email: normalized },
    include: { wallet: true, subscription: true },
  });

  if (!user) {
    const username =
      meta?.username ||
      normalized.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') +
        '_' +
        Math.random().toString(36).slice(2, 6);

    user = await prisma.user.create({
      data: {
        email: normalized,
        firstName: meta?.firstName || username,
        lastName: meta?.lastName || '',
        username,
        role: 'USER',
        wallet: {
          create: {
            freeCredits: 100,
            paidCredits: 0,
            referralCredits: 0,
          },
        },
        subscription: {
          create: {
            planType: 'Free',
            monthlyLimit: 50,
            status: 'active',
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: { wallet: true, subscription: true },
    });
  } else if (!user.wallet) {
    await prisma.wallet.create({
      data: {
        userId: user.id,
        freeCredits: 100,
        paidCredits: 0,
        referralCredits: 0,
      },
    });
    user = (await prisma.user.findUnique({
      where: { id: user.id },
      include: { wallet: true, subscription: true },
    }))!;
  }

  return user;
}

export function totalCredits(wallet: {
  freeCredits: number;
  paidCredits: number;
  referralCredits: number;
} | null | undefined) {
  if (!wallet) return 0;
  return (wallet.freeCredits || 0) + (wallet.paidCredits || 0) + (wallet.referralCredits || 0);
}

export async function deductCredits(userId: string, amount: number, note?: string) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new Error('لا توجد محفظة للمستخدم');

  const current = totalCredits(wallet);
  if (current < amount) throw new Error('رصيد غير كافٍ. اشحن رصيدك أو فعّل كود هدية.');

  let remaining = amount;
  let free = wallet.freeCredits;
  let paid = wallet.paidCredits;
  let referral = wallet.referralCredits;

  if (remaining > 0 && free > 0) {
    const d = Math.min(free, remaining);
    free -= d;
    remaining -= d;
  }
  if (remaining > 0 && paid > 0) {
    const d = Math.min(paid, remaining);
    paid -= d;
    remaining -= d;
  }
  if (remaining > 0 && referral > 0) {
    const d = Math.min(referral, remaining);
    referral -= d;
    remaining -= d;
  }

  const updated = await prisma.wallet.update({
    where: { userId },
    data: { freeCredits: free, paidCredits: paid, referralCredits: referral },
  });

  const balanceAfter = totalCredits(updated);

  try {
    await prisma.walletTransaction.create({
      data: {
        userId,
        type: 'debit',
        amount,
        balanceAfter,
        description: note || `خصم ${amount} نقطة`,
      },
    });
  } catch {
    /* ignore log failure */
  }

  return balanceAfter;
}

export async function isOwnerEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const list = (process.env.NEXT_PUBLIC_OWNER_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (list.includes(normalized)) return true;

  try {
    const user = await prisma.user.findUnique({ where: { email: normalized } });
    return user?.role === 'OWNER' || user?.role === 'ADMIN';
  } catch {
    return false;
  }
}

export async function getMaintenanceMode() {
  try {
    const s = await prisma.setting.findUnique({ where: { key: 'maintenance' } });
    return s?.value === 'true' || s?.value === '1';
  } catch {
    return false;
  }
}
