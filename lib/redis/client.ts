import { Redis } from "ioredis";

class RedisConnectionPool {
  private static pools: Redis[] = [];
  private static currentIndex = 0;
  private static readonly POOL_SIZE = 20;
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
        enableOfflineQueue: true,
        retryStrategy(times) {
          return Math.min(times * 50, 2000);
        },
        db: 0,
        connectTimeout: 10000,
        keepAlive: 30000,
        lazyConnect: false,
        commandTimeout: 5000,
        reconnectOnError(err) {
          const targetError = "READONLY";
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
      });

      redis.on("error", (error) => {
        console.error("Redis connection error:", error);
      });

      redis.on("connect", () => {
        console.log("Redis connected successfully");
      });

      RedisConnectionPool.pools.push(redis);
    }

    this.isInitialized = true;
  }

  public static getConnection(): Redis {
    if (!this.isInitialized) {
      this.initialize();
    }

    const connection = this.pools[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.POOL_SIZE;
    return connection;
  }

  public static async closeAll(): Promise<void> {
    await Promise.all(this.pools.map((connection) => connection.quit()));
    this.pools = [];
    this.isInitialized = false;
    this.currentIndex = 0;
  }
}

export default RedisConnectionPool;
