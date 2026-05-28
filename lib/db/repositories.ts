// lib/db/repositories.ts
import { ObjectId } from "mongodb";
import { connectMongoDB } from "./mongodb";
import type {
  BusinessBrief,
  ContentIdea,
  ContentPiece,
  ContentCalendar,
  User,
} from "./schema";

// ============ BRIEF REPOSITORY ============
export const briefRepository = {
  async create(brief: Omit<BusinessBrief, "_id">): Promise<BusinessBrief> {
    const db = await connectMongoDB();
    const result = await db.collection("briefs").insertOne({
      ...brief,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { _id: result.insertedId.toString(), ...brief } as BusinessBrief;
  },

  async findById(id: string): Promise<BusinessBrief | null> {
    if (!ObjectId.isValid(id)) return null;
    const db = await connectMongoDB();
    return db
      .collection<BusinessBrief>("briefs")
      .findOne({ _id: new ObjectId(id) as any });
  },

  async findByUserId(userId: string): Promise<BusinessBrief[]> {
    const db = await connectMongoDB();
    return db
      .collection<BusinessBrief>("briefs")
      .find({ userId, status: "active" })
      .sort({ createdAt: -1 })
      .toArray();
  },

  async update(
    id: string,
    updates: Partial<BusinessBrief>
  ): Promise<BusinessBrief | null> {
    if (!ObjectId.isValid(id)) return null;
    const db = await connectMongoDB();
    const result = await db.collection("briefs").findOneAndUpdate(
      { _id: new ObjectId(id) as any },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );
    return result as BusinessBrief | null;
  },

  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const db = await connectMongoDB();
    const result = await db
      .collection("briefs")
      .updateOne(
        { _id: new ObjectId(id) as any },
        { $set: { status: "archived", updatedAt: new Date() } }
      );
    return result.modifiedCount > 0;
  },
};

// ============ CONTENT IDEA REPOSITORY ============
export const ideaRepository = {
  async create(idea: Omit<ContentIdea, "_id">): Promise<ContentIdea> {
    const db = await connectMongoDB();
    const result = await db.collection("contentIdeas").insertOne({
      ...idea,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
      },
    });
    return { _id: result.insertedId.toString(), ...idea } as ContentIdea;
  },

  async findByBriefId(briefId: string): Promise<ContentIdea[]> {
    const db = await connectMongoDB();
    return db
      .collection<ContentIdea>("contentIdeas")
      .find({ briefId })
      .sort({ "metadata.createdAt": -1 })
      .toArray();
  },

  async findApprovedIdeas(briefId: string): Promise<ContentIdea[]> {
    const db = await connectMongoDB();
    return db
      .collection<ContentIdea>("contentIdeas")
      .find({ briefId, status: "approved" })
      .toArray();
  },

  async findById(id: string): Promise<ContentIdea | null> {
    if (!ObjectId.isValid(id)) return null;
    const db = await connectMongoDB();
    return db
      .collection<ContentIdea>("contentIdeas")
      .findOne({ _id: new ObjectId(id) as any });
  },

  async updateStatus(
    id: string,
    status: ContentIdea["status"],
    reason?: string
  ): Promise<ContentIdea | null> {
    if (!ObjectId.isValid(id)) return null;
    const db = await connectMongoDB();
    const updateData: any = { status, "metadata.updatedAt": new Date() };
    if (status === "approved") updateData.approvedAt = new Date();
    if (status === "rejected") updateData.rejectionReason = reason;

    const result = await db.collection("contentIdeas").findOneAndUpdate(
      { _id: new ObjectId(id) as any },
      { $set: updateData },
      { returnDocument: "after" }
    );
    return result as ContentIdea | null;
  },
};

// ============ CONTENT PIECE REPOSITORY ============
export const contentRepository = {
  async create(content: Omit<ContentPiece, "_id">): Promise<ContentPiece> {
    const db = await connectMongoDB();
    const result = await db.collection("contentPieces").insertOne({
      ...content,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return { _id: result.insertedId.toString(), ...content } as ContentPiece;
  },

  async findByBriefId(briefId: string): Promise<ContentPiece[]> {
    const db = await connectMongoDB();
    return db
      .collection<ContentPiece>("contentPieces")
      .find({ briefId })
      .sort({ "scheduleInfo.scheduledDate": 1 })
      .toArray();
  },

  async findScheduled(
    briefId: string,
    status: "scheduled" | "draft" | "posted"
  ): Promise<ContentPiece[]> {
    const db = await connectMongoDB();
    return db
      .collection<ContentPiece>("contentPieces")
      .find({
        briefId,
        "scheduleInfo.status": status,
      })
      .toArray();
  },

  async updateScheduleStatus(
    id: string,
    status: "draft" | "scheduled" | "posted" | "failed",
    bufferId?: string
  ): Promise<ContentPiece | null> {
    if (!ObjectId.isValid(id)) return null;
    const db = await connectMongoDB();
    const updateData: any = {
      "scheduleInfo.status": status,
      "metadata.updatedAt": new Date(),
    };
    if (status === "posted") updateData["metadata.publishedAt"] = new Date();
    if (bufferId) updateData["scheduleInfo.bufferId"] = bufferId;

    const result = await db.collection("contentPieces").findOneAndUpdate(
      { _id: new ObjectId(id) as any },
      { $set: updateData },
      { returnDocument: "after" }
    );
    return result as ContentPiece | null;
  },

  async updatePerformance(
    id: string,
    performance: ContentPiece["performance"]
  ): Promise<ContentPiece | null> {
    if (!ObjectId.isValid(id)) return null;
    const db = await connectMongoDB();
    const result = await db.collection("contentPieces").findOneAndUpdate(
      { _id: new ObjectId(id) as any },
      {
        $set: {
          performance,
          "metadata.updatedAt": new Date(),
        },
      },
      { returnDocument: "after" }
    );
    return result as ContentPiece | null;
  },
};

// ============ CALENDAR REPOSITORY ============
export const calendarRepository = {
  async findOrCreate(
    briefId: string,
    userId: string,
    month: number,
    year: number
  ): Promise<ContentCalendar> {
    const db = await connectMongoDB();
    let calendar = await db.collection<ContentCalendar>("contentCalendars").findOne({
      briefId,
      month,
      year,
    });

    if (!calendar) {
      const now = new Date();
      const newCalendar = {
        briefId,
        userId,
        month,
        year,
        schedule: [] as ContentCalendar["schedule"],
        metadata: { createdAt: now, updatedAt: now },
      };
      const result = await db.collection("contentCalendars").insertOne(newCalendar);
      calendar = { _id: result.insertedId.toString(), ...newCalendar } as any;
    }

    return calendar as unknown as ContentCalendar;
  },

  async addToSchedule(
    calendarId: string,
    contentPieceId: string,
    platform: string,
    scheduledDate: Date,
    scheduledTime: string
  ): Promise<ContentCalendar | null> {
    if (!ObjectId.isValid(calendarId)) return null;
    const db = await connectMongoDB();
    const result = await db.collection("contentCalendars").findOneAndUpdate(
      { _id: new ObjectId(calendarId) as any },
      {
        $push: {
          schedule: {
            contentPieceId,
            platform,
            scheduledDate,
            scheduledTime,
            status: "scheduled",
          },
        } as any,
        $set: { "metadata.updatedAt": new Date() },
      },
      { returnDocument: "after" }
    );
    return result as ContentCalendar | null;
  },
};

// ============ USER REPOSITORY ============
export const userRepository = {
  async create(user: Omit<User, "_id">): Promise<User> {
    const db = await connectMongoDB();
    const result = await db.collection("users").insertOne({
      ...user,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return { _id: result.insertedId.toString(), ...user } as User;
  },

  async findByEmail(email: string): Promise<User | null> {
    const db = await connectMongoDB();
    return db.collection<User>("users").findOne({ email });
  },

  async findById(id: string): Promise<User | null> {
    if (!ObjectId.isValid(id)) return null;
    const db = await connectMongoDB();
    return db.collection<User>("users").findOne({ _id: new ObjectId(id) as any });
  },
};
