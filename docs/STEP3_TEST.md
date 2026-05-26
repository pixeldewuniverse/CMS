# Step 3 Testing Guide — AI Ideas Generator + Review

## Setup

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local:
# MONGODB_URI=your_mongodb_uri
# ANTHROPIC_API_KEY=your_api_key

npm run db:setup
npm run dev
```

Visit: http://localhost:3000

---

## Flow to Test

### 1. Create a Brief
- Click "➕ New Brief" button
- Fill form:
  - **Name:** "Tech Product Q1"
  - **Product Name:** "CloudSync Pro"
  - **Target Audience:** "Software developers, startups"
  - **Goal:** "Increase product awareness and lead generation"
  - **Tone:** "Professional yet witty"
  - **Design Style:** "Modern"
  - **Colors:** Keep defaults or add custom
  - **Platforms:** Enable Instagram + LinkedIn (3x/week each)
- Click "Buat Brief"
- See toast: "Brief berhasil dibuat!"

### 2. Go to Dashboard
- Click "📊 Go to Dashboard" or visit `/dashboard`
- Should see your brief card in grid
- Click on brief card → Opens detail page

### 3. Generate Content Ideas
- On brief detail page, click "⚡ Generate Ideas" button
- Dialog appears: "How many ideas do you want? (max 10)"
- Click one of the buttons: 3, 5, or 10 ideas
- Status: "Generating..." (shows API call is happening)

**Expected:**
- Takes 10-30 seconds (Claude API latency)
- Toast appears: "Generated 5 new ideas! 🎉"
- Ideas list appears below with "Pending Review" section

### 4. Review & Approve Ideas
- Each idea shows:
  - **Topic** (title)
  - **Angle** (Behind-the-scenes, Tutorial, etc.)
  - **> / ▼** expand button for details
  
**Expand to see:**
  - Format (Carousel, Video, Static, Reel)
  - Platforms (instagram, linkedin, etc.)
  - Description (2-3 sentences)

**Actions:**
  - Click "✓ Approve" → Idea moves to "Approved" section (green checkmark)
  - Click "✕ Reject" → Idea moves to "Rejected" section (hidden after 3)

### 5. Generate More Ideas
- Click "⚡ Generate Ideas" again
- Each generation creates new ideas (doesn't replace old ones)
- Can approve/reject mix of ideas

---

## Data Flow Verification

### Check MongoDB

```bash
# In MongoDB console or Compass
use content-calendar

# See briefs
db.briefs.find()

# See ideas for that brief
db.contentIdeas.find({ briefId: "your-brief-id" })

# Count by status
db.contentIdeas.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

**Expected:**
- briefs: 1 document with all your info
- contentIdeas: 5+ documents with status: "suggested"
- After approval: some with status: "approved"

---

## API Endpoints to Test

### Create Brief
```bash
curl -X POST http://localhost:3000/api/briefs \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "name": "Test Brief",
    "productName": "Test Product",
    "targetAudience": "Test Audience",
    "goal": "Test Goal",
    "tone": "Professional",
    "platforms": {
      "instagram": { "enabled": true, "postFrequency": "3x/week" },
      "linkedin": { "enabled": true, "postFrequency": "3x/week" },
      "tiktok": { "enabled": false, "postFrequency": "3x/week" },
      "twitter": { "enabled": false, "postFrequency": "1x/week" },
      "facebook": { "enabled": false, "postFrequency": "1x/week" }
    },
    "colorPalette": ["#534AB7", "#0F6E56"],
    "designStyle": "Modern",
    "status": "active"
  }'
```

### List Briefs
```bash
curl http://localhost:3000/api/briefs?userId=user-123
```

### Get Brief Detail
```bash
curl http://localhost:3000/api/briefs/BRIEF_ID
```

### Generate Ideas
```bash
curl -X POST http://localhost:3000/api/ideas \
  -H "Content-Type: application/json" \
  -d '{
    "briefId": "BRIEF_ID",
    "ideaCount": 5
  }'
```

### List Ideas for Brief
```bash
curl http://localhost:3000/api/ideas?briefId=BRIEF_ID
```

### Approve Idea
```bash
curl -X PUT http://localhost:3000/api/ideas/IDEA_ID \
  -H "Content-Type: application/json" \
  -d '{ "status": "approved" }'
```

### Reject Idea
```bash
curl -X PUT http://localhost:3000/api/ideas/IDEA_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "rejectionReason": "Not relevant"
  }'
```

---

## Troubleshooting

### Error: "Failed to generate ideas"
- Check `.env.local` has valid `ANTHROPIC_API_KEY`
- Check API quota & rate limits
- Check console for detailed error

### Ideas not showing
- Check browser console (F12) for JavaScript errors
- Verify MongoDB has `contentIdeas` collection
- Check API response in Network tab

### Slow generation
- Normal: takes 10-30 seconds (Claude API latency)
- Use smaller count (3 instead of 10) for testing

### Toast notifications not showing
- Ensure `react-hot-toast` is in `node_modules`
- Check layout.tsx has `<Toaster />` component

---

## What Gets Generated

Example output from Claude:

```json
[
  {
    "topic": "Behind-the-Scenes: Developer Setup",
    "angle": "Behind-the-scenes",
    "format": "Video",
    "platforms": ["instagram", "tiktok"],
    "description": "Show developers how to set up CloudSync Pro in 60 seconds. Include quick tips and keyboard shortcuts. Perfect for reaching your developer audience with a casual, relatable vibe."
  },
  {
    "topic": "Case Study: Startup Success",
    "angle": "User story",
    "format": "Carousel",
    "platforms": ["linkedin"],
    "description": "Interview a startup using CloudSync Pro. Highlight their challenges, how they solved them, and results. Great for LinkedIn's professional audience and builds credibility."
  }
  // ... more ideas
]
```

---

## Next Steps After Testing

If step 3 works:
1. ✅ Briefs creation
2. ✅ Ideas generation with Claude
3. ✅ Review & approval workflow
4. ⏭️  **Step 4:** Generate captions + hashtags for approved ideas
5. ⏭️  **Step 5:** Generate visual briefs
6. ⏭️  **Step 6:** Manual design execution (Canva/Figma)
7. ⏭️  **Step 7:** Calendar management & scheduling
8. ⏭️  **Step 8:** Buffer/Later integration
9. ⏭️  **Step 9:** Analytics & loop back

---

## Code Architecture

```
App Flow:
/dashboard
  ↓ (click brief card)
/briefs/[id]
  ↓ (click "Generate Ideas")
POST /api/ideas
  ↓
generateContentIdeas() [Claude API]
  ↓
ideaRepository.create() [MongoDB]
  ↓
Return ideas to UI
  ↓
Display in IdeasList component
  ↓ (click approve/reject)
PUT /api/ideas/[id]
  ↓
ideaRepository.updateStatus() [MongoDB]
  ↓
Update UI
```

**Files involved:**
- `components/dashboard/BriefsList.tsx` — List briefs
- `app/briefs/[id]/page.tsx` — Brief detail + generate button
- `components/ideas/IdeasList.tsx` — Ideas review UI
- `lib/ai/generateIdeas.ts` — Claude API integration
- `lib/db/repositories.ts` — MongoDB operations
- `app/api/briefs/route.ts` — Brief CRUD
- `app/api/ideas/route.ts` — Ideas generation + listing
- `app/api/ideas/[id]/route.ts` — Idea approval/rejection
