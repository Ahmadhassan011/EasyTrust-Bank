const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisClient = createClient({ url: redisUrl });

let redisReady = false;

redisClient.on("ready", () => { redisReady = true; });
redisClient.on("error", (err: any) => {
  redisReady = false;
  console.error("Redis Client Error", err);
});

redisClient.connect().catch((err: any) => {
  console.error("Redis Connection Failed — 2PC coordinator will be unavailable:", err);
});

const isRedisReady = () => redisReady;

module.exports = { redisClient, isRedisReady };
