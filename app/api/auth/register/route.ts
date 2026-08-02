import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, username, email, phoneNumber, country, city, password, confirmPassword, avatarUrl } = body;

    if (!email || !password || !username) {
      return NextResponse.json({ error: 'الحقول الأساسية مطلوبة' }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'كلمات المرور غير متطابقة' }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existingUser) {
      return NextResponse.json({ error: 'البريد أو اسم المستخدم مستخدم مسبقاً' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        firstName: firstName || username,
        lastName: lastName || '',
        username,
        email,
        passwordHash: hashedPassword,
        phoneNumber,
        country,
        city,
        avatarUrl,
        subscription: {
          create: {
            planType: 'Free',
            monthlyLimit: 50,
            validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            status: 'active',
          },
        },
        wallet: {
          create: { freeCredits: 100, paidCredits: 0, referralCredits: 0 },
        },
      },
    });

    const { passwordHash: _, ...safe } = newUser;
    return NextResponse.json({ message: 'تم إنشاء الحساب بنجاح', user: safe }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || 'حدث خطأ' }, { status: 500 });
  }
}
