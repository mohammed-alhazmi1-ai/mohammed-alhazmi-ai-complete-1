import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isOwnerEmail, totalCredits } from '@/lib/credits';

export async function GET(req: NextRequest) {
  try {
    const email = (req.nextUrl.searchParams.get('email') || '').toLowerCase();
    if (!email || !(await isOwnerEmail(email))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }
    const q = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();
    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { email: { contains: q } },
              { username: { contains: q } },
              { firstName: { contains: q } },
            ],
          }
        : undefined,
      include: { wallet: true, subscription: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        plan: u.subscription?.planType || 'Free',
        credits: totalCredits(u.wallet),
        createdAt: u.createdAt,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'خطأ' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ownerEmail = String(body.ownerEmail || body.email || '').toLowerCase();
    if (!ownerEmail || !(await isOwnerEmail(ownerEmail))) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    if (body.action === 'set-role') {
      const user = await prisma.user.update({
        where: { id: body.userId },
        data: { role: body.role || 'USER' },
      });
      return NextResponse.json({ success: true, user: { id: user.id, role: user.role } });
    }

    if (body.action === 'set-plan') {
      await prisma.subscription.upsert({
        where: { userId: body.userId },
        create: {
          userId: body.userId,
          planType: body.planType || 'Free',
          monthlyLimit: 50,
          status: 'active',
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
        update: { planType: body.planType || 'Free', status: 'active' },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'خطأ' }, { status: 500 });
  }
}
