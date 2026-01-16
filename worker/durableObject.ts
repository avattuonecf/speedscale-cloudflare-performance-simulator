import { DurableObject } from "cloudflare:workers";
export class GlobalDurableObject extends DurableObject {
    async getCounterValue(): Promise<number> {
      const value = (await this.ctx.storage.get("total_tests_run")) || 0;
      return value as number;
    }
    async increment(amount = 1): Promise<number> {
      let value: number = (await this.ctx.storage.get("total_tests_run")) || 0;
      value += amount;
      await this.ctx.storage.put("total_tests_run", value);
      return value;
    }
    // Keeping boilerplate methods for reference if needed elsewhere
    async getDemoItems(): Promise<any[]> { return []; }
    async addDemoItem(item: any): Promise<any[]> { return []; }
    async updateDemoItem(id: string, updates: any): Promise<any[]> { return []; }
    async deleteDemoItem(id: string): Promise<any[]> { return []; }
}