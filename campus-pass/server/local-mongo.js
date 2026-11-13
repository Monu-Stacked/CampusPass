import { MongoMemoryReplSet } from "mongodb-memory-server";
import fs from "node:fs";
import path from "node:path";

const dbPath = path.resolve("./.mongo-data");
if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

console.log("Starting MongoMemoryReplSet on port 27017...");
try {
  const replSet = await MongoMemoryReplSet.create({
    instanceOpts: [
      {
        port: 27017,
        dbPath,
        storageEngine: "wiredTiger"
      }
    ],
    replSet: {
      name: "rs0",
      count: 1,
      storageEngine: "wiredTiger"
    }
  });

  const uri = replSet.getUri("campuspass");
  console.log("REPLICA_SET_READY");
  console.log("URI:", uri);

  // Keep alive
  process.on("SIGINT", async () => {
    console.log("Stopping Mongo replica set...");
    await replSet.stop();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    console.log("Stopping Mongo replica set...");
    await replSet.stop();
    process.exit(0);
  });
} catch (err) {
  console.error("Failed to start replica set:", err);
  process.exit(1);
}
