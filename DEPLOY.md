# 🚀 Deploy Guide — Firebase + Vercel

## Step 1 — Set up Firebase (3 minutes)

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"** → name it anything (e.g. `amit-portfolio`) → **Continue**
3. Disable Google Analytics if you want → **Create project**
4. In the left sidebar → **Build** → **Firestore Database**
5. Click **"Create database"** → choose **"Start in test mode"** → Next → **Enable**
6. In the left sidebar → gear icon ⚙ → **"Project settings"**
7. Scroll down to **"Your apps"** → click the **`</>`** (Web) icon
8. Register app (any nickname, e.g. `my-portfolio`) → **Register app**
9. You'll see a `firebaseConfig` object — copy it

---

## Step 2 — Paste your Firebase config

Open **`js/firebase-config.js`** and replace the placeholder values:

```js
export const firebaseConfig = {
  apiKey:            "AIzaSy...",        // ← paste yours here
  authDomain:        "amit-portfolio.firebaseapp.com",
  projectId:         "amit-portfolio",
  storageBucket:     "amit-portfolio.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

Save the file.

---

## Step 3 — Set Firestore Security Rules

In the Firebase console → **Firestore Database** → **Rules** tab, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public site can read; anyone can write (for admin panel)
    // For production: tighten writes with Firebase Auth or API key check
    match /portfolio/main {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

Click **Publish**.

> ⚠️ **Note**: "test mode" rules (all read/write open) expire after 30 days.
> The rule above keeps it open permanently until you add authentication.
> Since your admin is PIN-protected and data is not sensitive, this is fine for a personal portfolio.

---

## Step 4 — Deploy to Vercel

### Option A — Via GitHub (recommended, enables auto-deploy)

1. Push this project to GitHub (if not already):
   ```bash
   git add .
   git commit -m "Add Firebase + Vercel deployment"
   git push
   ```
2. Go to **https://vercel.com** → Sign in with GitHub
3. Click **"Add New Project"** → import your GitHub repo
4. Vercel auto-detects it as a static site — click **Deploy**
5. Done! Your site is live at `https://your-project.vercel.app`

### Option B — Via Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. Answer **"no"** to all framework questions (it's plain HTML).

---

## Step 5 — Test real-time sync

1. Open your live Vercel URL in **Tab A** (public view)
2. Open `https://your-project.vercel.app?admin=true` in **Tab B** (admin panel)
3. Enter your PIN → edit any field → click **Save**
4. Watch **Tab A** update **within 1–2 seconds** with no refresh! 🎉

---

## Step 6 — Migrate existing browser data (if needed)

If you had data saved locally in your browser before this update:

1. Open your deployed site with `?admin=true`
2. Go to the **Data Backup & Reset** tab
3. Click **"Migrate Local Data → Cloud"**

This pushes your old browser data up to Firestore (one-time action).

---

## Admin URL

```
https://your-project.vercel.app?admin=true
```

Bookmark this — it's your private admin panel.

---

## File Summary

| File | Purpose |
|------|---------|
| `js/firebase-config.js` | ← **Edit this** with your Firebase credentials |
| `js/storage.js` | Cloud read/write + real-time listener engine |
| `js/app.js` | Public site — subscribes to live Firestore updates |
| `js/admin.js` | Admin panel — saves directly to Firestore |
| `vercel.json` | Vercel deployment config |
