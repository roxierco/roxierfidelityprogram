import { z } from "zod";

const uuid = z.string().uuid();

export const applyCashbackSchema = z.object({
  customerId: uuid,
  cardId: uuid,
  businessId: uuid,
  purchaseAmount: z.number().positive().max(1_000_000),
  idempotencyKey: z.string().min(8).max(128),
});

export const redeemCashbackSchema = z.object({
  customerId: uuid,
  cardId: uuid,
  businessId: uuid,
  redeemAmount: z.number().positive().max(1_000_000),
  idempotencyKey: z.string().min(8).max(128),
});

/** Config de cashback que edita el negocio (se guarda en loyalty_cards). */
export const cashbackRuleSchema = z.object({
  cashbackPercent: z.number().min(0).max(100),
  minPurchase: z.number().min(0).default(0),
  maxBalance: z.number().positive().nullable().default(null),
  expiresDays: z.number().int().positive().nullable().default(null),
});

export type ApplyCashbackInput = z.infer<typeof applyCashbackSchema>;
export type RedeemCashbackInput = z.infer<typeof redeemCashbackSchema>;
export type CashbackRuleInput = z.infer<typeof cashbackRuleSchema>;
