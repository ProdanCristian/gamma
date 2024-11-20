import { Redis } from "ioredis";

class RedisConnectionPool {
  private static pools: Redis[] = [];
  private static currentIndex = 0;
  private static readonly POOL_SIZE = 150;
  private static isInitialized = false;

  public static initialize() {
    if (this.isInitialized) {
      return;
    }

    for (let i = 0; i < RedisConnectionPool.POOL_SIZE; i++) {
      const redis = new Redis({
        host:
          process.env.REDIS_HOST?.replace(/^https?:\/\//, "") || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy(times) {
          return Math.min(times * 50, 2000);
        },
      });
      RedisConnectionPool.pools.push(redis);
    }

    this.isInitialized = true;
  }

  public static getConnection(): Redis {
    if (!this.isInitialized) {
      this.initialize();
    }

    const connection =
      RedisConnectionPool.pools[RedisConnectionPool.currentIndex];
    RedisConnectionPool.currentIndex =
      (RedisConnectionPool.currentIndex + 1) % RedisConnectionPool.POOL_SIZE;
    return connection;
  }

  public static async closeAll() {
    await Promise.all(RedisConnectionPool.pools.map((redis) => redis.quit()));
    RedisConnectionPool.pools = [];
    RedisConnectionPool.isInitialized = false;
  }
}

export default RedisConnectionPool;
