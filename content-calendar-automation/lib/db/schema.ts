// lib/db/schema.ts
// MongoDB Collections Schema

// ============ BRIEF ============
// Collection: briefs
interface BusinessBrief {
  _id?: string;
  userId: string;
  name: string; // "Tech Product Q2"
  description?: string;
  
  // Core info
  productName: string;
  productDescription: string;
  targetAudience: string; // "Tech-savvy millennials"
  goal: string; // "Increase engagement by 20%"
  tone: string; // "Professional yet witty"
  
  // Platform settings
  platforms: {
    instagram?: { enabled: boolean; postFrequency: string }; // "3x/week"
    linkedin?: { enabled: boolean; postFrequency: string };
    tiktok?: { enabled: boolean; postFrequency: string };
    twitter?: { enabled: boolean; postFrequency: string };
    facebook?: { enabled: boolean; postFrequency: string };
  };
  
  // Design preferences
  colorPalette: string[]; // ["#FF5733", "#33FF57"]
  brandGuidelines?: string; // Link atau deskripsi
  designStyle: string; // "Minimalist", "Bold", "Playful"
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "archived";
  
  // AI performance tracking
  lastPerformanceUpdate?: Date;
  averageEngagementRate?: number;
}

// ============ CONTENT IDEAS ============
// Collection: contentIdeas
interface ContentIdea {
  _id?: string;
  briefId: string;
  
  // Generated idea
  topic: string;
  angle: string; // "Behind-the-scenes", "Tutorial", "Trend"
  format: string; // "Carousel", "Video", "Static", "Reel"
  platforms: string[]; // ["instagram", "tiktok"]
  description: string; // Detailed brief
  
  // AI generation
  generatedBy: "claude-opus" | "claude-sonnet";
  generationPrompt?: string;
  
  // User curation
  status: "suggested" | "approved" | "rejected" | "used";
  approvedAt?: Date;
  rejectionReason?: string;
  notes?: string;
  
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    usageCount: number; // Berapa kali content idea ini dipake
  };
}

// ============ CONTENT PIECE ============
// Collection: contentPieces
interface ContentPiece {
  _id?: string;
  ideaId: string;
  briefId: string;
  
  // Platform-specific content
  platform: "instagram" | "linkedin" | "tiktok" | "twitter" | "facebook";
  
  // Caption & metadata
  caption: string;
  hashtags: string[]; // ["#innovation", "#tech"]
  mentions?: string[]; // ["@brand", "@user"]
  
  // Visual brief (untuk designer)
  visualBrief: {
    description: string;
    colorReferences: string[];
    styleNotes: string;
    dimensionPreset: string; // "1080x1080", "1080x1920", "1200x628"
    referenceLinks?: string[];
  };
  
  // Asset tracking
  designImage?: {
    url?: string; // Setelah upload ke storage
    uploadedAt?: Date;
    path?: string;
  };
  
  // Scheduling
  scheduleInfo: {
    scheduledDate: Date;
    scheduledTime: string; // "14:30"
    timezone: string; // "Asia/Jakarta"
    status: "draft" | "scheduled" | "posted" | "failed";
    bufferId?: string; // ID dari Buffer/Later
  };
  
  // Performance
  performance?: {
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
    reach: number;
    engagementRate: number;
    fetchedAt: Date;
  };
  
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
  };
}

// ============ CONTENT CALENDAR ============
// Collection: contentCalendars
interface ContentCalendar {
  _id?: string;
  briefId: string;
  userId: string;
  
  // Calendar metadata
  month: number; // 1-12
  year: number; // 2025
  
  // Content pieces scheduled in this month
  schedule: Array<{
    contentPieceId: string;
    platform: string;
    scheduledDate: Date;
    scheduledTime: string;
    status: "scheduled" | "posted" | "failed";
  }>;
  
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
}

// ============ PERFORMANCE DATA ============
// Collection: performanceAnalytics
interface PerformanceAnalytic {
  _id?: string;
  briefId: string;
  
  // Period
  period: {
    startDate: Date;
    endDate: Date;
  };
  
  // Aggregated stats per platform
  platformStats: {
    platform: string;
    totalPosts: number;
    totalEngagement: number;
    avgEngagementRate: number;
    topPost: {
      contentPieceId: string;
      engagement: number;
    };
  }[];
  
  // Overall insights
  summary: {
    bestPerformingTopic: string;
    bestPerformingFormat: string;
    bestPostingTime: string;
    topHashtags: string[];
  };
  
  // AI recommendations for next brief
  aiRecommendations: string[];
  
  metadata: {
    generatedAt: Date;
  };
}

// ============ USER ============
// Collection: users
interface User {
  _id?: string;
  email: string;
  name: string;
  password: string; // Hashed
  
  // Preferences
  timezone: string;
  defaultPlatforms: string[];
  
  // Integration tokens (encrypted)
  integrations?: {
    buffer?: { accessToken: string };
    later?: { apiKey: string };
    canva?: { accessToken: string };
  };
  
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
  };
}

// ============ EXPORTS ============
export type {
  BusinessBrief,
  ContentIdea,
  ContentPiece,
  ContentCalendar,
  PerformanceAnalytic,
  User,
};
