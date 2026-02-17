# FitLink — Personal Measurement Vault

Store your body measurements once. Share a secure read-only link with any tailor.

---

## 🚀 Quick Start

### Step 1 — Clone and Install

```bash
git clone https://github.com/you/fitlink.git
cd fitlink
npm install
```

### Step 2 — Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Choose a region close to your users
3. Save your database password somewhere safe

### Step 3 — Run Database Schema

1. In Supabase dashboard → **SQL Editor**
2. Paste and run the contents of `/sql/schema.sql`
3. Verify tables were created under **Table Editor**

### Step 4 — Enable Phone Auth

1. Supabase dashboard → **Authentication → Providers**
2. Enable **Phone** provider
3. Choose SMS provider (Twilio recommended for Nigeria)
4. Enter your Twilio Account SID, Auth Token, and phone number

**Twilio Setup:**
```
1. Create account at twilio.com
2. Get a phone number (or use Twilio Messaging Service)
3. Copy: Account SID, Auth Token, Phone Number
4. Paste into Supabase Phone provider settings
```

### Step 5 — Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Where to find these:**
- Supabase dashboard → **Settings → API**
- `URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Never expose this!

### Step 6 — Run Locally

```bash
npm run dev
```

Open http://localhost:3000

---

## 📦 Project Structure

```
fitlink/
├── app/
│   ├── layout.tsx              # Root layout with fonts + CSP
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Tailwind base + utilities
│   ├── not-found.tsx           # 404 page
│   ├── create/
│   │   └── page.tsx            # Profile creation (phone OTP + PIN)
│   ├── measurements/
│   │   └── page.tsx            # Measurement input form
│   ├── m/[share_token]/
│   │   └── page.tsx            # Public read-only view for tailors
│   ├── unlock/[share_token]/
│   │   └── page.tsx            # PIN entry to unlock edit
│   ├── edit/[share_token]/
│   │   └── page.tsx            # Edit measurements (PIN protected)
│   └── delete/
│       └── page.tsx            # Delete account with confirmation
│
├── components/
│   ├── MeasurementCard.tsx     # Display measurements in large readable format
│   ├── ShareActions.tsx        # Copy, WhatsApp, Save as Image, Edit
│   └── EditForm.tsx            # Pre-filled edit form
│
├── actions/
│   └── index.ts                # All server actions (DB operations)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client (anon key)
│   │   └── server.ts           # Server Supabase client + service client
│   └── security/
│       └── index.ts            # Token gen, PIN hash, rate limiting, sanitization
│
├── types/
│   └── index.ts                # TypeScript interfaces
│
├── sql/
│   └── schema.sql              # Full Supabase schema with RLS policies
│
├── .env.example                # Environment variable template
├── next.config.js              # Security headers + CSP
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🔒 Security Architecture

| Layer | Implementation |
|-------|---------------|
| Auth | Supabase Phone OTP — no passwords |
| PIN Storage | bcrypt hash (cost=12) — never returned to client |
| Share Tokens | 288-bit cryptographic entropy, URL-safe base64 |
| Rate Limiting | 5 PIN attempts / 15 min per token |
| RLS | Row-level security on all tables |
| Server Actions | All DB access server-side only |
| Service Key | Never exposed to browser |
| Input Sanitization | All inputs validated + sanitized server-side |
| CSP Headers | Strict Content Security Policy |
| Cookies | httpOnly, secure, sameSite=strict |
| URLs | No sequential IDs — all tokens are random |

---

## 🌍 Deployment — Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial FitLink"
git remote add origin https://github.com/you/fitlink.git
git push -u origin main
```

### Step 2 — Import to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)

### Step 3 — Add Environment Variables

In Vercel project settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL        → your supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   → your anon key
SUPABASE_SERVICE_ROLE_KEY       → your service role key (mark as Secret)
NEXT_PUBLIC_APP_URL             → https://your-project.vercel.app
```

### Step 4 — Deploy

Click **Deploy**. Vercel handles everything else.

### Step 5 — Update Supabase Redirect URLs

1. Supabase → Authentication → URL Configuration
2. Add your Vercel URL to **Site URL** and **Redirect URLs**:
   ```
   https://your-project.vercel.app
   https://your-project.vercel.app/**
   ```

---

## 📱 User Flow

```
User                            Tailor
─────────────────────────       ──────────────────────
1. Visit /create
2. Enter phone → get OTP
3. Enter profile + 4-digit PIN
4. Enter measurements
5. Get share link              → 6. Receive link via WhatsApp
                                7. Open /m/[token]
                                8. See full measurements (read-only)
                                9. Save as image (optional)

10. If update needed:
    Visit /unlock/[token]
    Enter PIN
    Edit measurements at /edit/[token]
```

---

## 🎨 Design Decisions

**Why dark theme?** Works outdoors in bright sunlight. High contrast for tailors working in natural light.

**Why no animations?** Loads fast. Works on slow connections. No distractions for task-focused users.

**Why 4-digit PIN over password?** Easier to remember and enter on mobile. Rate-limited to prevent brute force.

**Why phone OTP?** West African market familiarity. No email required. Works on basic smartphones.

---

## ⚙️ Customization

### Change measurement units (cm → inches)
- Update field labels in `app/measurements/page.tsx` and `components/EditForm.tsx`
- Update hint text in `MeasurementCard.tsx`

### Add more measurement fields
- Add to `measurements` table in Supabase
- Add to the `FIELDS` arrays in measurement pages
- Add to `MeasurementInput` type in `types/index.ts`
- Add sanitization in `actions/index.ts`

### Change SMS provider
- Supabase supports: Twilio, Vonage, MessageBird, Textlocal
- Update in Supabase Auth settings — no code changes needed

---

## 🐛 Troubleshooting

**OTP not sending:**
- Check Twilio credentials in Supabase Auth settings
- Ensure phone number includes country code (+234...)
- Check Twilio console for error logs

**"Profile not found" on share page:**
- Token may be malformed — check URL
- Profile may have been deleted
- Check Supabase service role key is set correctly

**PIN not working after 5 attempts:**
- Rate limit resets after 15 minutes
- Check server logs if issue persists

**Save as image not working:**
- html2canvas requires CORS-safe images
- Works best on Chrome/Safari mobile
- Fallback: manual screenshot

---

## 📄 License

MIT — free to use, modify, and deploy.
