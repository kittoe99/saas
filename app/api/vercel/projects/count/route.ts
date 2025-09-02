import { NextResponse } from 'next/server';
import { listProjects } from '@/lib/vercel';

// GET /api/vercel/projects/count?teamId=&limit=
// Returns: { count: number }
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId') || undefined;
    const pageLimitStr = searchParams.get('limit');
    const pageLimit = pageLimitStr ? Number(pageLimitStr) : 100; // max per page

    let count = 0;
    let from: string | number | undefined = undefined;

    // Paginate until no further pages
    for (let i = 0; i < 1000; i++) { // safety cap
      const { projects, pagination } = await listProjects({ teamId, limit: pageLimit, from });
      count += Array.isArray(projects) ? projects.length : 0;
      // Vercel pagination may include a cursor in pagination.next
      const next = (pagination as any)?.next;
      if (!next) break;
      from = next;
    }

    return NextResponse.json({ count });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
