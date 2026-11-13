import { MongoMemoryReplSet } from "mongodb-memory-server";

console.log("Starting MongoMemoryReplSet...");
const replset = await MongoMemoryReplSet.create({
  replSet: { count: 1, storageEngine: "wiredTiger" }
});
const uri = replset.getUri();
console.log("MongoMemoryReplSet started successfully!");
console.log("URI:", uri);
await replset.stop();
console.log("Stopped.");
