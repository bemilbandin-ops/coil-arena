export interface MatchSession { start(): Promise<void>; stop(): void; update(delta: number): void; }
export class OfflineMatchSession implements MatchSession { async start(): Promise<void> {} stop(): void {} update(_delta: number): void {} }
export class OnlineMatchSession implements MatchSession { async start(): Promise<void> { throw new Error('Online session is disabled in this offline-first build.'); } stop(): void {} update(_delta: number): void {} }
