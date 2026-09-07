/**
 * storage.js - Data engine with Firebase Firestore cloud persistence
 *
 * Architecture:
 *  - An in-memory cache (_cachedData) keeps getData() synchronous so that
 *    admin.js / app.js code stays unchanged.
 *  - saveData() writes to Firestore (async, non-blocking).
 *  - subscribeToChanges() attaches a Firestore real-time listener so the
 *    public site updates live when the admin saves.
 *  - Falls back to DEFAULT_DATA if Firestore is not yet configured or offline.
 */

import { firebaseConfig, FIRESTORE_DOC_PATH } from './firebase-config.js';

// ─── Detect whether Firebase config has been filled in ───────────────────────
const FIREBASE_CONFIGURED =
  firebaseConfig.apiKey && firebaseConfig.apiKey !== 'PASTE_YOUR_API_KEY_HERE';

// ─── In-memory cache (kept in sync by Firestore listener) ────────────────────
let _cachedData = null;
let _db = null;            // Firestore instance
let _unsubscribe = null;   // Firestore listener cleanup fn

// ─── Legacy localStorage key (used only for migration) ───────────────────────
const LEGACY_STORAGE_KEY = 'amit_plain_academic_data_v2';

// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_DATA = {
  sectionVisibility: {
    research:   true,
    projects:   true,
    experience: false,
    education:  true,
    awards:     false
  },

  profile: {
    name: "Amit",
    photoUrl: "amit_pic.jpeg",
    title: "Undergraduate Student in Statistics",
    institution: "Hindu College, University of Delhi",
    address: "--",
    email: "amit.email.sigin@gmail.com",
    github: "https://github.com/amit1527",
    linkedin: "https://linkedin.com/in/amit1527",
    statusText: "Currently a Research Intern under Assistant Prof. Samadrita Bera, NIT Surathkal (June 2026 – Present).",
    introBio: "I am an undergraduate statistics student at Hindu College, University of Delhi (Class of 2028/29). My primary academic interests center on mathematical statistics, particularly statistical inference, likelihood theory, estimation theory, and statistical decision theory, alongside applications in regularized machine learning and quantitative modeling.",
    lastUpdated: "August 2026",
    pin: "5555"
  },

  researchList: [
    {
      id: "res-1",
      title: "Estimation Theory for the Exponentiated Gumbel Distribution",
      venue: "Research Project under Assistant Professor Samadrita Bera, NIT Surathkal",
      year: "1 June - Present",
      pdfUrl: "#",
      githubUrl: "https://github.com/amit1527",
      abstract: "Research project on statistical inference for the Exponentiated Gumbel Distribution (EGD), a widely used model in extreme-value analysis such as flood frequency, wind speed, and climate extremes, conducted under the mentorship of Assistant Professor Samadrita Bera, NIT Surathkal. This project derives and compares three major estimation approaches - Maximum Likelihood Estimation (MLE), the Uniformly Minimum Variance Unbiased Estimator (UMVUE), and Bayesian estimation for the EGD's parameters. The work uncovers a non-identifiability issue between the location and shape parameters and introduces a reparameterization to resolve it, enabling closed-form derivation of sufficient and complete statistics and UMVUEs where tractable. Bayesian estimators for the remaining parameters are obtained using Lindley's approximation. Theoretical results are validated through a simulation study in R comparing estimator performance by mean squared error."
    }
  ],

  projectsList: [
    {
      id: "proj-2",
      title: "Regression ML Pipeline with Regularization & Cross-Validation",
      venue: "Applied Statistics & ML",
      year: "2026",
      pdfUrl: "#",
      githubUrl: "https://github.com/amit1527",
      abstract: "An end-to-end statistical modeling pipeline evaluated on the Algerian Forest Fires dataset. Compared OLS, Ridge, Lasso, and Elastic Net estimators under cross-validated hyperparameter tuning to mitigate multicollinearity and minimize generalization error."
    },
    {
      id: "proj-3",
      title: "Adaptive Breakout Trading System (ABTS)",
      venue: "Quantitative Finance",
      year: "2025",
      pdfUrl: "#",
      githubUrl: "https://github.com/amit1527",
      abstract: "Modular object-oriented backtesting engine identifying volatility-breakouts and dynamically adjusting position sizing and stop-loss levels. Achieved a backtested 1.9 Sharpe ratio and 2.1 profit factor on historical equities data."
    }
  ],

  experienceList: [
    {
      id: "exp-1",
      title: "Equity Research Intern",
      institution: "Finnexus Proschool",
      year: "Jan 2026 – Apr 2026",
      details: "Conducted financial modeling and equity analysis on IIFL Finance Ltd., projecting AUM growth, Net Interest Margins (NIM), credit costs, and Return on Equity (ROE) using three-statement financial models."
    }
  ],

  educationList: [
    {
      id: "edu-1",
      degree: "B.Sc. (Hons.) Statistics",
      institution: "Hindu College, University of Delhi",
      year: "2025 – 2028/29 (in progress)",
      score: "CGPA: 8.55 / 10.0"
    }
  ],

  awardsList: [
    "Ranked in the **top 1%** among 450,000+ candidates in the National Defence Academy (NDA) written examination.",
    "**99th+ percentile in Mathematics**, CUET 2025.",
    "Two-time winner, school-level Mental Maths Competition."
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function _deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

async function _getFirestore() {
  if (_db) return _db;
  if (!FIREBASE_CONFIGURED) return null;

  try {
    // Use the Firebase CDN compat (v9 compat) loaded in index.html
    const app = firebase.apps.length
      ? firebase.app()
      : firebase.initializeApp(firebaseConfig);
    _db = firebase.firestore(app);
    return _db;
  } catch (e) {
    console.warn('[PortfolioStorage] Firebase init failed:', e.message);
    return null;
  }
}

function _docRef(db) {
  return db
    .collection(FIRESTORE_DOC_PATH.collection)
    .doc(FIRESTORE_DOC_PATH.document);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API  (mirrors the old PortfolioStorage class)
// ─────────────────────────────────────────────────────────────────────────────

export class PortfolioStorage {

  /**
   * Synchronous read from in-memory cache.
   * Call initAsync() first to populate the cache from Firestore.
   */
  static getData() {
    if (_cachedData) return _deepClone(_cachedData);
    // Fallback: try localStorage migration data, then defaults
    try {
      const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.sectionVisibility) {
          parsed.sectionVisibility = { ...DEFAULT_DATA.sectionVisibility };
        }
        _cachedData = parsed;
        return _deepClone(_cachedData);
      }
    } catch (_) { /* ignore */ }
    _cachedData = _deepClone(DEFAULT_DATA);
    return _deepClone(_cachedData);
  }

  /**
   * Initialize: fetch data from Firestore and seed cache.
   * If Firestore is not configured, falls back to localStorage / DEFAULT_DATA.
   * Returns the data.
   */
  static async initAsync() {
    const db = await _getFirestore();
    if (!db) {
      // Not configured — use defaults or legacy localStorage
      if (!_cachedData) PortfolioStorage.getData(); // seeds _cachedData
      return _deepClone(_cachedData);
    }

    try {
      const snap = await _docRef(db).get();
      if (snap.exists) {
        _cachedData = snap.data();
        if (!_cachedData.sectionVisibility) {
          _cachedData.sectionVisibility = { ...DEFAULT_DATA.sectionVisibility };
        }
      } else {
        // First-time setup: push DEFAULT_DATA to Firestore
        _cachedData = _deepClone(DEFAULT_DATA);
        await _docRef(db).set(_cachedData);
        console.info('[PortfolioStorage] Initialized Firestore with default data.');
      }
    } catch (e) {
      console.error('[PortfolioStorage] Firestore fetch failed, using defaults:', e);
      if (!_cachedData) _cachedData = _deepClone(DEFAULT_DATA);
    }

    return _deepClone(_cachedData);
  }

  /**
   * Subscribe to real-time changes from Firestore.
   * callback(data) is called immediately with current data, then on every change.
   * Returns an unsubscribe function.
   */
  static async subscribeToChanges(callback) {
    const db = await _getFirestore();

    if (!db) {
      // No Firestore — just call callback once with current data and listen
      // to the legacy window event as fallback
      if (!_cachedData) await PortfolioStorage.initAsync();
      callback(_deepClone(_cachedData));

      const handler = (e) => callback(e.detail || PortfolioStorage.getData());
      window.addEventListener('portfolioDataChanged', handler);
      return () => window.removeEventListener('portfolioDataChanged', handler);
    }

    // Clean up any previous listener
    if (_unsubscribe) _unsubscribe();

    _unsubscribe = _docRef(db).onSnapshot(
      (snap) => {
        if (snap.exists) {
          _cachedData = snap.data();
          if (!_cachedData.sectionVisibility) {
            _cachedData.sectionVisibility = { ...DEFAULT_DATA.sectionVisibility };
          }
          callback(_deepClone(_cachedData));
        }
      },
      (err) => {
        console.error('[PortfolioStorage] Firestore listener error:', err);
      }
    );

    return _unsubscribe;
  }

  /**
   * Save data — writes to Firestore (async) AND updates in-memory cache.
   * Also dispatches the legacy window event so any other listeners still work.
   */
  static async saveData(data) {
    _cachedData = _deepClone(data);

    // Fire the legacy local event immediately (instant UI update in same tab)
    window.dispatchEvent(new CustomEvent('portfolioDataChanged', { detail: _deepClone(data) }));

    const db = await _getFirestore();
    if (!db) {
      // Firestore not configured: fall back to localStorage
      try {
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('[PortfolioStorage] localStorage fallback failed:', e);
      }
      return true;
    }

    try {
      await _docRef(db).set(_deepClone(data));
      return true;
    } catch (e) {
      console.error('[PortfolioStorage] Firestore save failed:', e);
      return false;
    }
  }

  static async resetToDefaults() {
    await PortfolioStorage.saveData(DEFAULT_DATA);
    return DEFAULT_DATA;
  }

  static exportJSON() {
    const data = PortfolioStorage.getData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amit_academic_website_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async importJSON(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed && parsed.profile) {
        await PortfolioStorage.saveData(parsed);
        return { success: true, data: parsed };
      } else {
        return { success: false, error: "Invalid JSON structure." };
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Migrate existing localStorage data up to Firestore (one-time action).
   * Called from the admin Data tab.
   */
  static async migrateFromLocalStorage() {
    try {
      const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!stored) return { success: false, error: 'No localStorage data found.' };
      const parsed = JSON.parse(stored);
      if (!parsed || !parsed.profile) return { success: false, error: 'Invalid localStorage data.' };
      await PortfolioStorage.saveData(parsed);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}
