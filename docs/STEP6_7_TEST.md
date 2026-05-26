# Step 6 & 7 Testing Guide — Design Upload & Calendar Management

## What's New

### Step 6: Design Upload
- **Component**: `DesignUpload.tsx` — Drag & drop design upload
- **API**: `POST /api/content/upload` — Save image to disk
- **Storage**: Files saved to `public/uploads/`
- **Validation**: JPEG/PNG/WebP, max 5MB
- **Preview**: Before/after upload preview

### Step 7: Calendar Management
- **Component**: `ContentCalendar.tsx` — Monthly calendar view
- **Scheduling**: Set date, time, timezone for each post
- **Status**: Track draft vs scheduled posts
- **Overview**: List all posts with schedule info
- **API**: `POST/GET /api/content/schedule`

---

## Testing Flow

### 1. Setup
```bash
npm run dev
```

### 2. Create Complete Content
- Create brief (Instagram + LinkedIn)
- Generate 5 ideas
- Approve 2 ideas
- Generate captions (2 content pieces)
- Generate visual briefs
- ✓ Now ready for design upload

### 3. Upload Design (Step 6)

#### Via Drag & Drop:
1. Expand content piece
2. Scroll to "🖼️ Design Image" section
3. **Drag & drop** design image onto box
4. See preview
5. Click "📁 Choose Different File" if wrong
6. Upload happens automatically

#### Via Browse:
1. Click the drag & drop zone
2. File dialog opens
3. Select image (JPEG/PNG/WebP)
4. See preview
5. Upload automatic

**Validation:**
- ✓ Only JPEG, PNG, WebP (error: wrong format)
- ✓ Max 5MB (error: too large)
- ✓ File name shows in preview

**After Upload:**
- Toast: "Design uploaded! 🎉"
- Preview shown with image
- Image saved to `public/uploads/`
- Content piece status: `draft` (ready for scheduling)

### 4. View Calendar (Step 7)

On brief detail page, scroll to "📅 Calendar" section:

#### Calendar Features:
- **Month view**: Navigate with Prev/Next
- **Day cells**: Show scheduled posts (color-coded)
  - Yellow background: Draft status
  - Green background: Scheduled status
- **Current day**: Highlighted with blue border
- **Post indicator**: Platform name in cell (tap to edit)

#### Stats at Top:
- 📝 Draft count
- ✓ Scheduled count

#### Posts Overview Table:
- Platform name
- Post status (draft/scheduled)
- Caption preview
- Date & time
- Edit button

### 5. Schedule Posts

#### In Calendar:
1. Click on post in calendar (platform badge)
2. Edit form appears (blue section)
3. Change date (date picker)
4. Change time (time picker)
5. Click "✓ Schedule"
6. Toast: "Post scheduled! 📅"

#### In Overview:
1. Click "✎ Edit" button next to post
2. Same edit form appears
3. Update date/time
4. Click "✓ Schedule"

#### Validation:
- ✓ Can't schedule in past (error message)
- ✓ Timezone shown as "Asia/Jakarta (UTC+7)"
- ✓ Auto-adds to contentCalendars collection

### 6. Verify Data

MongoDB:
```bash
# Check design image uploaded
db.contentPieces.findOne({ _id: ObjectId("...") })
# Should show: designImage: { url: "/uploads/...", uploadedAt: ... }

# Check scheduled date
db.contentPieces.find({ 
  "scheduleInfo.status": "scheduled" 
}).pretty()

# Check calendar created
db.contentCalendars.findOne({ briefId: "..." })
# Should show schedule array with all posts
```

---

## File Upload Details

### Storage Location
```
public/uploads/
├── contentPieceId-platform-timestamp.jpg
├── contentPieceId-platform-timestamp.png
└── ...
```

### URL Format
```
/uploads/contentPieceId-platform-1716472200000.jpg
```

### Database Storage
```javascript
{
  _id: ObjectId("..."),
  // ... other fields
  designImage: {
    url: "/uploads/...",
    path: "/path/to/public/uploads/...",
    uploadedAt: Date
  },
  scheduleInfo: {
    scheduledDate: Date,
    scheduledTime: "14:30",
    timezone: "Asia/Jakarta",
    status: "draft" | "scheduled"
  }
}
```

---

## Calendar Data Structure

### contentCalendars Collection
```javascript
{
  _id: ObjectId,
  briefId: string,
  userId: string,
  month: 5,           // May
  year: 2025,
  schedule: [
    {
      contentPieceId: string,
      platform: "instagram",
      scheduledDate: Date,  // 2025-05-28
      scheduledTime: "10:00",
      status: "scheduled"
    },
    // ... more posts
  ],
  metadata: {
    createdAt: Date,
    updatedAt: Date
  }
}
```

---

## API Endpoints

### Upload Design
```
POST /api/content/upload (multipart/form-data)

Body:
- file: File (image)
- contentPieceId: string
- platform: string

Response:
{
  "filename": "...",
  "imageUrl": "/uploads/...",
  "message": "Design uploaded successfully"
}
```

### Schedule Post
```
POST /api/content/schedule

Body:
{
  "contentPieceId": string,
  "scheduledDate": "2025-05-28",
  "scheduledTime": "10:00",
  "briefId": string
}

Response:
{
  "message": "Post scheduled successfully"
}
```

### Get Calendar
```
GET /api/content/schedule?briefId=...&month=5&year=2025

Response:
{
  "schedule": [...]
}
```

---

## Flow Diagram

```
Content Piece (Created in Step 4)
    ↓
[Visual Brief Generated] (Step 5)
    ↓
[Design Upload] ← STEP 6
    ↓
Content with Image
    ↓
[Schedule in Calendar] ← STEP 7
    ↓
Draft → Scheduled
    ↓
Ready for Buffer/Later (Step 8)
```

---

## Troubleshooting

### Upload Issues

**"Only JPEG, PNG, WebP allowed"**
- Image format not supported
- Convert to JPEG/PNG first
- Or use JPEG from Canva export

**"File size max 5MB"**
- Image too large
- Compress in Canva
- Or use image compressor

**"Failed to upload design"**
- Check API endpoint working
- Check file permissions for `public/uploads/`
- Check console error details

### Calendar Issues

**"Cannot schedule posts in the past"**
- Date selected is before today
- Choose future date
- Check system clock

**Posts not appearing in calendar**
- Try refreshing page
- Check MongoDB has contentPieces
- Verify scheduleInfo.scheduledDate is set

**Schedule button not updating**
- Check API network request succeeded
- Verify contentPieceId is valid
- Check toast error message

---

## Next Steps After Testing

✅ Step 6 & 7 complete:
1. Design uploaded to disk
2. Posts scheduled in calendar
3. Ready for Buffer/Later integration (Step 8)

⏭️ **Step 8: Buffer/Later Integration**
- Connect Buffer/Later API
- Send scheduled posts to Buffer
- Auto-publish when time reaches
- Track performance

⏭️ **Step 9: Analytics Dashboard**
- Fetch performance data from platforms
- Show engagement metrics
- Loop back to optimize briefs

---

## Features Summary

### Step 6: Design Upload ✨
- Drag & drop interface
- Image preview
- File validation
- Save to disk
- Database tracking

### Step 7: Calendar Management ✨
- Monthly calendar view
- Schedule/reschedule posts
- Status tracking (draft/scheduled)
- Timezone awareness
- Posts overview list

---

## Tips

**For Designers Using Canva:**
1. Copy visual brief from Step 5
2. Open Canva
3. Create post using suggested template
4. Follow color & typography specs
5. Export as PNG/JPEG (1080x1080 for Instagram)
6. Upload via drag & drop

**For Scheduling Posts:**
- Schedule Instagram posts for 10 AM or 6 PM (peak times)
- Schedule LinkedIn posts for weekday mornings
- TikTok: multiple times per day
- Space posts 3-4 hours apart

**For Calendar Planning:**
- Plan full month at once
- Maintain consistent posting frequency
- Mix content types (carousel, video, static)
- Leave buffer time for trending content
