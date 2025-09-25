import { NextResponse } from 'next/server';
import { listProjects } from '@/lib/vercel';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const teamId = url.searchParams.get('teamId') || undefined;
    const limitStr = url.searchParams.get('limit');
    const from = url.searchParams.get('from') || undefined;
    const limit = limitStr ? Number(limitStr) : 20;

    const data = await listProjects({ teamId, limit: isNaN(limit) ? 20 : limit, from });
    return NextResponse.json({ ok: true, ...data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to fetch Vercel projects' }, { status: 500 });
  }
}
