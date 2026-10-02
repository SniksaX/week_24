import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '../Config';

export const stripe = new Stripe(STRIPE_SECRET_KEY);