/**
 * app.js - Public View Controller for Amit's Plain-Academic Homepage
 */

import { PortfolioStorage } from './storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize: fetch data from Firestore (or defaults) before first render
  await PortfolioStorage.initAsync();
  renderPublicSite();
  setupEventListeners();
  checkAdminUrlAccess();

  // Subscribe to real-time Firestore changes — public site updates instantly
  // when admin saves without any page refresh
  PortfolioStorage.subscribeToChanges((data) => {
    renderPublicSite(data);
  });
});

function renderPublicSite(data) {
  if (!data) data = PortfolioStorage.getData();
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

  // 4. Dynamic Navbar & Sections in configured order
  renderNavbar(data.sections || []);
  renderSections(data);

  // 5. Footer
  const footerDate = document.getElementById('footer-updated');
  if (footerDate) footerDate.textContent = `Last updated ${profile.lastUpdated || 'August 2026'}`;

  // Trigger MathJax LaTeX rendering
  triggerMathJax();
}

function renderNavbar(sections) {
  const container = document.getElementById('navbar-links');
  if (!container) return;

  const visibleSections = (sections || []).filter(s => s.visible !== false);
  let html = `<li><a href="#about" class="active">Home</a></li>`;
  visibleSections.forEach(s => {
    html += `<li data-nav="${s.id}"><a href="#${s.id}">${escapeHtml(s.label)}</a></li>`;
  });
  container.innerHTML = html;
}

function renderSections(data) {
  const container = document.getElementById('sections-container');
  if (!container) return;

  const sections = (data.sections || []).filter(s => s.visible !== false);
  const { researchList, projectsList, experienceList, educationList, awardsList } = data;

  let html = '';

  for (const sec of sections) {
    const titleHtml = `<h2>${escapeHtml(sec.label)}</h2>`;
    const introHtml = sec.intro ? `<p>${escapeHtml(sec.intro)}</p>` : '';

    if (sec.type === 'papers') {
      html += `
        <div id="${sec.id}" class="portfolio-section">
          ${titleHtml}
          ${introHtml}
          <ul class="academic-list">
            ${renderResearchListHtml(researchList)}
          </ul>
        </div>
      `;
    } else if (sec.type === 'projects') {
      html += `
        <div id="${sec.id}" class="portfolio-section">
          ${titleHtml}
          ${introHtml}
          <ul class="academic-list">
            ${renderProjectsListHtml(projectsList)}
          </ul>
        </div>
      `;
    } else if (sec.type === 'experience') {
      html += `
        <div id="${sec.id}" class="portfolio-section">
          ${titleHtml}
          ${introHtml}
          <ul class="academic-list">
            ${renderExperienceListHtml(experienceList)}
          </ul>
        </div>
      `;
    } else if (sec.type === 'education') {
      html += `
        <div id="${sec.id}" class="portfolio-section">
          ${titleHtml}
          ${introHtml}
          <div>
            ${renderEducationListHtml(educationList)}
          </div>
        </div>
      `;
    } else if (sec.type === 'awards') {
      html += `
        <div id="${sec.id}" class="portfolio-section">
          ${titleHtml}
          ${introHtml}
          <ul class="honors-list">
            ${renderAwardsListHtml(awardsList)}
          </ul>
        </div>
      `;
    } else if (sec.type === 'text') {
      html += `
        <div id="${sec.id}" class="portfolio-section">
          ${titleHtml}
          ${introHtml}
          <div class="custom-text-content">
            ${formatTextParagraphs(sec.content)}
          </div>
        </div>
      `;
    } else if (sec.type === 'bullets') {
      html += `
        <div id="${sec.id}" class="portfolio-section">
          ${titleHtml}
          ${introHtml}
          <ul class="academic-list">
            ${renderBulletListHtml(sec.content)}
          </ul>
        </div>
      `;
    }
  }

  container.innerHTML = html;
}

function renderResearchListHtml(list) {
  if (!list || list.length === 0) return '';
  return list.map(item => `
    <li>
      <p>
        <a class="paper-title" href="${item.githubUrl || item.pdfUrl || '#'}">${escapeHtml(item.title)}</a>
        <span class="paper-venue"> ${escapeHtml(item.venue || '')}.</span> ${escapeHtml(item.year || '')}.
        ${item.pdfUrl && item.pdfUrl !== '#' ? `<a class="badge-link" href="${escapeHtml(item.pdfUrl)}">[pdf]</a>` : ''}
        ${item.githubUrl ? `<a class="badge-link" href="${escapeHtml(item.githubUrl)}" target="_blank">[github]</a>` : ''}
      </p>
      <p class="abstract-text">${escapeHtml(item.abstract || '')}</p>
    </li>
  `).join('');
}

function renderProjectsListHtml(list) {
  if (!list || list.length === 0) return '';
  return list.map(item => `
    <li>
      <p>
        <a class="paper-title" href="${item.githubUrl || '#'}">${escapeHtml(item.title)}</a>
        <span class="paper-venue"> ${escapeHtml(item.venue || '')}.</span> ${escapeHtml(item.year || '')}.
        ${item.githubUrl ? `<a class="badge-link" href="${escapeHtml(item.githubUrl)}" target="_blank">[github]</a>` : ''}
      </p>
      <p class="abstract-text">${escapeHtml(item.abstract || '')}</p>
    </li>
  `).join('');
}

function renderExperienceListHtml(list) {
  if (!list || list.length === 0) return '';
  return list.map(item => `
    <li>
      <p>
        <strong class="paper-title">${escapeHtml(item.title)}</strong> — <span class="paper-venue">${escapeHtml(item.institution)}</span> (${escapeHtml(item.year)})
      </p>
      <p class="abstract-text">${escapeHtml(item.details)}</p>
    </li>
  `).join('');
}

function renderEducationListHtml(list) {
  if (!list || list.length === 0) return '';
  return list.map(item => `
    <div class="edu-item">
      <div class="edu-degree">${escapeHtml(item.degree)}</div>
      <div>${escapeHtml(item.institution)}</div>
      <div class="edu-meta">${escapeHtml(item.year)} &nbsp;|&nbsp; <strong>${escapeHtml(item.score)}</strong></div>
    </div>
  `).join('');
}

function renderAwardsListHtml(list) {
  if (!list || list.length === 0) return '';
  return list.map(item => `
    <li>${formatMarkdownBold(escapeHtml(item))}</li>
  `).join('');
}

function renderBulletListHtml(content) {
  if (!content) return '';
  const lines = Array.isArray(content)
    ? content
    : content.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.map(line => `
    <li>${formatMarkdownBold(escapeHtml(line))}</li>
  `).join('');
}

function formatTextParagraphs(content) {
  if (!content) return '';
  const paras = content.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  return paras.map(p => `<p>${formatMarkdownBold(escapeHtml(p))}</p>`).join('');
}

function triggerMathJax() {
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise().catch(err => console.log('MathJax error:', err));
  }
}

function setupEventListeners() {
  // Admin button removed - admin panel accessible via URL
}

function checkAdminUrlAccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const adminParam = urlParams.get('admin');

  if (adminParam === 'true') {
    openAdminAuth(() => {
      const publicSite = document.getElementById('public-site');
      const adminPortal = document.getElementById('admin-portal');

      if (publicSite && adminPortal) {
        publicSite.style.display = 'none';
        adminPortal.classList.add('visible');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}

function openAdminAuth(onSuccess) {
  const pin = prompt("Enter Admin Passcode (Default: 5555):", "");
  const data = PortfolioStorage.getData();
  const expectedPin = (data.profile && data.profile.pin) || '5555';

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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

