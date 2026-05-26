# Step 5 Testing Guide — Visual Brief Generation

## What's New

- **API Endpoint**: `POST /api/visual-brief` — Generate detailed visual briefs
- **AI Module**: `lib/ai/generateVisualBrief.ts` — Claude API untuk design briefs
- **Component**: `VisualBriefViewer.tsx` — Beautiful visual brief display
- **Integration**: ContentPiecesList dengan generate button

---

## Visual Brief Includes

Each generated brief has:
- **Title** — Brief summary
- **Visual Concept** — Overall design theme
- **Main Elements** — Specific design components
- **Color Strategy** — How to use brand colors
- **Typography** — Font recommendations (headings & body)
- **Layout & Composition** — Structure & arrangement
- **Key Visuals** — Important visual elements to include
- **Design Tips** — Tips for maximum engagement
- **Canva Template** (optional) — Suggested Canva template

---

## Testing Flow

### 1. Setup
```bash
npm run dev
```

### 2. Create Brief → Ideas → Content
- Create brief (Instagram + LinkedIn)
- Generate 5 ideas
- Approve 1 idea
- Generate captions (click "✨ Generate Content")
- See 2 content pieces created

### 3. Generate Visual Briefs
On brief detail page, expand content piece (click ▶):
- See caption + hashtags
- See "🎨 Generate Visual Brief" button
- Click button
- Status: "Generating..." (15-30 seconds)

**Expected:**
- Toast: "Visual brief generated! 🎨"
- Beautiful gradient blue/purple section appears
- Shows detailed visual brief

### 4. Explore Visual Brief
Click the header to collapse/expand:
- **Visual Concept** — Design theme/approach
- **Design Elements** — Specific components to include
- **Color Strategy** — How to use palette colors
- **Typography** — Font styles for headings & body
- **Layout** — How to arrange elements
- **Key Visuals** — Important visual elements
- **Design Tips** — Engagement optimization
- **Canva Template** — Suggested template (if applicable)
- **Copy Button** — Copy entire brief to clipboard

### 5. Use for Design

**For Canva users:**
- Copy brief
- Open Canva
- Create new post (Instagram, LinkedIn, etc.)
- Use suggested dimensions & template
- Follow color strategy & typography
- Include elements from brief

**For Figma users:**
- Copy brief
- Create frames matching dimensions
- Follow design specs
- Add elements listed

**For manual designers:**
- Copy brief
- Use as reference
- Follow color & typography specs
- Implement design tips

---

## Example Output

### Instagram Visual Brief

```
Title: Instagram Engagement-Focused Design

Visual Concept: Bold, eye-catching design optimized for feed scroll. 
Use high-contrast colors with product-centric imagery.

Design Elements:
- Product Hero Shot: Centered, clean background, 70% of image
- Brand Logo: Top-right corner, 20% opacity for subtlety
- Dynamic Overlay Text: Semi-transparent gradient, bottom third

Color Strategy: 
Use primary color (#534AB7) as accent for CTAs and highlights. 
Secondary color (#0F6E56) for depth and contrast. 
White space critical for readability.

Typography:
- Headings: Bold sans-serif, 60-80pt, high contrast
- Body: Regular sans-serif, 28-36pt, readable on small screens

Layout & Composition:
Pyramid composition with product at top, benefits flowing downward. 
Leave 15% margins on sides for mobile viewing.

Key Visual Elements:
- Product in natural lighting
- Lifestyle imagery showing use case
- Customer testimonial or result stat
- CTA button/link indicator

Design Tips:
→ Post at 10 AM or 6 PM for max engagement
→ Include 3-4 key colors max
→ Test on mobile - 80% of viewers use phones
→ Hook in first 1 second (above-the-fold)
→ Include faces/emotions when possible

Canva Template: Instagram Post (1080x1080) - Branded Template
```

### LinkedIn Visual Brief

```
Title: LinkedIn Professional Trust-Building Design

Visual Concept: Clean, professional design emphasizing credibility 
and industry expertise. Balanced text and imagery for thought leadership.

Design Elements:
- Executive Portrait: Left side, professional headshot
- Industry Icons: Representing key features/benefits
- Data Visualization: Chart or stat graphic, center-right
- Brand Mark: Subtle footer placement

Color Strategy:
Use professional blue (#534AB7) for primary elements.
Neutral grays for text. Green (#0F6E56) for positive indicators (growth, success).
Avoid oversaturation - clean aesthetic preferred.

Typography:
- Headings: Professional serif or clean sans-serif, 48pt
- Body: Clear sans-serif, 24pt, generous line-spacing

Layout & Composition:
Left-to-right reading flow. Title on top, supporting visuals below.
Include whitespace for professional appearance.

Key Visual Elements:
- Professional imagery
- Industry-relevant icons
- Success metrics/results
- Customer testimonials
- Company or team photos

Design Tips:
→ Include specific numbers/metrics (71% growth, etc)
→ Use professional imagery - avoid stock photos when possible
→ Include 2-3 CTA suggestions in caption
→ Keep text readable at small sizes
→ Professional tone reflected in visual style

Canva Template: LinkedIn Post (1200x628) - Corporate Template
```

---

## API Response Format

### Success
```json
{
  "contentPieceId": "...",
  "visualBrief": {
    "title": "Instagram Engagement-Focused Design",
    "description": "Bold, eye-catching design for feed scroll",
    "visualConcept": "Product hero with benefits flowing down",
    "mainElements": [
      {
        "name": "Product Hero Shot",
        "description": "Centered, clean background, 70% of image"
      },
      {
        "name": "Dynamic Overlay Text",
        "description": "Semi-transparent gradient, bottom third"
      }
    ],
    "colorStrategy": "Use primary as accent, secondary for depth",
    "typography": {
      "heading": "Bold sans-serif, 60-80pt",
      "body": "Regular sans-serif, 28-36pt"
    },
    "layout": "Pyramid composition with product at top",
    "keyVisuals": [
      "Product in natural lighting",
      "Lifestyle imagery",
      "Customer testimonial",
      "CTA indicator"
    ],
    "designTips": [
      "Post at 10 AM or 6 PM for max engagement",
      "Include 3-4 colors max",
      "Test on mobile - 80% use phones"
    ],
    "canvaTemplate": "Instagram Post (1080x1080) - Branded Template"
  },
  "message": "Visual brief generated successfully"
}
```

---

## Platform-Specific Dimensions

Automatically used in visual brief:

| Platform | Dimensions | Notes |
|----------|-----------|-------|
| Instagram | 1080x1080 | Square, feed-optimized |
| LinkedIn | 1200x628 | Landscape, professional |
| TikTok | 1080x1920 | Vertical, full-screen |
| Twitter | 1200x628 | Landscape, compact |
| Facebook | 1080x1080 | Square or 1200x628 landscape |

---

## MongoDB Update

`contentPieces` collection now includes detailed `visualBrief`:

```javascript
visualBrief: {
  description: string,
  visualConcept: string,
  mainElements: [
    { name: string, description: string }
  ],
  colorStrategy: string,
  typography: {
    heading: string,
    body: string
  },
  layout: string,
  keyVisuals: [string],
  designTips: [string],
  canvaTemplate: string,
  // ... plus original fields
}
```

---

## Troubleshooting

### Error: "Failed to generate visual brief"
- Check `ANTHROPIC_API_KEY`
- Check API quota/rate limits
- Check console for Claude error

### Visual brief not showing
- Ensure content piece was generated first
- Verify API request succeeded
- Check browser console (F12) for errors

### Slow generation (>60 sec)
- Normal: 15-30 seconds per brief
- If slower: network/rate limiting issue
- Try one brief at a time

### Canva template not suggesting
- Not all briefs will suggest templates
- Some briefs may suggest "use Canva's Instagram template"
- Optional field - not required

---

## Next Steps

After visual briefs generated:

1. ✅ Brief created
2. ✅ Ideas generated + approved
3. ✅ Captions generated
4. ✅ Visual briefs generated
5. ⏭️ **Step 6: Manual design execution** (Canva/Figma)
   - Designer uses brief to create visual
   - Can integrate Canva API (optional)
   - Upload completed design image
6. ⏭️ **Step 7: Calendar management**
   - Schedule posts by date/time
   - Calendar view
7. ⏭️ **Step 8: Buffer/Later integration**
   - Auto-post to platforms
8. ⏭️ **Step 9: Analytics dashboard**
   - Track performance
   - Loop back to improve briefs

---

## Summary

✅ Step 5 enables:
1. AI-generated design briefs
2. Platform-specific recommendations
3. Beautiful visual brief viewer
4. Copy-to-clipboard for designers
5. Canva template suggestions
6. Ready for design execution (step 6)

Design process is 90% automated - designer just needs to execute!
