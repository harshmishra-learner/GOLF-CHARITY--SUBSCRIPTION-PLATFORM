import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DrawEngine } from '@/app/lib/draw-engine'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeParticipants = searchParams.get('includeParticipants') === 'true'

    let query = supabase.from('draws').select('*')

    if (includeParticipants) {
      query = supabase
        .from('draws')
        .select(`
          *,
          draw_participants (
            *,
            users (email, full_name)
          )
        `)
    }

    const { data: draws } = await query.order('year', { ascending: false }).order('month', { ascending: false })

    return NextResponse.json({ draws })
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

    // Check if user is admin
    const { data: userData } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
    if (!userData?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, drawId, drawType, winningNumbersCount } = body

    switch (action) {
      case 'simulate': {
        const { data: activeUsers } = await supabase
          .from('users')
          .select('id')
          .eq('subscription_status', 'active')

        if (!activeUsers || activeUsers.length === 0) {
          return NextResponse.json(
            { error: 'No active subscribers to simulate' },
            { status: 400 }
          )
        }

        const { data: allScores } = await supabase
          .from('golf_scores')
          .select('user_id, score')

        const participants = activeUsers.map(u => ({
          user_id: u.id,
          scores: allScores?.filter(s => s.user_id === u.id).map(s => s.score) || [],
        }))

        const config = {
          drawType: drawType || 'random',
          winningNumbersCount: winningNumbersCount || 5,
        }

        const result = DrawEngine.simulateDraw(
          config,
          participants,
          allScores || undefined
        )

        return NextResponse.json({ simulation: result })
      }

      case 'publish': {
        if (!drawId) {
          return NextResponse.json(
            { error: 'Draw ID is required' },
            { status: 400 }
          )
        }

        // Get the draw
        const { data: draw } = await supabase.from('draws').select('*').eq('id', drawId).single()
        if (!draw) {
          return NextResponse.json({ error: 'Draw not found' }, { status: 404 })
        }

        // Get active subscribers count
        const { count: activeCount } = await supabase
          .from('users')
          .select('*', { count: 'exact' })
          .eq('subscription_status', 'active')

        const prizePool = (activeCount || 0) * 0.10 * 29.99 // Approximate

        // If winningNumbers are already set in draw, use them; otherwise generate
        const winningNumbers = draw.winning_numbers.length > 0
          ? draw.winning_numbers
          : DrawEngine.generateWinningNumbers({ drawType: 'random', winningNumbersCount: 5 })

        // Get all participants
        const { data: participants } = await supabase
          .from('draw_participants')
          .select('*')
          .eq('draw_id', drawId)

        // Calculate winners
        const winners3 = participants?.filter(p => p.user_numbers.filter(n => winningNumbers.includes(n)).length >= 3) || []
        const winners4 = participants?.filter(p => p.user_numbers.filter(n => winningNumbers.includes(n)).length === 4) || []
        const winners5 = participants?.filter(p => p.user_numbers.filter(n => winningNumbers.includes(n)).length === 5) || []

        const distribution = DrawEngine.calculatePrizes(prizePool, winners3, winners4, winners5)

        // Calculate individual prizes
        const updatedParticipants: any[] = []
        for (const p of participants || []) {
          const matches = p.user_numbers.filter(n => winningNumbers.includes(n)).length
          let prizeAmount = 0
          let matchType = ''

          if (matches === 5) {
            prizeAmount = distribution['5-number']
            matchType = '5-number'
          } else if (matches === 4) {
            prizeAmount = distribution['4-number']
            matchType = '4-number'
          } else if (matches >= 3) {
            prizeAmount = distribution['3-number']
            matchType = '3-number'
          }

          if (prizeAmount > 0) {
            updatedParticipants.push({
              id: p.id,
              match_type: matchType,
              matched_count: matches,
              won: true,
              prize_amount: prizeAmount,
            })
          }
        }

        // Update participants with prize info
        for (const p of updatedParticipants) {
          await supabase
            .from('draw_participants')
            .update({
              match_type: p.match_type,
              matched_count: p.matched_count,
              won: true,
              prize_amount: p.prize_amount,
            })
            .eq('id', p.id)
        }

        // Update draw
        await supabase.from('draws').update({
          status: 'published',
          winning_numbers: winningNumbers,
          total_pool_amount: prizePool,
          jackpot_amount: distribution.pools['5-number'],
          published_at: new Date().toISOString(),
        }).eq('id', drawId)

        return NextResponse.json({
          success: true,
          winners: { '3-number': winners3.length, '4-number': winners4.length, '5-number': winners5.length },
          distribution,
        })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Draw API error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
