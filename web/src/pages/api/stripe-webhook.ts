import { buffer } from 'micro'
import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '../../lib/stripe'
import { supabaseAdmin } from '../../lib/supabaseClient'

export const config = { api: { bodyParser: false } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']!
  let event
  try {
    event = stripe.webhooks.constructEvent(buf.toString(), sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.client_reference_id
    await supabaseAdmin.from('billing').upsert({
      user_id: userId,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      tier: 'PLUS'
    }, { onConflict: 'user_id' })
  }

  if (event.type === 'invoice.payment_failed') {
    // hantera betalningsfel
  }

  res.json({ received: true })
}
