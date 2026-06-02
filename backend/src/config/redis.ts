const { createClient } = require("redis");
const dotenv = require("dotenv");

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on("error", (err: any) => console.error("Redis Client Error", err));

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("🔌 Connected to Redis successfully");
  }
};

// Auto-connect on import in non-test mode
connectRedis().catch(console.error);

module.exports = {
  redisClient,
  connectRedis
};
