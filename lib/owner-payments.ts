/** اعتماد دفع معلّق وشحن REMO */

export type PaymentRow = {
  id: string
  userId: string
  provider: string
  amount: number
  currency: string
  credits: number
  status: string
  description?: string | null
  createdAt: Date
  userEmail?: string | null
  userName?: string | null
}

export async function getPrisma() {
  const { PrismaClient } = await import('@prisma/client')
  return new PrismaClient()
}

export async function listPendingPayments(limit = 50) {
  const prisma = await getPrisma()
  try {
    const rows = await prisma.payment.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, email: true, name: true } },
      } as any,
    })
    await prisma.$disconnect()
    return (rows as any[]).map((r) => ({
      id: r.id,
      userId: r.userId,
      provider: r.provider,
      amount: r.amount,
      currency: r.currency,
      credits: r.credits,
      status: r.status,
      description: r.description,
      createdAt: r.createdAt,
      userEmail: r.user?.email,
      userName: r.user?.name,
    })) as PaymentRow[]
  } catch {
    try {
      const rows = await prisma.payment.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
      await prisma.$disconnect()
      return rows as any
    } catch (e) {
      await prisma.$disconnect()
      throw e
    }
  }
}

export async function settlePayment(
  paymentId: string,
  action: 'approve' | 'reject',
  note?: string
) {
  const prisma = await getPrisma()
  try {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
    if (!payment) {
      await prisma.$disconnect()
      return { ok: false, error: 'طلب الدفع غير موجود' }
    }
    if (payment.status !== 'pending') {
      await prisma.$disconnect()
      return { ok: false, error: `الطلب بحالة ${payment.status} ولا يمكن تعديله` }
    }

    if (action === 'reject') {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'rejected',
          description: note
            ? `${payment.description || ''} | رفض: ${note}`
            : payment.description,
        } as any,
      })
      await prisma.$disconnect()
      return { ok: true, status: 'rejected' }
    }

    const credits = Number(payment.credits || 0)
    if (credits <= 0) {
      await prisma.$disconnect()
      return { ok: false, error: 'قيمة REMO غير صالحة' }
    }

    let wallet = await prisma.wallet.findUnique({ where: { userId: payment.userId } })
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: payment.userId,
          freeCredits: 0,
          paidCredits: credits,
        } as any,
      })
    } else {
      wallet = await prisma.wallet.update({
        where: { userId: payment.userId },
        data: { paidCredits: (wallet.paidCredits || 0) + credits } as any,
      })
    }

    try {
      await prisma.walletTransaction.create({
        data: {
          userId: payment.userId,
          type: 'credit',
          amount: credits,
          description: `شحن بعد اعتماد دفع ${payment.provider} (#${paymentId.slice(0, 8)})`,
        } as any,
      })
    } catch {
      try {
        await prisma.walletTransaction.create({
          data: {
            userId: payment.userId,
            amount: credits,
            type: 'deposit',
          } as any,
        })
      } catch {
        /* */
      }
    }

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'completed',
        description: note
          ? `${payment.description || ''} | اعتماد: ${note}`
          : payment.description,
      } as any,
    })

    const total =
      (wallet.paidCredits || 0) +
      (wallet.freeCredits || 0) +
      ((wallet as any).referralCredits || 0)

    await prisma.$disconnect()
    return {
      ok: true,
      status: 'completed',
      creditsAdded: credits,
      walletTotal: total,
      userId: payment.userId,
    }
  } catch (e: any) {
    try {
      await prisma.$disconnect()
    } catch {
      /* */
    }
    return { ok: false, error: e?.message || 'فشل الاعتماد' }
  }
}
