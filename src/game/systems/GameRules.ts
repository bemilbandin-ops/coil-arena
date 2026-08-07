import { BalanceConfig } from '../config/balance';

export interface Rankable { id: string; score: number; mass: number; }

export function canConsume(attackerPower: number, victimPower: number): boolean {
  return attackerPower >= victimPower * BalanceConfig.snake.consumeThreshold;
}

export function rankByScore<T extends Rankable>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => (b.score - a.score) || (b.mass - a.mass) || a.id.localeCompare(b.id));
}
