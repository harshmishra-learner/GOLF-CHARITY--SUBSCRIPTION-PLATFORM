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

    const { data: scores } = await supabase
      .from('golf_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('played_date', { ascending: false })

    return NextResponse.json({ scores })
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
    const { score, played_date } = body

    if (!score || !played_date) {
      return NextResponse.json(
        { error: 'Score and played_date are required' },
        { status: 400 }
      )
    }

    // Validate score range
    const scoreNum = parseInt(score)
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      return NextResponse.json(
        { error: 'Score must be between 1 and 45' },
        { status: 400 }
      )
    }

    // Validate date
    const date = new Date(played_date)
    if (date > new Date()) {
      return NextResponse.json(
        { error: 'Date cannot be in the future' },
        { status: 400 }
      )
    }

    // Check if user already has a score for this date
    const { data: existing } = await supabase
      .from('golf_scores')
      .select('id')
      .eq('user_id', user.id)
      .eq('played_date', played_date)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'A score for this date already exists. Delete it first to replace.' },
        { status: 400 }
      )
    }

    // Insert the score
    const { data: newScore, error } = await supabase
      .from('golf_scores')
      .insert({
        user_id: user.id,
        score: scoreNum,
        played_date: played_date,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Note: The database trigger will automatically limit to 5 scores

    return NextResponse.json({ score: newScore }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Score ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership before deleting
    const { data: score } = await supabase
      .from('golf_scores')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!score || score.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { error } = await supabase.from('golf_scores').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
