export interface SpatialItem { id: string; x: number; y: number; active: boolean; }

export class SpatialGrid<T extends SpatialItem> {
  private cells = new Map<string, Set<T>>();
  private itemCells = new Map<string, string>();
  constructor(private readonly cellSize = 180) {}
  private key(x: number, y: number): string { return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`; }
  clear(): void { this.cells.clear(); this.itemCells.clear(); }
  insert(item: T): void { if (!item.active) return; const k = this.key(item.x, item.y); let set = this.cells.get(k); if (!set) this.cells.set(k, set = new Set()); set.add(item); this.itemCells.set(item.id, k); }
  remove(item: T): void { const k = this.itemCells.get(item.id); if (!k) return; this.cells.get(k)?.delete(item); this.itemCells.delete(item.id); }
  update(item: T): void { const old = this.itemCells.get(item.id); const k = this.key(item.x, item.y); if (!item.active) { this.remove(item); return; } if (old === k) return; if (old) this.cells.get(old)?.delete(item); let set = this.cells.get(k); if (!set) this.cells.set(k, set = new Set()); set.add(item); this.itemCells.set(item.id, k); }
  queryRadius(x: number, y: number, radius: number): T[] {
    const out: T[] = []; const seen = new Set<T>(); const minX = Math.floor((x-radius)/this.cellSize), maxX = Math.floor((x+radius)/this.cellSize); const minY = Math.floor((y-radius)/this.cellSize), maxY = Math.floor((y+radius)/this.cellSize);
    for (let cy=minY; cy<=maxY; cy++) for (let cx=minX; cx<=maxX; cx++) { const set=this.cells.get(`${cx},${cy}`); if (!set) continue; for (const item of set) if (!seen.has(item)) { seen.add(item); const dx=item.x-x, dy=item.y-y; if (dx*dx+dy*dy<=radius*radius) out.push(item); } }
    return out;
  }
}
