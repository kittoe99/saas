import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "./env";

export const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
      appInfo: { name: "Hinn.dev", version: "0.1.0" },
    })
  : null;
