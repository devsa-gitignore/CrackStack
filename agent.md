AR CLOTH TRY-ON
Hackathon Project — Team Technical Brief
React Frontend  •  Node.js Backend  •  Python ML Service

1. Project Overview
An AR-powered virtual cloth try-on web application. Users upload a garment image, crop it, remove the background, and see it rendered on their body in real-time via webcam or on a static uploaded photo. The system also uses AI to classify the garment, find similar products across shopping sites, suggest outfits, and analyze trends.

Core User Flow
1.	Upload garment image
2.	Crop region of interest (react-easy-crop)
3.	Remove background → clean transparent PNG
4.	AI classifies cloth type (FashionCLIP + Claude Vision)
5.	Select Live Camera or Upload Photo mode
6.	MediaPipe Pose detects body landmarks
7.	Template system + perspective warp renders cloth on body
8.	AI sidebar shows: similar products, style suggestions, trend analysis



2. AR Pipeline & Math
Stage 1 — MediaPipe Landmarks
MediaPipe Pose returns 33 normalized landmarks (x, y in 0–1 range). The 6 key landmarks used:

Index	Landmark	Used For
11	LEFT_SHOULDER	Cloth anchor, width calculation
12	RIGHT_SHOULDER	Cloth anchor, width calculation
23	LEFT_HIP	Torso height calculation
24	RIGHT_HIP	Torso height calculation
13	LEFT_ELBOW	Optional: sleeve fitting
14	RIGHT_ELBOW	Optional: sleeve fitting


Stage 2 — Key Computed Values
shoulderWidth = distance(LEFT_SHOULDER, RIGHT_SHOULDER)
torsoHeight   = distance(shoulderMid, hipMid)
angle         = Math.atan2(RS.y - LS.y, RS.x - LS.x)  // shoulder tilt
anchorX       = (LS.x + RS.x) / 2
anchorY       = shoulderMid.y + (template.yOffset * torsoHeight)


Stage 3 — Template System
Each cloth type has a preset that controls how the PNG maps onto the body. This is the core of the fitting logic.

Type	widthMult	heightMult	topWidthMult	botWidthMult	yOffset
tshirt	1.25	1.45	1.25	1.10	0.02
shirt	1.30	1.55	1.30	1.12	0.02
jacket	1.45	1.65	1.45	1.30	0.00
kurta	1.30	1.90	1.30	1.20	0.02

topWidthMult > botWidthMult creates a trapezoid shape that mimics fabric draping and adds a perspective illusion.


Stage 4 — Perspective Trapezoid Warp
A flat PNG on a body looks like a sticker. The warp converts it to a trapezoid using affine transform + triangle subdivision on HTML Canvas.

// 4 destination corners
TL: (anchorX - topW/2,  anchorY)
TR: (anchorX + topW/2,  anchorY)
BR: (anchorX + botW/2,  anchorY + clothHeight)
BL: (anchorX - botW/2,  anchorY + clothHeight)

// Split into 2 triangles, apply affine transform per triangle
// ctx.transform(a, b, c, d, e, f) maps source → destination


Stage 5 — Smoothing (Jitter Fix)
Raw MediaPipe output jitters every frame. Apply exponential smoothing with alpha = 0.35:

smoothed[i].x = 0.35 * current[i].x + 0.65 * previous[i].x
smoothed[i].y = 0.35 * current[i].y + 0.65 * previous[i].y

// Lower alpha = smoother but more lag
// Higher alpha = more responsive but jittery


What Makes It Look Realistic

Technique	Effect
Trapezoid warp	Fabric draping illusion
botWidth < topWidth	Waist taper / perspective depth
Shoulder angle rotation	Tracks body tilt naturally
Exponential smoothing	No jitter in live camera mode
yOffset per template	Collar sits at correct height
PNG transparency	Clean edges, no white box



3. AI Features (4 Total)
Feature 0 — Cloth Type Classification
Runs automatically after background removal. Uses two layers:
•	FashionCLIP (primary): zero-shot classification, runs locally on Python backend, no API cost
•	Claude Vision (fallback): sends PNG to Claude API if CLIP confidence is low
•	Manual override: user can always correct the detected type

// FashionCLIP — Python
labels  = ['tshirt', 'shirt', 'jacket', 'kurta', 'hoodie', 'dress']
inputs  = processor(text=labels, images=image, return_tensors='pt')
probs   = model(**inputs).logits_per_image.softmax(dim=1)
result  = labels[probs.argmax()]  // e.g. 'jacket'


Feature 1 — Similar Cloth Finder (Shop by Look)
After try-on, user sees budget / mid / premium alternatives from real shopping sites.
•	FashionCLIP generates a text description of the garment (color, style, pattern)
•	Description sent to Tavily Search API via Node.js backend
•	Returns real product URLs from Myntra, H&M, Zara, Amazon, etc.
•	Claude Vision (with web_search tool) used as fallback for richer results

// Node.js backend — /api/find-similar
POST https://api.tavily.com/search
{
  query: 'navy blue slim fit tshirt buy online India under 500',
  max_results: 5,
  search_depth: 'basic'
}


Feature 2 — Personalised Style Suggestions
Builds a session-based style profile from everything the user tries on, then generates personalised outfit recommendations.
•	Tracks: tried-on items, preferred colors, cloth types, body type (optional user input)
•	Sends profile + current cloth to Claude API
•	Returns: outfit pairings, color alternatives, occasion suggestions, one style upgrade tip
•	Gets smarter the more items the user tries on in the session

// Style profile built from session
styleProfile = {
  triedOn: ['navy tshirt', 'black jacket'],
  preferredColors: ['navy', 'black'],
  clothTypes: ['casual'],
}


Feature 3 — Design & Trend Analysis
Analyzes the garment's design language and maps it to current fashion trends using live web search.
•	Claude Vision + web_search tool (built into Claude API — no separate search key needed)
•	Returns: design language, 2025 trend match, style icon reference, what's trending in that category now

// Returns JSON
{
  design_language: 'minimalist streetwear',
  trend_match: 'quiet luxury 2025',
  style_icon: 'Zendaya',
  trending_now: ['earth tones', 'oversized fits', 'clean silhouettes']
}



4. Full Tech Stack
Frontend (React)
Library	Purpose
react-easy-crop	Cloth image cropping UI
@mediapipe/pose	Body landmark detection (runs in browser, no server needed)
HTML5 Canvas API	Cloth rendering + warp transforms
fabric.js (optional)	Advanced canvas manipulation
Tailwind CSS	Styling


Backend (Node.js)
Library / Service	Purpose
Express.js	API server
Anthropic SDK	Claude Vision + web_search for features 1–3
Tavily API	Web search for similar product URLs
axios / node-fetch	HTTP client for external APIs
multer	File upload handling
dotenv	API key management


Python ML Service
Library	Purpose
FastAPI	ML microservice server
rembg	Background removal (runs locally, free)
transformers (HuggingFace)	FashionCLIP model
torch	Model inference
Pillow	Image processing


External APIs
API	Free Tier	Used For
Claude API (Anthropic)	$5 free credits on signup	Vision, style suggestions, trend analysis, web search
Tavily Search API	1000 searches/month free	Real product URLs from shopping sites
remove.bg (optional)	50 free/month	Background removal fallback (rembg preferred)



5. System Architecture

Browser (React)
  │
  ├── MediaPipe Pose     → runs entirely in browser (WASM)
  ├── Canvas Renderer    → warp + overlay, 60fps
  └── API calls          → Node.js backend
                              │
           Node.js Backend    ├── /api/remove-bg      → Python service (rembg)
                              ├── /api/classify       → Python service (FashionCLIP)
                              ├── /api/find-similar   → Tavily API
                              ├── /api/style-suggest  → Claude API
                              └── /api/trend-analysis → Claude API + web_search
                                          │
                         Python ML Service (FastAPI)
                              ├── POST /remove-bg     → rembg
                              └── POST /classify      → FashionCLIP



6. Codebase Structure

ar-tryon/
├── frontend/                     (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClothUploader.jsx     // upload + crop
│   │   │   ├── ClothTypeSelector.jsx // type override UI
│   │   │   ├── PoseDetector.jsx      // MediaPipe setup
│   │   │   ├── CanvasRenderer.jsx    // warp + draw loop
│   │   │   ├── ARView.jsx            // live camera mode
│   │   │   ├── PhotoFallback.jsx     // static image mode
│   │   │   └── AISidebar.jsx         // features 1-3 display
│   │   ├── hooks/
│   │   │   ├── usePose.js            // landmark extraction + smoothing
│   │   │   ├── useCloth.js           // cloth state management
│   │   └── utils/
│   │       ├── landmarks.js          // keypoint math
│   │       ├── warp.js               // trapezoid transform
│   │       └── templates.js          // per-type ratios
│   └── package.json
├── backend/                      (Node.js + Express)
│   ├── routes/
│   │   ├── removeBackground.js
│   │   ├── classify.js
│   │   ├── findSimilar.js        // Tavily search
│   │   ├── styleSuggest.js       // Claude API
│   │   └── trendAnalysis.js      // Claude + web_search
│   ├── server.js
│   └── .env
└── ml-service/                   (Python + FastAPI)
    ├── main.py
    ├── rembg_service.py
    └── fashionclip_service.py



7. AI Fallback Strategy
Every AI feature has a fallback so the demo never crashes, even if an API hits rate limits.

Feature	Primary	Fallback 1	Fallback 2
Cloth classification	FashionCLIP (local)	Claude Vision API	Manual user selection
Background removal	rembg (local)	remove.bg API	—
Similar products	Claude + web_search	Tavily + FashionCLIP desc	—
Style suggestions	Claude API	Groq (Llama 3.3, free)	—
Trend analysis	Claude + web_search	Gemini Flash 2.0 (free)	—

Groq API and Gemini Flash 2.0 are both free tier, require only API key signup, and are drop-in replacements.



8. Demo Talking Points

One-line pitch
"We normalize garments into template-based representations and dynamically map them onto user body landmarks using real-time pose estimation."


Key judge impressers
•	AI at two layers: FashionCLIP for visual intelligence, Claude for reasoning + live web search
•	Perspective warp (not just a sticker overlay) — most AR try-on demos don’t do this
•	Fully functional fallback: demo works on uploaded photo if camera fails
•	Three AI features beyond the core AR: shop by look, personal styling, trend DNA
•	No vendor lock-in: every AI component has a free fallback



9. Recommended Build Order

9.	Python ML service: rembg + FashionCLIP endpoints
10.	React: upload → crop → type selector UI
11.	MediaPipe Pose setup + landmark extraction in browser
12.	Canvas renderer: flat PNG overlay first, then add warp
13.	Photo fallback mode (MediaPipe on static image)
14.	Node.js backend: wire up all API routes
15.	AI features: similar products → style → trend (in that order)
16.	Polish: smoothing, warp tuning, UI refinement

Core AR (steps 1–5) must be solid before touching AI features. A smooth try-on with no AI beats a broken try-on with all features.


Extra features for user interaction :
Create and share a wardrobe like pinterest board. ->
	we will need models for user , saved images (multer) therefore mongoDB suitable.
Share images of the AR tryon directly on socials.
Resize as per the user's dimensions and calculate and give the exact dimensions required for the garment. This goes to the AI for finding the exact or similar.
Good luck. Build the AR first. Ship the AI second.


