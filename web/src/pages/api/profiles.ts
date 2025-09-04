import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.query.userId as string | undefined
  const q = supabase.from('profiles').select('*').limit(40)
  if (userId) q.neq('id', userId)
  const { data, error } = await q
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}
