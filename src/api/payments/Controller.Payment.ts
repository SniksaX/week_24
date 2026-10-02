import type { Request, Response } from 'express';
import type Stripe from 'stripe';
import { APP_URL, POST_ACCESS_PRICE, STRIPE_WEBHOOK_SECRET } from '../Config';
import User from '../db/DB.Model.User';
import { stripe } from './Stripe.Payment';

async function currentUser(req: Request): Promise<User | null> {
  return req.user ? User.findOne(req.user.email) : null;
}

class PaymentController {
  async status(req: Request, res: Response): Promise<void> {
    const user = await currentUser(req);
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    res.json({ hasPaid: user.hasPaid });
  }

  async checkout(req: Request, res: Response): Promise<void> {
    const user = await currentUser(req);
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (user.hasPaid) {
      res.status(409).json({ message: 'Already paid' });
      return;
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: user.email,
        client_reference_id: String(user.id),
        metadata: { userId: String(user.id) },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: POST_ACCESS_PRICE.currency,
              unit_amount: POST_ACCESS_PRICE.unitAmount,
              product_data: { name: POST_ACCESS_PRICE.name },
            },
          },
        ],
        success_url: `${APP_URL}?payment=success`,
        cancel_url: `${APP_URL}?payment=cancelled`,
      });
      if (!session.url) throw new Error('Missing checkout URL');
      res.json({ url: session.url });
    } catch {
      res.status(502).json({ message: 'Payment provider error' });
    }
  }

  async webhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers['stripe-signature'];
    if (typeof signature !== 'string' || !Buffer.isBuffer(req.body)) {
      res.status(400).json({ message: 'Invalid webhook request' });
      return;
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(req.body, signature, STRIPE_WEBHOOK_SECRET);
    } catch {
      res.status(400).json({ message: 'Invalid signature' });
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = Number(session.metadata?.userId);
      if (session.payment_status === 'paid' && Number.isInteger(userId)) {
        try {
          await User.markPaid(userId);
        } catch {
          res.status(500).json({ message: 'Failed to record payment' });
          return;
        }
      }
    }

    res.json({ received: true });
  }
}

export default new PaymentController();