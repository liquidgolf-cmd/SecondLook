# SecondLook

A calm digital safety companion for seniors. Nora — powered by Claude — helps spot unusual patterns in messages, texts, and emails before you act.

> "Double-check because it matters."

---

## Quick Start

```bash
cd secondlook
npm install
npm run dev
```

Fill in `secondlook/.env.local` with your Firebase credentials (see Environment section below).

---

## Environment

Create `secondlook/.env.local` (already in `.gitignore`):

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Never** put `ANTHROPIC_API_KEY` or `RESEND_API_KEY` in `.env.local` — they live in Firebase secrets only.

---

## Firebase Setup

1. Create a project at [firebase.google.com](https://firebase.google.com)
2. Enable **Email/Password** auth (Authentication → Sign-in method)
3. Create a **Firestore** database (start in production mode)
4. Register a **Web app** to get the config keys above
5. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
6. Deploy Cloud Functions:
   ```bash
   cd functions && npm install && npm run build
   firebase deploy --only functions
   ```
7. Set function secrets:
   ```bash
   firebase functions:secrets:set ANTHROPIC_API_KEY
   firebase functions:secrets:set RESEND_API_KEY
   firebase functions:secrets:set APP_URL
   ```
8. Update `.firebaserc` with your project ID

---

## Firestore Data Model

```
users/{uid}
  first_name, mode, voice_enabled, family_share_level,
  stripe_customer_id, plan, created_at

users/{uid}/riskEvents/{autoId}
  risk_level, flag_types[], user_action, family_notified, created_at

familyConnections/{autoId}
  senior_user_id, family_user_id, relationship,
  status, notify_on_high_risk, invite_token, created_at
```

---

## Deploy to Vercel

```bash
npx vercel
```

Add these env vars in the Vercel dashboard:
`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
`VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 18, Vite, TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Auth | Firebase Auth |
| Database | Cloud Firestore |
| Functions | Firebase Cloud Functions (Node 20) |
| AI | Claude `claude-sonnet-4-6` via Cloud Functions |
| Email | Resend |
| Billing | Stripe (Week 7-8) |
| Hosting | Vercel |

## Privacy Architecture

- Zero message storage — analyzed and discarded immediately
- Firestore Security Rules on all collections
- `riskEvents` stores flags only, never message content
- Family dashboard shows count summaries, never message text

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing + auth |
| `/onboarding` | 6-step setup |
| `/check` | Main message analysis |
| `/dashboard` | Weekly summary |
| `/family` | Family connections |
| `/settings` | Mode, privacy, account |
| `/family/accept?token=` | Accept family invite |

---

## Build Status

- [x] Weeks 1-2: Firebase, Cloud Functions, Nora's brain
- [x] Weeks 3-4: Check interface, RiskCard, PauseButton, three modes
- [x] Weeks 5-6: Onboarding, Dashboard, Family, Resend emails
- [ ] Weeks 7-8: Stripe billing, accessibility, launch
