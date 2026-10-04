import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const COOKIE = 'ai_platform_session';
const SECRET = process.env.AUTH_SECRET || 'change-this-auth-secret-before-production';
export type SessionUser = { id: string; email?: string; role?: string };
export function isOwner(role?: string) { return role === 'OWNER' || role === 'ADMIN'; }
type Payload = { userId: string; email: string; role: string; exp: number };
function signature(value: string) { return crypto.createHmac('sha256', SECRET).update(value).digest('base64url'); }
function encode(payload: Payload) { const body = Buffer.from(JSON.stringify(payload)).toString('base64url'); return `${body}.${signature(body)}`; }
function decode(value?: string | null): Payload | null { if (!value) return null; const [body, sig] = value.split('.'); const expected = body && signature(body); if (!body || !sig || !expected || sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null; try { const p = JSON.parse(Buffer.from(body, 'base64url').toString()) as Payload; return p.exp > Date.now() ? p : null; } catch { return null; } }
export async function createSession(user: { id: string; email: string; role: string }) { cookies().set(COOKIE, encode({ userId: user.id, email: user.email, role: user.role, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 }), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 }); }
export async function clearSession() { cookies().delete(COOKIE); }
export async function getSessionUser() { const p = decode(cookies().get(COOKIE)?.value); if (!p) return null; return prisma.user.findUnique({ where: { id: p.userId }, select: { id: true, email: true, firstName: true, lastName: true, username: true, role: true, avatarUrl: true } }); }
export function getSessionFromRequest(request: Request) { const raw = request.headers.get('cookie')?.split(';').map(v => v.trim()).find(v => v.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1); return decode(raw); }
