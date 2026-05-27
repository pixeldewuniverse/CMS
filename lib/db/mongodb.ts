// lib/db/mongodb.ts
import { MongoClient, Db } from "mongodb";

const DB_NAME = "content-calendar";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectMongoDB(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI tidak didefinisikan di environment variables");
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db(DB_NAME);
  return cachedDb;
}

export async function closeMongoDB(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}
