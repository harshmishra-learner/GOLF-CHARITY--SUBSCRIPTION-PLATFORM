import { Draw, DrawParticipant, GolfScore } from './supabase'

export interface DrawConfig {
  drawType: 'random' | 'algorithmic'
  winningNumbersCount: 3 | 4 | 5
}

export interface SimulationResult {
  draw: Draw
  participants: DrawParticipant[]
  winners: {
    '3-number': DrawParticipant[]
    '4-number': DrawParticipant[]
    '5-number': DrawParticipant[]
  }
  prizeDistribution: {
    '3-number': number
    '4-number': number
    '5-number': number
  }
}

export class DrawEngine {
  /**
   * Generate winning numbers based on configuration
   * Random: Simple random selection from 1-45
   * Algorithmic: Weighted by frequency of scores across all users
   */
  static generateWinningNumbers(
    config: DrawConfig,
    allScores?: GolfScore[]
  ): number[] {
    const numbers: number[] = []
    const maxNumber = 45
    const needed = config.winningNumbersCount

    if (config.drawType === 'random' || !allScores) {
      // Simple random without replacement
      while (numbers.length < needed) {
        const num = Math.floor(Math.random() * maxNumber) + 1
        if (!numbers.includes(num)) {
          numbers.push(num)
        }
      }
    } else {
      // Algorithmic: weighted by frequency
      const frequency = new Map<number, number>()
      allScores.forEach(score => {
        frequency.set(score.score, (frequency.get(score.score) || 0) + 1)
      })

      // Create weighted pool - more frequent scores have more entries
      const weightedPool: number[] = []
      frequency.forEach((count, score) => {
        for (let i = 0; i < count; i++) {
          weightedPool.push(score)
        }
      })

      // Sample without replacement from weighted pool
      const shuffled = weightedPool.sort(() => 0.5 - Math.random())
      numbers.push(...shuffled.slice(0, needed))

      // Ensure we have unique numbers
      const uniqueNumbers = [...new Set(numbers)]
      if (uniqueNumbers.length < needed) {
        // Fill remaining with random unique numbers
        while (uniqueNumbers.length < needed) {
          const num = Math.floor(Math.random() * maxNumber) + 1
          if (!uniqueNumbers.includes(num)) {
            uniqueNumbers.push(num)
          }
        }
        numbers.length = 0
        numbers.push(...uniqueNumbers)
      }
    }

    return numbers.sort((a, b) => a - b)
  }

  /**
   * Calculate matches between user numbers and winning numbers
   */
  static calculateMatches(
    userNumbers: number[],
    winningNumbers: number[]
  ): { matchedCount: number; matchType: '3-number' | '4-number' | '5-number' } {
    const matches = userNumbers.filter(n => winningNumbers.includes(n)).length
    let matchType: '3-number' | '4-number' | '5-number' = '3-number'

    if (matches >= 5) {
      matchType = '5-number'
    } else if (matches >= 4) {
      matchType = '4-number'
    } else if (matches >= 3) {
      matchType = '3-number'
    } else {
      matchType = '3-number' // Still participate in 3-number tier even if <3 matches? No, only if >=3
    }

    return {
      matchedCount: matches,
      matchType: matches >= 3 ? matchType : '3-number' // We'll filter later
    }
  }

  /**
   * Run a complete draw simulation
   */
  static async simulateDraw(
    config: DrawConfig,
    participants: Array<{ user_id: string; scores: number[] }>,
    allScores?: GolfScore[],
    winningNumbers?: number[]
  ): Promise<SimulationResult> {
    const generatedNumbers = winningNumbers || this.generateWinningNumbers(config, allScores)

    const drawParticipants: DrawParticipant[] = participants.map(p => {
      const userNumbers = p.scores.slice(0, 5).sort((a, b) => a - b)
      const { matchedCount, matchType } = this.calculateMatches(userNumbers, generatedNumbers)

      return {
        id: 'sim-' + Math.random().toString(36).substr(2, 9),
        draw_id: 'sim-draw',
        user_id: p.user_id,
        user_numbers: userNumbers,
        match_type: matchedCount >= 3 ? matchType : '3-number',
        matched_count: matchedCount,
        won: matchedCount >= 3,
        prize_amount: 0,
        payout_status: 'pending' as const,
        proof_url: null,
        proof_approved: false,
        created_at: new Date().toISOString(),
      }
    })

    // Group by match type
    const winners = {
      '3-number': drawParticipants.filter(p => p.match_type === '3-number'),
      '4-number': drawParticipants.filter(p => p.match_type === '4-number'),
      '5-number': drawParticipants.filter(p => p.match_type === '5-number'),
    }

    // Track if 5-number has any winners
    const has5MatchWinner = winners['5-number'].length > 0

    return {
      draw: {
        id: 'sim-draw',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        draw_type: config.winningNumbersCount.toString() + '-number' as const,
        status: 'simulation',
        winning_numbers: generatedNumbers,
        jackpot_amount: 0,
        total_pool_amount: 0,
        created_at: new Date().toISOString(),
        published_at: null,
      },
      participants: drawParticipants,
      winners,
      prizeDistribution: {
        '3-number': 0,
        '4-number': 0,
        '5-number': 0,
      },
    }
  }

  /**
   * Calculate prize distribution based on winners and total pool
   */
  static calculatePrizes(
    totalPool: number,
    winners3: DrawParticipant[],
    winners4: DrawParticipant[],
    winners5: DrawParticipant[]
  ) {
    const pool5 = Math.round(totalPool * 0.40 * 100) / 100
    const pool4 = Math.round(totalPool * 0.35 * 100) / 100
    const pool3 = Math.round(totalPool * 0.25 * 100) / 100

    const prize5 = winners5.length > 0 ? pool5 / winners5.length : 0
    const prize4 = winners4.length > 0 ? pool4 / winners4.length : 0
    const prize3 = winners3.length > 0 ? pool3 / winners3.length : 0

    return {
      '5-number': Math.round(prize5 * 100) / 100,
      '4-number': Math.round(prize4 * 100) / 100,
      '3-number': Math.round(prize3 * 100) / 100,
      pools: {
        '5-number': pool5,
        '4-number': pool4,
        '3-number': pool3,
      },
      has5MatchWinner: winners5.length > 0,
    }
  }
}
