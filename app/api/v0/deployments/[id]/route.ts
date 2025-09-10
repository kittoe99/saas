import { NextResponse } from 'next/server'
import { v0 } from '@/lib/v0'
import { getSupabaseServer } from '@/lib/supabaseServer'

// GET /api/v0/deployments/[id]
// Fetch latest deployment details from v0 and upsert URL/status into DB
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = params?.id?.trim()
    if (!id) return NextResponse.json({ error: 'Missing deployment id' }, { status: 400 })

    const dep: any = await (v0 as any).deployments.get({ id })

    const supabase = getSupabaseServer()
    const { error: upErr } = await supabase
      .from('v0_deployments')
      .update({
        status: dep?.status ?? null,
        url: dep?.url ?? dep?.webUrl ?? null,
        metadata: {
          apiUrl: dep?.apiUrl ?? null,
          inspectorUrl: dep?.inspectorUrl ?? null,
        },
      })
      .eq('v0_deployment_id', id)
      .single()

    if (upErr) {
      return NextResponse.json({ error: `Failed to persist deployment refresh: ${upErr.message}` }, { status: 500 })
    }

    return NextResponse.json({ deployment: dep }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
