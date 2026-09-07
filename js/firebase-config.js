/**
 * firebase-config.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SETUP INSTRUCTIONS (one-time, ~3 minutes):
 *
 * 1. Go to https://console.firebase.google.com
 * 2. Click "Add project" → give it any name (e.g. "amit-portfolio") → Continue
 * 3. Disable Google Analytics if you want → Create project
 * 4. In the left sidebar, click "Build" → "Firestore Database"
 * 5. Click "Create database" → choose "Start in test mode" → Next → Enable
 * 6. In the left sidebar, click the gear icon ⚙ → "Project settings"
 * 7. Scroll down to "Your apps" → click the </> (web) icon
 * 8. Register app (any nickname) → Copy the firebaseConfig object below
 * 9. Replace the placeholder values below with your actual values
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ↓↓↓ REPLACE THIS WITH YOUR FIREBASE CONFIG ↓↓↓
export const firebaseConfig = {
  apiKey:            "AIzaSyDeIM5CMhh4NZn_szqWHD4XIEmnz7XDuK8",
  authDomain:        "profile-website-d30ea.firebaseapp.com",
  projectId:         "profile-website-d30ea",
  storageBucket:     "profile-website-d30ea.firebasestorage.app",
  messagingSenderId: "523586303218",
  appId:             "1:523586303218:web:aa545574d0716264230c6b",
  measurementId:     "G-GQ63JVFKF0"
};
// ↑↑↑ REPLACE THIS WITH YOUR FIREBASE CONFIG ↑↑↑

// The Firestore document path where all portfolio data lives
export const FIRESTORE_DOC_PATH = {
  collection: 'portfolio',
  document:   'main'
};
