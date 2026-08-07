export interface AdService { showRewarded(): Promise<boolean>; }
export interface PurchaseService { purchase(productId: string): Promise<boolean>; }
export class NullAdService implements AdService { async showRewarded(): Promise<boolean> { return false; } }
export class NullPurchaseService implements PurchaseService { async purchase(_productId: string): Promise<boolean> { return false; } }
