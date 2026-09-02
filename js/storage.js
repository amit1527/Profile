/**
 * storage.js - Data engine and LocalStorage persistence for Amit's Plain-Academic Research Site
 */

const STORAGE_KEY = 'amit_plain_academic_data_v2';

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

export class PortfolioStorage {
  static getData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure sectionVisibility always exists (forward-compat for older saves)
        if (!parsed.sectionVisibility) {
          parsed.sectionVisibility = { ...DEFAULT_DATA.sectionVisibility };
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to load portfolio data:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA)); // deep clone
  }

  static saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('portfolioDataChanged', { detail: data }));
      return true;
    } catch (e) {
      console.error("Failed to save portfolio data:", e);
      return false;
    }
  }

  static resetToDefaults() {
    PortfolioStorage.saveData(DEFAULT_DATA);
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

  static importJSON(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed && parsed.profile) {
        PortfolioStorage.saveData(parsed);
        return { success: true, data: parsed };
      } else {
        return { success: false, error: "Invalid JSON structure." };
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}
