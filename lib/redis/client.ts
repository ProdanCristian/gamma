import { Redis } from "ioredis";

class RedisClient {
  private static instance: Redis;
  private static isConnected: boolean = false;

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      const host =
        process.env.REDIS_HOST?.replace(/^https?:\/\//, "") || "localhost";

      RedisClient.instance = new Redis({
        host: host,
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: 0,
        keyPrefix: "nextjs:",
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        reconnectOnError: (err) => {
          const targetError = "READONLY";
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
      });

      RedisClient.instance.on("error", (error) => {
        console.error("Redis connection error:", error);
        RedisClient.isConnected = false;
      });

      RedisClient.instance.on("connect", () => {
        console.log("Successfully connected to Redis");
        RedisClient.isConnected = true;
      });

      RedisClient.instance.on("ready", () => {
        console.log("Redis client is ready");
        RedisClient.isConnected = true;
      });
    }

    return RedisClient.instance;
  }

  public static isReady(): boolean {
    return RedisClient.isConnected;
  }
}

const redis = RedisClient.getInstance();
export default redis;
