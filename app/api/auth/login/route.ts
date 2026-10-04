import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
    if (!user?.passwordHash || !(await bcrypt.compare(String(password), user.passwordHash))) {
      return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 });
    }
    await createSession({ id: user.id, email: user.email, role: user.role });
    return NextResponse.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, user_metadata: { role: user.role } } });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'تعذر تسجيل الدخول' }, { status: 500 }); }
}
