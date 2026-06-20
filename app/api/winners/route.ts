import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    const { data: userData } = await supabase.from('users').select('is_admin').eq('id', user.id).single()

    const query = supabase
      .from('draw_participants')
      .select(`
        *,
        draws (month, year, status, winning_numbers),
        users (email, full_name)
      `)
      .order('created_at', { ascending: false })

    if (!userData?.is_admin) {
      // Non-admins only see their own
      query.eq('user_id', user.id)
    }

    const { data: participations } = await query

    return NextResponse.json({ participations })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, participantId, proofUrl, participantId: ppId } = body

    if (action === 'upload_proof') {
      if (!ppId || !proofUrl) {
        return NextResponse.json(
          { error: 'participantId and proofUrl are required' },
          { status: 400 }
        )
      }

      // Verify ownership
      const { data: participant } = await supabase
        .from('draw_participants')
        .select('user_id')
        .eq('id', ppId)
        .single()

      if (participant.user_id !== user.id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
      }

      // Create verification record
      const { data: verification, error } = await supabase
        .from('winner_verifications')
        .insert({
          draw_participant_id: ppId,
          user_id: user.id,
          proof_url: proofUrl,
          status: 'pending',
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ verification })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
