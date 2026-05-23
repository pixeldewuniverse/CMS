// scripts/setup-db.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "content-calendar";

async function setupDatabase() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not set in .env.local");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("🔗 Connecting to MongoDB...");
    await client.connect();
    const db = client.db(DB_NAME);

    // Create collections
    console.log("📦 Creating collections...");
    const collections = [
      "briefs",
      "contentIdeas",
      "contentPieces",
      "contentCalendars",
      "performanceAnalytics",
      "users",
    ];

    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`✅ Collection created: ${collectionName}`);
      } catch (error: any) {
        if (error.code === 48) {
          console.log(`⏭️  Collection already exists: ${collectionName}`);
        } else {
          throw error;
        }
      }
    }

    // Create indexes
    console.log("\n🔑 Creating indexes...");

    // briefs indexes
    await db.collection("briefs").createIndex({ userId: 1 });
    await db.collection("briefs").createIndex({ status: 1 });
    console.log("✅ briefs indexes created");

    // contentIdeas indexes
    await db.collection("contentIdeas").createIndex({ briefId: 1 });
    await db.collection("contentIdeas").createIndex({ status: 1 });
    await db.collection("contentIdeas").createIndex({ briefId: 1, status: 1 });
    console.log("✅ contentIdeas indexes created");

    // contentPieces indexes
    await db.collection("contentPieces").createIndex({ briefId: 1 });
    await db
      .collection("contentPieces")
      .createIndex({ "scheduleInfo.status": 1 });
    await db
      .collection("contentPieces")
      .createIndex({ "scheduleInfo.scheduledDate": 1 });
    await db
      .collection("contentPieces")
      .createIndex({ platform: 1, "scheduleInfo.scheduledDate": 1 });
    console.log("✅ contentPieces indexes created");

    // contentCalendars indexes
    await db.collection("contentCalendars").createIndex({ briefId: 1 });
    await db
      .collection("contentCalendars")
      .createIndex({ briefId: 1, month: 1, year: 1 });
    console.log("✅ contentCalendars indexes created");

    // performanceAnalytics indexes
    await db.collection("performanceAnalytics").createIndex({ briefId: 1 });
    await db
      .collection("performanceAnalytics")
      .createIndex({ "period.startDate": 1 });
    console.log("✅ performanceAnalytics indexes created");

    // users indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    console.log("✅ users indexes created");

    console.log("\n✨ Database setup completed successfully!");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

setupDatabase();
