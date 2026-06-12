const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisClient = createClient({ url: redisUrl });

redisClient.on("error", (err: any) => {
  console.error("Redis Client Error", err);
});

redisClient.connect().catch((err: any) => {
  console.error("Redis Connection Failed", err);
});

module.exports = { redisClient };
