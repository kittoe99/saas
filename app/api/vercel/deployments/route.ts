import { NextResponse } from 'next/server';
import { listDeployments } from '@/lib/vercel';

// GET /api/vercel/deployments?projectId=&teamId=&limit=&state=
// Returns a subset of Vercel deployments. Reads defaults from env if params omitted.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || undefined;
    const teamId = searchParams.get('teamId') || undefined;
    const limitStr = searchParams.get('limit');
    const limit = limitStr ? Number(limitStr) : undefined;
    const state = (searchParams.get('state') as any) || undefined;

    const data = await listDeployments({ projectId, teamId, limit, state });
    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
