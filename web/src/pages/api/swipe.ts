import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabaseClient'

const LIMITS: Record<string, number> = { FREE: 25, PLUS: 100, GOLD: 999999 }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { swiperId, targetId, direction } = req.body
  if (!swiperId || !targetId || !['left','right'].includes(direction)) return res.status(400).json({ error: 'Invalid' })

  const { data: bill } = await supabaseAdmin.from('billing').select('*').eq('user_id', swiperId).single()
  const tier = bill?.tier || 'FREE'
  const limit = LIMITS[tier] ?? 25

  const today = new Date().toISOString().slice(0, 10)
  const { count } = await supabaseAdmin.from('swipes')
    .select('*', { count: 'exact', head: true })
    .eq('swiper', swiperId)
    .gte('created_at', `${today}T00:00:00Z`)

  if (count >= limit) return res.status(403).json({ error: 'Quota exceeded' })

  await supabaseAdmin.from('swipes').insert({ swiper: swiperId, target: targetId, direction })

  if (direction === 'right') {
    const { data } = await supabaseAdmin.from('swipes')
      .select('*')
      .eq('swiper', targetId)
      .eq('target', swiperId)
      .eq('direction', 'right')
    if (data && data.length) {
      const a = swiperId < targetId ? swiperId : targetId
      const b = swiperId < targetId ? targetId : swiperId
      await supabaseAdmin.from('matches').insert({ a, b })
      return res.json({ matched: true })
    }
  }

  res.json({ matched: false })
}
