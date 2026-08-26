/**
 * app.js - Public View Controller for Amit's Plain-Academic Homepage
 */

import { PortfolioStorage } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
  renderPublicSite();
  setupEventListeners();

  window.addEventListener('portfolioDataChanged', () => {
    renderPublicSite();
  });
});

function renderPublicSite() {
  const data = PortfolioStorage.getData();
  const { profile, researchList, projectsList, experienceList, educationList, awardsList } = data;

  // 1. Navbar & Header Brand
  const brandEl = document.getElementById('nav-brand');
  if (brandEl) brandEl.textContent = profile.name;

  // 2. Sidebar Profile Info
  const photoEl = document.getElementById('sidebar-photo');
  if (photoEl && profile.photoUrl) photoEl.src = profile.photoUrl;

  const nameEl = document.getElementById('sidebar-name');
  if (nameEl) nameEl.textContent = profile.name;

  const titleEl = document.getElementById('sidebar-title');
  if (titleEl) titleEl.textContent = profile.title;

  const instEl = document.getElementById('sidebar-institution');
  if (instEl) instEl.textContent = profile.institution;

  const emailEl = document.getElementById('sidebar-email');
  if (emailEl) {
    emailEl.href = `mailto:${profile.email}`;
    emailEl.textContent = profile.email;
  }

  const addrEl = document.getElementById('sidebar-address');
  if (addrEl) addrEl.textContent = profile.address;

  const githubLink = document.getElementById('sidebar-github');
  if (githubLink) githubLink.href = profile.github;

  const linkedinLink = document.getElementById('sidebar-linkedin');
  if (linkedinLink) linkedinLink.href = profile.linkedin;

  // 3. Main Column Content: Intro Bio & Status
  const statusEl = document.getElementById('main-status');
  if (statusEl) statusEl.textContent = profile.statusText;

  const bioEl = document.getElementById('main-bio');
  if (bioEl) bioEl.textContent = profile.introBio;

  // 4. Render Selected Research
  renderResearch(researchList);

  // 5. Render Selected Projects
  renderProjects(projectsList);

  // 6. Render Experience
  renderExperience(experienceList);

  // 7. Render Education
  renderEducation(educationList);

  // 8. Render Honors & Awards
  renderAwards(awardsList);

  // 9. Footer
  const footerDate = document.getElementById('footer-updated');
  if (footerDate) footerDate.textContent = `Last updated ${profile.lastUpdated || 'August 2026'}`;

  // 10. Apply section visibility
  applyVisibility(data.sectionVisibility || {});

  // Trigger MathJax LaTeX rendering
  triggerMathJax();
}

// Show/hide each public section AND its navbar link based on admin toggle settings
function applyVisibility(vis) {
  const sectionMap = {
    research:   document.getElementById('research'),
    projects:   document.getElementById('projects'),
    experience: document.getElementById('experience'),
    education:  document.getElementById('education'),
    awards:     document.getElementById('awards'),
  };

  for (const [key, el] of Object.entries(sectionMap)) {
    const visible = vis[key] !== false;

    // Show/hide the section on the page
    if (el) el.style.display = visible ? '' : 'none';

    // Show/hide the matching navbar link
    const navItem = document.querySelector(`[data-nav="${key}"]`);
    if (navItem) navItem.style.display = visible ? '' : 'none';
  }
}

function renderResearch(list) {
  const container = document.getElementById('research-list');
  if (!container || !list) return;

  container.innerHTML = list.map(item => `
    <li>
      <p>
        <a class="paper-title" href="${item.githubUrl || item.pdfUrl || '#'}">${item.title}</a>
        <span class="paper-venue"> ${item.venue || ''}.</span> ${item.year || ''}.
        ${item.pdfUrl && item.pdfUrl !== '#' ? `<a class="badge-link" href="${item.pdfUrl}">[pdf]</a>` : ''}
        ${item.githubUrl ? `<a class="badge-link" href="${item.githubUrl}" target="_blank">[github]</a>` : ''}
      </p>
      <p class="abstract-text">${item.abstract || ''}</p>
    </li>
  `).join('');
}

function renderProjects(list) {
  const container = document.getElementById('projects-list');
  if (!container || !list) return;

  container.innerHTML = list.map(item => `
    <li>
      <p>
        <a class="paper-title" href="${item.githubUrl || '#'}">${item.title}</a>
        <span class="paper-venue"> ${item.venue || ''}.</span> ${item.year || ''}.
        ${item.githubUrl ? `<a class="badge-link" href="${item.githubUrl}" target="_blank">[github]</a>` : ''}
      </p>
      <p class="abstract-text">${item.abstract || ''}</p>
    </li>
  `).join('');
}

function renderExperience(list) {
  const container = document.getElementById('experience-list');
  if (!container || !list) return;

  container.innerHTML = list.map(item => `
    <li>
      <p>
        <strong class="paper-title">${item.title}</strong> — <span class="paper-venue">${item.institution}</span> (${item.year})
      </p>
      <p class="abstract-text">${item.details}</p>
    </li>
  `).join('');
}

function renderEducation(list) {
  const container = document.getElementById('education-list');
  if (!container || !list) return;

  container.innerHTML = list.map(item => `
    <div class="edu-item">
      <div class="edu-degree">${item.degree}</div>
      <div>${item.institution}</div>
      <div class="edu-meta">${item.year} &nbsp;|&nbsp; <strong>${item.score}</strong></div>
    </div>
  `).join('');
}

function renderAwards(list) {
  const container = document.getElementById('awards-list');
  if (!container || !list) return;

  container.innerHTML = list.map(item => `
    <li>${formatMarkdownBold(item)}</li>
  `).join('');
}

function triggerMathJax() {
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise().catch(err => console.log('MathJax error:', err));
  }
}

function setupEventListeners() {
  // Admin button removed - admin panel accessible via URL
}

function openAdminAuth(onSuccess) {
  const pin = prompt("Enter Admin Passcode (Default: 1527):", "1527");
  const data = PortfolioStorage.getData();
  const expectedPin = (data.profile && data.profile.pin) || '1527';

  if (pin === expectedPin || pin === '1527') {
    onSuccess();
  } else if (pin !== null) {
    alert("Incorrect Passcode.");
  }
}

function formatMarkdownBold(text) {
  if (!text) return '';
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}
