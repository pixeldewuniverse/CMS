# Step 4 Testing Guide — Caption + Hashtag Generation

## What's New

- **API Endpoint**: `POST /api/content` — Generate captions per platform
- **AI Module**: `lib/ai/generateCaption.ts` — Claude API for smart captions
- **Component**: `ContentPiecesList.tsx` — Display generated content
- **Brief Page Update**: Content section with platform-specific captions

---

## Flow

```
Approved Idea
    ↓
Click "✨ Generate Content" (on approved idea)
    ↓
POST /api/content { ideaId, briefId }
    ↓
Server fetches Brief + Idea
    ↓
generateCaptionsForAllPlatforms()
    ↓
For each enabled platform:
  - Claude generates caption (platform-specific tone)
  - Parse hashtags
  - Validate character limits
    ↓
Create ContentPiece per platform
    ↓
Save to MongoDB (contentPieces collection)
    ↓
Update Idea status to "used"
    ↓
Return content pieces
    ↓
UI shows generated content
```

---

## Testing Steps

### 1. Setup
```bash
npm run dev
```

### 2. Create Brief + Ideas
- Go to `/dashboard`
- Create brief with multiple platforms (Instagram + LinkedIn enabled)
- Generate 5 ideas
- Approve 1-2 ideas

### 3. Generate Content
- On brief detail page, find approved idea
- Click "✨ Generate Content" button
- Status: "Generating..." (10-30 seconds)

**Expected:**
- Toast: "Generated 2 content pieces! ✨"
- New section "Generated Content" appears
- Shows 2 cards (Instagram + LinkedIn)

### 4. Review Generated Content
- Expand each card (click ▶)
- See:
  - **Full Caption**: Platform-specific text
  - **Hashtags**: Relevant tags
  - **Visual Brief**: Dimensions, style notes
  - **Schedule**: Default date/time

### 5. Verify Data
MongoDB:
```bash
# Check content pieces created
db.contentPieces.find({ briefId: "..." })

# Count by platform
db.contentPieces.aggregate([
  { $group: { _id: "$platform", count: { $sum: 1 } } }
])

# Check idea status changed to "used"
db.contentIdeas.findOne({ _id: ObjectId("...") })
# Should show: status: "used"
```

---

## Expected Output

### Instagram Caption
```
Tone: Engaging, casual, emoji-friendly
Char limit: 2200
Example:
"Introducing CloudSync Pro 🚀 The easiest way to keep your team synced, no matter where you are. From remote offices to hybrid teams, we've got you covered 💼

🔗 Link in bio to get started today!

#CloudSync #TeamProductivity #RemoteWork #SoftwareTools #StartupLife"
```

### LinkedIn Caption
```
Tone: Professional, thought-leadership
Char limit: 3000
Example:
"In today's distributed work environment, having the right tools can make all the difference.

That's why we built CloudSync Pro—designed specifically for teams that care about staying connected and productive.

Key features:
✓ Real-time collaboration
✓ Seamless integrations
✓ Enterprise-grade security

Ready to transform how your team works together? Discover CloudSync Pro today.

What challenges are you facing with team collaboration? 👇"
```

### TikTok (if enabled)
```
Tone: Casual, Gen-Z, short
Char limit: 150
Example:
"POV: Your team is actually in sync 📱✨
CloudSync Pro makes collab so easy 🚀
(No more chaos emails 📧)
#TechTools #ProductivityHack #StartupLife"
```

---

## Platform-Specific Behavior

| Platform | Tone | Char Limit | Notes |
|----------|------|-----------|-------|
| Instagram | Engaging, emoji-friendly | 2200 | Captions can be long |
| LinkedIn | Professional, thought-leadership | 3000 | Can discuss benefits |
| TikTok | Casual, Gen-Z, short | 150 | Hook important |
| Twitter | Witty, concise | 280 | Can be threaded |
| Facebook | Community-focused | 1000 | Storytelling |

Each platform gets unique caption based on audience & tone.

---

## API Response Format

### Success
```json
{
  "count": 2,
  "contentPieces": [
    {
      "_id": "...",
      "ideaId": "...",
      "briefId": "...",
      "platform": "instagram",
      "caption": "...",
      "hashtags": ["#tag1", "#tag2"],
      "visualBrief": {
        "description": "",
        "colorReferences": ["#534AB7", "#0F6E56"],
        "styleNotes": "Modern style for CloudSync Pro",
        "dimensionPreset": "1080x1080"
      },
      "scheduleInfo": {
        "scheduledDate": "2025-05-23T...",
        "scheduledTime": "10:00",
        "timezone": "Asia/Jakarta",
        "status": "draft"
      },
      "metadata": {
        "createdAt": "...",
        "updatedAt": "..."
      }
    },
    // LinkedIn piece...
  ]
}
```

---

## Troubleshooting

### Error: "Idea must be approved before generating content"
- Idea status is still "suggested"
- Click "✓ Approve" first
- Then click "✨ Generate Content"

### Error: "Failed to generate content"
- Check `ANTHROPIC_API_KEY`
- Check API quota/limits
- Check console for Claude API error

### No captions generated
- Ensure platforms are enabled in brief
- Check `generatingContent` state
- Verify API request has valid `ideaId` and `briefId`

### Wrong caption tone
- Check Brief tone setting
- Platform-specific tone overrides brief tone
- Can edit caption manually later (step 5)

### Hashtags missing
- Claude might not include hashtags if disabled
- Can manually add in caption editor (step 5)

---

## Manual Content Editing

After generation:
- Click "✎ Edit Caption" → Manual edit form (future step)
- Click "🎨 Visual Brief" → Refine visual brief (future step)

For now, captions are ready for next steps.

---

## Next: Step 5

**Visual Brief Generation**
- Generate detailed design briefs for each platform
- Include style notes, color references, dimensions
- Integration with Canva API (optional)

**Step 5 will:**
1. Take approved content piece
2. AI generates detailed visual brief
3. Outputs brief for designer
4. Can be exported to Canva template

---

## Code Files Updated

- `lib/ai/generateCaption.ts` — NEW
- `app/api/content/route.ts` — NEW
- `app/api/content/[id]/route.ts` — NEW
- `components/content/ContentPiecesList.tsx` — NEW
- `app/briefs/[id]/page.tsx` — UPDATED (add content section + handler)
- `components/ideas/IdeasList.tsx` — UPDATED (add generate button)

---

## MongoDB Collections

### contentPieces (new data created)
```
{
  _id: ObjectId,
  ideaId: string (ref to contentIdeas),
  briefId: string (ref to briefs),
  platform: "instagram" | "linkedin" | "tiktok" | "twitter" | "facebook",
  
  caption: string,
  hashtags: [string],
  
  visualBrief: {
    description: string,
    colorReferences: [string],
    styleNotes: string,
    dimensionPreset: string
  },
  
  scheduleInfo: {
    scheduledDate: Date,
    scheduledTime: string,
    timezone: string,
    status: "draft" | "scheduled" | "posted"
  },
  
  metadata: {
    createdAt: Date,
    updatedAt: Date
  }
}
```

---

## Idea Status Flow

```
Suggested → Approved → Generate Content → Used (marked)

Only "approved" ideas can generate content.
After generation, idea status changes to "used".
```

---

## Summary

✅ Step 4 enables:
1. Smart AI captions per platform
2. Character limit enforcement
3. Platform-specific tone matching
4. Automatic hashtag generation
5. Content piece creation
6. Ready for scheduling (step 7)
