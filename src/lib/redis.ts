import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("error", (error) => {
  console.error("Redis连接错误:", error);
});

redis.on("connect", () => {
  console.log("Redis连接成功");
});

export default redis;
