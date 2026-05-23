# Step 8 Testing Guide — Buffer/Later Integration

## What's New

- **Buffer Service**: `lib/services/bufferService.ts` — BufferService class
- **Later Service**: `lib/services/bufferService.ts` — LaterService class
- **API Endpoint**: `POST /api/publish` — Send posts to Buffer/Later
- **Component**: `PublishButton.tsx` — Beautiful publish UI
- **Integration**: ContentPiecesList dengan publish button

---

## Prerequisites

### Get API Tokens

**Buffer:**
1. Go to [bufferapp.com](https://bufferapp.com)
2. Sign up / Log in
3. Settings → Apps → Personal Token
4. Copy access token
5. Connect social profiles to Buffer

**Later:**
1. Go to [later.com](https://later.com)
2. Sign up / Log in
3. Settings → API Keys
4. Copy API key
5. Connect social profiles

---

## Testing Flow

### 1. Setup Complete Content

Create workflow:
- Brief with platforms
- Generate ideas + approve
- Generate captions
- Generate visual briefs
- Upload design
- Schedule (set date & time)
- ✓ Ready to publish

### 2. Get API Token

**Buffer:**
- Settings → Apps → Personal Token
- Copy full token

**Later:**
- Account → API Keys
- Copy API key

### 3. Publish Post

On brief detail, expand content piece:

1. Click "🚀 Publish to Buffer/Later"
2. Paste API token
3. Select service (Buffer or Later)
4. Select profile (Buffer only)
5. Click "✓ Publish Now"
6. Toast: "Post sent to buffer! 🚀"

### 4. Verify in Buffer/Later

**Buffer:**
- bufferapp.com → Drafts/Queue
- Post appears with image + caption
- Scheduled time shown

**Later:**
- later.com → Content Calendar
- Post on scheduled date
- All details visible

---

## API Endpoints

### POST /api/publish

Send post to Buffer/Later.

**Body:**
```json
{
  "contentPieceId": "...",
  "publishService": "buffer" or "later",
  "accessToken": "your_token",
  "profileId": "for_buffer_only"
}
```

**Response:**
```json
{
  "success": true,
  "publishId": "buffer_id",
  "message": "Post scheduled to buffer"
}
```

### GET /api/publish?service=buffer&accessToken=...

Fetch profiles from Buffer.

**Response:**
```json
{
  "profiles": [
    { "id": "123", "service": "instagram", "service_type": "photo" }
  ]
}
```

---

## Component Props

**PublishButton**
```typescript
interface PublishButtonProps {
  contentPieceId: string;        // Required
  platform: string;              // "instagram", "linkedin", etc
  isScheduled?: boolean;         // Must be true to show button
  hasDesign?: boolean;           // Must be true to show button
  onPublishSuccess?: () => void; // Callback after publish
}
```

---

## Database Update

After publishing:
```javascript
scheduleInfo: {
  scheduledDate: Date,
  scheduledTime: "10:00",
  status: "published",         // ← changed
  bufferId: "buffer_id",       // ← added
  publishService: "buffer",    // ← added
  publishedAt: Date            // ← added
}
```

---

## Error Messages

**"Schedule post first"**
- Content not scheduled
- Use Step 7 to set date/time

**"Upload design first"**
- No design image
- Use Step 6 to upload

**"Enter access token"**
- Token field empty

**"Select a profile"**
- Buffer requires profile

**"No profiles found"**
- Invalid token
- Check Buffer/Later

**"Cannot publish posts in the past"**
- Schedule date is before now
- Reschedule to future date

---

## What Gets Sent

### To Buffer
```
Text: [caption + hashtags]
Image: [design URL from /uploads/]
Scheduled: [Unix timestamp]
Profile: [Buffer profile ID]
```

### To Later
```
Caption: [caption + hashtags]
Image: [design URL]
Date: [ISO date string]
Channels: [platform list]
```

---

## Complete Workflow

```
Brief → Ideas → Captions → Visual Briefs
    ↓
Design Upload (Step 6)
    ↓
Calendar Schedule (Step 7)
    ↓
Buffer/Later Publish (Step 8) ← HERE
    ↓
Posts in queue
    ↓
Auto-publish at time
    ↓
Posts go live! 🎉
```

---

## Tips

**Best Times to Post:**
- Instagram: 10 AM, 6 PM
- LinkedIn: 8-12 AM (weekdays)
- TikTok: Afternoon/evening
- Twitter: 8-10 AM, 5-7 PM

**Before Publishing:**
- ✓ Design looks good
- ✓ Caption engaging
- ✓ Hashtags relevant
- ✓ Optimal time
- ✓ High quality image

**Using Buffer/Later:**
- Can reschedule anytime
- Can pause/resume
- Can view analytics
- Buffer: free tier available
- Later: premium service
