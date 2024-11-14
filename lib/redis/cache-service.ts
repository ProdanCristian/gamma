import redis from "./client";

export class CacheService {
  private prefix: string;

  constructor(prefix: string = "") {
    this.prefix = `cache:${prefix}`;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(this.getKey(key));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const prefixedKeys = keys.map((key) => this.getKey(key));
      const results = await redis.mget(prefixedKeys);
      return results.map((result) => (result ? JSON.parse(result) : null));
    } catch (error) {
      console.error("Cache mget error:", error);
      return keys.map(() => null);
    }
  }

  async set(key: string, data: any, ttl?: number): Promise<void> {
    try {
      const serializedData = JSON.stringify(data);
      if (ttl) {
        await redis.set(this.getKey(key), serializedData, "EX", ttl);
      } else {
        await redis.set(this.getKey(key), serializedData);
      }
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  async mset(
    items: { key: string; value: any; ttl?: number }[]
  ): Promise<void> {
    try {
      const pipeline = redis.pipeline();

      items.forEach(({ key, value, ttl }) => {
        const prefixedKey = this.getKey(key);
        const serializedData = JSON.stringify(value);

        if (ttl) {
          pipeline.set(prefixedKey, serializedData, "EX", ttl);
        } else {
          pipeline.set(prefixedKey, serializedData);
        }
      });

      await pipeline.exec();
    } catch (error) {
      console.error("Cache mset error:", error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const exists = await redis.exists(this.getKey(key));
      return exists === 1;
    } catch (error) {
      console.error("Cache exists error:", error);
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(this.getKey(key));
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  }

  async clearPrefix(customPrefix?: string): Promise<void> {
    try {
      const scanPrefix = customPrefix
        ? `cache:${customPrefix}*`
        : `${this.prefix}*`;

      let cursor = "0";
      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          "MATCH",
          scanPrefix,
          "COUNT",
          100
        );
        cursor = nextCursor;

        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== "0");
    } catch (error) {
      console.error("Cache clearPrefix error:", error);
    }
  }
}
