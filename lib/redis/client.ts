import { Redis } from "ioredis";

class RedisConnectionPool {
  private static pools: Redis[] = [];
  private static currentIndex = 0;
  private static readonly POOL_SIZE = 10; 
  private static isInitialized = false;
  private static initializationPromise: Promise<void> | null = null;

  public static async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = new Promise(async (resolve, reject) => {
      try {
        if (this.isInitialized) {
          resolve();
          return;
        }

        for (let i = 0; i < RedisConnectionPool.POOL_SIZE; i++) {
          const redis = new Redis({
            host: process.env.REDIS_HOST?.replace(/^https?:\/\//, "") || "localhost",
            port: Number(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD,
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            enableOfflineQueue: true,
            retryStrategy(times) {
              const delay = Math.min(times * 100, 3000);
              return delay;
            },
            db: 0,
            connectTimeout: 5000,
            keepAlive: 30000,
            lazyConnect: true,
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
            console.error(`Redis connection error (Pool ${i}):`, error);
          });

          redis.on("connect", () => {
            console.log(`Redis connection established (Pool ${i})`);
          });

          redis.on("ready", () => {
            console.log(`Redis client ready (Pool ${i})`);
          });

          // Wait for connection to be ready
          await redis.connect();
          this.pools.push(redis);
        }

        this.isInitialized = true;
        resolve();
      } catch (error) {
        console.error("Failed to initialize Redis pool:", error);
        reject(error);
      }
    });

    return this.initializationPromise;
  }

  public static async getConnection(): Promise<Redis> {
    await this.initialize();
    const connection = this.pools[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.POOL_SIZE;
    return connection;
  }

  public static async closeAll() {
    for (const redis of this.pools) {
      await redis.quit();
    }
    this.pools = [];
    this.isInitialized = false;
    this.initializationPromise = null;
  }
}

export default RedisConnectionPool;
