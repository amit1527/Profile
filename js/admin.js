/**
 * admin.js - CRUD Admin Dashboard for Amit's Plain-Academic Website
 * (Firebase Firestore edition — saves go to the cloud instantly)
 */

import { PortfolioStorage } from './storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Firestore cache before rendering admin forms
  await PortfolioStorage.initAsync();
  initAdminTabs();
  loadAdminData();
  setupFormHandlers();
});

// ─── Tab navigation ───────────────────────────────────────────────────────────
function initAdminTabs() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabPanels = document.querySelectorAll('.admin-tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      e.currentTarget.classList.add('active');
      const panel = document.getElementById(`tab-${target}`);
      if (panel) panel.classList.add('active');
    });
  });
}

// ─── Load all form fields from current data ───────────────────────────────────
function loadAdminData() {
  const data = PortfolioStorage.getData();
  const { profile, researchList, projectsList, experienceList, educationList, awardsList } = data;

  // Profile Form
  setVal('adm-name', profile.name);
  setVal('adm-title', profile.title);
  setVal('adm-institution', profile.institution);
  setVal('adm-address', profile.address);
  setVal('adm-email', profile.email);
  setVal('adm-github', profile.github);
  setVal('adm-linkedin', profile.linkedin);
  setVal('adm-photo', profile.photoUrl);
  setVal('adm-status', profile.statusText);
  setVal('adm-bio', profile.introBio);
  setVal('adm-pin', profile.pin || '5555');
  setVal('adm-updated', profile.lastUpdated);

  // Render CRUD Lists
  renderSectionsManager(data.sections || []);
  renderAdminResearch(researchList);
  renderAdminProjects(projectsList);
  renderAdminExperience(experienceList);
  renderAdminEducation(educationList);
  renderAdminAwards(awardsList);

  // CV Form
  const cv = data.cvData || {};
  setVal('adm-cv-url', cv.url || '');
  setVal('adm-cv-label', cv.label || 'Download CV');
  const cvVisEl = document.getElementById('adm-cv-visible');
  if (cvVisEl) cvVisEl.checked = !!cv.visible;
  const cvSidebarEl = document.getElementById('adm-cv-sidebar');
  if (cvSidebarEl) cvSidebarEl.checked = !!cv.showInSidebar;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/**
 * showSaveStatus(btn, promise)
 * Disables a button, shows "Saving…" while the promise runs,
 * then shows "Saved ✓" for 2 s before restoring the original label.
 */
async function showSaveStatus(btn, promise) {
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Saving…';
  try {
    await promise;
    btn.textContent = 'Saved ✓';
    btn.style.background = '#28a745';
  } catch (e) {
    btn.textContent = 'Error ✗';
    btn.style.background = '#dc3545';
    console.error(e);
  }
  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = original;
    btn.style.background = '';
  }, 2000);
}

// ─── Form & Button handlers ───────────────────────────────────────────────────
function setupFormHandlers() {

  // 1. Profile Form Save
  const profForm = document.getElementById('admin-profile-form');
  if (profForm) {
    profForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = PortfolioStorage.getData();
      data.profile = {
        ...data.profile,
        name:        getVal('adm-name'),
        title:       getVal('adm-title'),
        institution: getVal('adm-institution'),
        address:     getVal('adm-address'),
        email:       getVal('adm-email'),
        github:      getVal('adm-github'),
        linkedin:    getVal('adm-linkedin'),
        photoUrl:    getVal('adm-photo') || 'amit_pic.jpeg',
        statusText:  getVal('adm-status'),
        introBio:    getVal('adm-bio'),
        pin:         getVal('adm-pin') || '5555',
        lastUpdated: getVal('adm-updated') || 'August 2026'
      };
      const submitBtn = profForm.querySelector('button[type="submit"]');
      showSaveStatus(submitBtn, PortfolioStorage.saveData(data));
    });
  }

  // 2. Add Research Paper
  const addResBtn = document.getElementById('adm-add-res-btn');
  if (addResBtn) {
    addResBtn.addEventListener('click', async () => {
      const data = PortfolioStorage.getData();
      const newRes = {
        id: `res-${Date.now()}`,
        title: "New Research Paper / Preprint Title",
        venue: "Preprint",
        year: "2026",
        pdfUrl: "#",
        githubUrl: "https://github.com/amit1527",
        abstract: "Short abstract description of the research paper."
      };
      data.researchList.unshift(newRes);
      await showSaveStatus(addResBtn, PortfolioStorage.saveData(data));
      renderAdminResearch(data.researchList);
    });
  }

  // 3. Add Project
  const addProjBtn = document.getElementById('adm-add-proj-btn');
  if (addProjBtn) {
    addProjBtn.addEventListener('click', async () => {
      const data = PortfolioStorage.getData();
      const newProj = {
        id: `proj-${Date.now()}`,
        title: "New Project Name",
        venue: "Applied ML / Software",
        year: "2026",
        githubUrl: "https://github.com/amit1527",
        abstract: "Project summary description."
      };
      data.projectsList.unshift(newProj);
      await showSaveStatus(addProjBtn, PortfolioStorage.saveData(data));
      renderAdminProjects(data.projectsList);
    });
  }

  // 4. Add Experience
  const addExpBtn = document.getElementById('adm-add-exp-btn');
  if (addExpBtn) {
    addExpBtn.addEventListener('click', async () => {
      const data = PortfolioStorage.getData();
      if (!data.experienceList) data.experienceList = [];
      const newExp = {
        id: `exp-${Date.now()}`,
        title: "Intern / Role Title",
        institution: "Organization / Company",
        year: "2026",
        details: "Description of responsibilities and key contributions."
      };
      data.experienceList.unshift(newExp);
      await showSaveStatus(addExpBtn, PortfolioStorage.saveData(data));
      renderAdminExperience(data.experienceList);
    });
  }

  // 5. Add Education
  const addEduBtn = document.getElementById('adm-add-edu-btn');
  if (addEduBtn) {
    addEduBtn.addEventListener('click', async () => {
      const data = PortfolioStorage.getData();
      if (!data.educationList) data.educationList = [];
      const newEdu = {
        id: `edu-${Date.now()}`,
        degree: "Degree / Certification Name",
        institution: "University / Institution",
        year: "2026",
        score: "Grade / CGPA"
      };
      data.educationList.push(newEdu);
      await showSaveStatus(addEduBtn, PortfolioStorage.saveData(data));
      renderAdminEducation(data.educationList);
    });
  }

  // 6. Save Awards Form
  const awardsForm = document.getElementById('admin-awards-form');
  if (awardsForm) {
    awardsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = PortfolioStorage.getData();
      const text = getVal('adm-awards-textarea');
      data.awardsList = text.split('\n').map(l => l.trim()).filter(Boolean);
      const submitBtn = awardsForm.querySelector('button[type="submit"]');
      showSaveStatus(submitBtn, PortfolioStorage.saveData(data));
    });
  }

  // 7. CV Form Save
  const cvForm = document.getElementById('admin-cv-form');
  if (cvForm) {
    cvForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = PortfolioStorage.getData();
      const cvVisEl = document.getElementById('adm-cv-visible');
      const cvSidebarEl = document.getElementById('adm-cv-sidebar');
      const isVisible = cvVisEl ? cvVisEl.checked : false;
      data.cvData = {
        url:          getVal('adm-cv-url'),
        label:        getVal('adm-cv-label') || 'Download CV',
        visible:      isVisible,
        showInSidebar: cvSidebarEl ? cvSidebarEl.checked : false
      };
      // Keep the cv built-in section visibility in sync
      if (data.sections) {
        const cvSec = data.sections.find(s => s.id === 'cv');
        if (cvSec) cvSec.visible = isVisible;
      }
      const submitBtn = cvForm.querySelector('button[type="submit"]');
      showSaveStatus(submitBtn, PortfolioStorage.saveData(data));
    });
  }

  // 7. Data Backup Export / Import / Reset / Migrate
  const exportBtn = document.getElementById('adm-export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => PortfolioStorage.exportJSON());
  }

  const importInput = document.getElementById('adm-import-file');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const res = await PortfolioStorage.importJSON(evt.target.result);
        if (res.success) {
          loadAdminData();
          alert('Data imported successfully to cloud!');
        } else {
          alert('Import failed: ' + res.error);
        }
      };
      reader.readAsText(file);
    });
  }

  const resetBtn = document.getElementById('adm-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (confirm('Reset portfolio to original default data? This will overwrite cloud data.')) {
        await showSaveStatus(resetBtn, PortfolioStorage.resetToDefaults());
        loadAdminData();
      }
    });
  }

  // Migrate localStorage → Firestore (shown only if localStorage data exists)
  const migrateBtn = document.getElementById('adm-migrate-btn');
  if (migrateBtn) {
    migrateBtn.addEventListener('click', async () => {
      if (confirm('Push your existing browser data up to the cloud? This will overwrite current cloud data.')) {
        const res = await PortfolioStorage.migrateFromLocalStorage();
        if (res.success) {
          loadAdminData();
          alert('Migration successful! Your data is now in the cloud.');
        } else {
          alert('Migration failed: ' + res.error);
        }
      }
    });
  }

  // 8. Add Section Controls
  const addSecBtn = document.getElementById('adm-add-section-btn');
  const newSecBox = document.getElementById('adm-new-section-box');
  const cancelNewSecBtn = document.getElementById('btn-cancel-new-section');
  const saveNewSecBtn = document.getElementById('btn-save-new-section');
  const newSecType = document.getElementById('new-sec-type');
  const newSecContentLabel = document.getElementById('new-sec-content-label');
  const newSecContent = document.getElementById('new-sec-content');

  if (addSecBtn && newSecBox) {
    addSecBtn.addEventListener('click', () => {
      const isOpen = newSecBox.style.display !== 'none';
      newSecBox.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) {
        const titleEl = document.getElementById('new-sec-title');
        if (titleEl) titleEl.focus();
      }
    });
  }

  if (cancelNewSecBtn && newSecBox) {
    cancelNewSecBtn.addEventListener('click', () => {
      newSecBox.style.display = 'none';
      setVal('new-sec-title', '');
      setVal('new-sec-intro', '');
      setVal('new-sec-content', '');
    });
  }

  if (newSecType && newSecContentLabel && newSecContent) {
    newSecType.addEventListener('change', () => {
      if (newSecType.value === 'bullets') {
        newSecContentLabel.textContent = 'Bullet Items (one item per line)';
        newSecContent.placeholder = 'Item 1\nItem 2\nItem 3...';
      } else {
        newSecContentLabel.textContent = 'Content (Markdown / Paragraph text)';
        newSecContent.placeholder = 'Write paragraph text here...';
      }
    });
  }

  if (saveNewSecBtn) {
    saveNewSecBtn.addEventListener('click', async () => {
      const title = getVal('new-sec-title');
      if (!title) {
        alert('Please enter a section title.');
        return;
      }

      const type = getVal('new-sec-type') || 'text';
      const intro = getVal('new-sec-intro');
      const content = getVal('new-sec-content');

      const data = PortfolioStorage.getData();
      if (!data.sections) data.sections = [];

      const newId = `sec-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || Date.now()}`;
      let uniqueId = newId;
      let counter = 1;
      while (data.sections.some(s => s.id === uniqueId)) {
        uniqueId = `${newId}-${counter++}`;
      }

      const newSection = {
        id: uniqueId,
        label: title,
        type: type,
        builtin: false,
        visible: true,
        intro: intro,
        content: content
      };

      data.sections.push(newSection);
      await showSaveStatus(saveNewSecBtn, PortfolioStorage.saveData(data));
      
      // Reset & hide
      setVal('new-sec-title', '');
      setVal('new-sec-intro', '');
      setVal('new-sec-content', '');
      if (newSecBox) newSecBox.style.display = 'none';

      renderSectionsManager(data.sections);
    });
  }
}

// ─── CRUD Render Functions ────────────────────────────────────────────────────

function renderAdminResearch(list) {
  const container = document.getElementById('adm-research-container');
  if (!container) return;

  container.innerHTML = list.map(item => `
    <div class="admin-card-item" data-id="${item.id}" style="border:1px solid var(--border-color); padding:15px; margin-bottom:15px; border-radius:4px;">
      <div style="text-align:right; margin-bottom:8px;">
        <button class="btn btn-primary btn-sm save-res-btn">Save</button>
        <button class="btn btn-danger btn-sm delete-res-btn">Delete</button>
      </div>
      <div class="form-group">
        <label>Paper / Research Title</label>
        <input type="text" class="form-control res-title" value="${escapeHtml(item.title)}">
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div class="form-group">
          <label>Venue / Publisher</label>
          <input type="text" class="form-control res-venue" value="${escapeHtml(item.venue)}">
        </div>
        <div class="form-group">
          <label>Year</label>
          <input type="text" class="form-control res-year" value="${escapeHtml(item.year)}">
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div class="form-group">
          <label>PDF URL</label>
          <input type="text" class="form-control res-pdf" value="${escapeHtml(item.pdfUrl)}">
        </div>
        <div class="form-group">
          <label>GitHub URL</label>
          <input type="text" class="form-control res-github" value="${escapeHtml(item.githubUrl)}">
        </div>
      </div>
      <div class="form-group">
        <label>Abstract (Supports LaTeX $\\dots$)</label>
        <textarea class="form-control res-abstract">${escapeHtml(item.abstract)}</textarea>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.save-res-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('[data-id]');
      const id = card.getAttribute('data-id');
      const data = PortfolioStorage.getData();
      const item = data.researchList.find(x => x.id === id);
      if (item) {
        item.title    = card.querySelector('.res-title').value.trim();
        item.venue    = card.querySelector('.res-venue').value.trim();
        item.year     = card.querySelector('.res-year').value.trim();
        item.pdfUrl   = card.querySelector('.res-pdf').value.trim();
        item.githubUrl = card.querySelector('.res-github').value.trim();
        item.abstract = card.querySelector('.res-abstract').value.trim();
        showSaveStatus(btn, PortfolioStorage.saveData(data));
      }
    });
  });

  container.querySelectorAll('.delete-res-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const card = e.target.closest('[data-id]');
      const id = card.getAttribute('data-id');
      if (confirm('Delete this paper?')) {
        const data = PortfolioStorage.getData();
        data.researchList = data.researchList.filter(x => x.id !== id);
        await showSaveStatus(btn, PortfolioStorage.saveData(data));
        renderAdminResearch(data.researchList);
      }
    });
  });
}

function renderAdminProjects(list) {
  const container = document.getElementById('adm-projects-container');
  if (!container) return;

  container.innerHTML = list.map(item => `
    <div class="admin-card-item" data-id="${item.id}" style="border:1px solid var(--border-color); padding:15px; margin-bottom:15px; border-radius:4px;">
      <div style="text-align:right; margin-bottom:8px;">
        <button class="btn btn-primary btn-sm save-proj-btn">Save</button>
        <button class="btn btn-danger btn-sm delete-proj-btn">Delete</button>
      </div>
      <div class="form-group">
        <label>Project Title</label>
        <input type="text" class="form-control proj-title" value="${escapeHtml(item.title)}">
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div class="form-group">
          <label>Category / Venue</label>
          <input type="text" class="form-control proj-venue" value="${escapeHtml(item.venue)}">
        </div>
        <div class="form-group">
          <label>Year</label>
          <input type="text" class="form-control proj-year" value="${escapeHtml(item.year)}">
        </div>
      </div>
      <div class="form-group">
        <label>GitHub Repository URL</label>
        <input type="text" class="form-control proj-github" value="${escapeHtml(item.githubUrl)}">
      </div>
      <div class="form-group">
        <label>Project Summary / Abstract</label>
        <textarea class="form-control proj-abstract">${escapeHtml(item.abstract)}</textarea>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.save-proj-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('[data-id]');
      const id = card.getAttribute('data-id');
      const data = PortfolioStorage.getData();
      const item = data.projectsList.find(x => x.id === id);
      if (item) {
        item.title     = card.querySelector('.proj-title').value.trim();
        item.venue     = card.querySelector('.proj-venue').value.trim();
        item.year      = card.querySelector('.proj-year').value.trim();
        item.githubUrl = card.querySelector('.proj-github').value.trim();
        item.abstract  = card.querySelector('.proj-abstract').value.trim();
        showSaveStatus(btn, PortfolioStorage.saveData(data));
      }
    });
  });

  container.querySelectorAll('.delete-proj-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const card = e.target.closest('[data-id]');
      const id = card.getAttribute('data-id');
      if (confirm('Delete project?')) {
        const data = PortfolioStorage.getData();
        data.projectsList = data.projectsList.filter(x => x.id !== id);
        await showSaveStatus(btn, PortfolioStorage.saveData(data));
        renderAdminProjects(data.projectsList);
      }
    });
  });
}

function renderAdminExperience(list) {
  const container = document.getElementById('adm-exp-container');
  if (!container) return;
  if (!list || list.length === 0) {
    container.innerHTML = '<p style="color:#888;">No experience entries yet. Click "+ Add Experience" to begin.</p>';
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="admin-card-item" data-id="${item.id}" style="border:1px solid var(--border-color); padding:15px; margin-bottom:15px; border-radius:4px;">
      <div style="text-align:right; margin-bottom:8px;">
        <button class="btn btn-primary btn-sm save-exp-btn">Save</button>
        <button class="btn btn-danger btn-sm delete-exp-btn">Delete</button>
      </div>
      <div class="form-group">
        <label>Role / Position Title</label>
        <input type="text" class="form-control exp-title" value="${escapeHtml(item.title)}">
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div class="form-group">
          <label>Organization / Company</label>
          <input type="text" class="form-control exp-institution" value="${escapeHtml(item.institution)}">
        </div>
        <div class="form-group">
          <label>Period / Year</label>
          <input type="text" class="form-control exp-year" value="${escapeHtml(item.year)}">
        </div>
      </div>
      <div class="form-group">
        <label>Details / Description</label>
        <textarea class="form-control exp-details">${escapeHtml(item.details)}</textarea>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.save-exp-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('[data-id]');
      const id = card.getAttribute('data-id');
      const data = PortfolioStorage.getData();
      const item = data.experienceList.find(x => x.id === id);
      if (item) {
        item.title       = card.querySelector('.exp-title').value.trim();
        item.institution = card.querySelector('.exp-institution').value.trim();
        item.year        = card.querySelector('.exp-year').value.trim();
        item.details     = card.querySelector('.exp-details').value.trim();
        showSaveStatus(btn, PortfolioStorage.saveData(data));
      }
    });
  });

  container.querySelectorAll('.delete-exp-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const card = e.target.closest('[data-id]');
      const id = card.getAttribute('data-id');
      if (confirm('Delete this experience entry?')) {
        const data = PortfolioStorage.getData();
        data.experienceList = data.experienceList.filter(x => x.id !== id);
        await showSaveStatus(btn, PortfolioStorage.saveData(data));
        renderAdminExperience(data.experienceList);
      }
    });
  });
}

function renderAdminEducation(list) {
  const container = document.getElementById('adm-edu-container');
  if (!container) return;
  if (!list || list.length === 0) {
    container.innerHTML = '<p style="color:#888;">No education records yet. Click "+ Add Education" to begin.</p>';
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="admin-card-item" data-id="${item.id}" style="border:1px solid var(--border-color); padding:15px; margin-bottom:15px; border-radius:4px;">
      <div style="text-align:right; margin-bottom:8px;">
        <button class="btn btn-primary btn-sm save-edu-btn">Save</button>
        <button class="btn btn-danger btn-sm delete-edu-btn">Delete</button>
      </div>
      <div class="form-group">
        <label>Degree / Certificate</label>
        <input type="text" class="form-control edu-degree" value="${escapeHtml(item.degree)}">
      </div>
      <div class="form-group">
        <label>Institution / School</label>
        <input type="text" class="form-control edu-institution" value="${escapeHtml(item.institution)}">
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div class="form-group">
          <label>Year / Status</label>
          <input type="text" class="form-control edu-year" value="${escapeHtml(item.year)}">
        </div>
        <div class="form-group">
          <label>Score / CGPA / Percentage</label>
          <input type="text" class="form-control edu-score" value="${escapeHtml(item.score)}">
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.save-edu-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('[data-id]');
      const id = card.getAttribute('data-id');
      const data = PortfolioStorage.getData();
      const item = data.educationList.find(x => x.id === id);
      if (item) {
        item.degree      = card.querySelector('.edu-degree').value.trim();
        item.institution = card.querySelector('.edu-institution').value.trim();
        item.year        = card.querySelector('.edu-year').value.trim();
        item.score       = card.querySelector('.edu-score').value.trim();
        showSaveStatus(btn, PortfolioStorage.saveData(data));
      }
    });
  });

  container.querySelectorAll('.delete-edu-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const card = e.target.closest('[data-id]');
      const id = card.getAttribute('data-id');
      if (confirm('Delete this education entry?')) {
        const data = PortfolioStorage.getData();
        data.educationList = data.educationList.filter(x => x.id !== id);
        await showSaveStatus(btn, PortfolioStorage.saveData(data));
        renderAdminEducation(data.educationList);
      }
    });
  });
}

function renderAdminAwards(list) {
  const area = document.getElementById('adm-awards-textarea');
  if (area) area.value = (list || []).join('\n');
}

function renderSectionsManager(sections) {
  const container = document.getElementById('sections-manager-list');
  if (!container) return;

  if (!sections || sections.length === 0) {
    container.innerHTML = '<p style="color:#888;">No sections defined.</p>';
    return;
  }

  container.innerHTML = sections.map((sec, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === sections.length - 1;
    const isCustom = !sec.builtin;
    const badge = isCustom
      ? `<span class="sec-badge sec-badge-custom">Custom (${escapeHtml(sec.type)})</span>`
      : `<span class="sec-badge sec-badge-builtin">Built-in: ${escapeHtml(sec.type)}</span>`;

    return `
      <div class="section-item-card" data-sec-id="${sec.id}" data-index="${idx}">
        <div class="section-row-header">
          <!-- Reordering arrows -->
          <div class="section-reorder-controls">
            <button class="btn-arrow btn-move-up" title="Move Up" ${isFirst ? 'disabled' : ''}>▲</button>
            <button class="btn-arrow btn-move-down" title="Move Down" ${isLast ? 'disabled' : ''}>▼</button>
          </div>

          <!-- Section title and preview -->
          <div class="section-info-main">
            <div class="section-title-line">
              <span class="section-label-text">${escapeHtml(sec.label)}</span>
              ${badge}
            </div>
            ${sec.intro ? `<div class="section-intro-preview">${escapeHtml(sec.intro)}</div>` : ''}
          </div>

          <!-- Controls: Toggle, Edit, Delete -->
          <div class="section-row-actions">
            <label class="toggle-switch" title="Toggle section visibility on public site">
              <input type="checkbox" class="sec-vis-toggle" ${sec.visible !== false ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
            <button class="btn btn-default btn-sm btn-edit-sec" title="Edit section details">Edit</button>
            ${isCustom ? `<button class="btn btn-danger btn-sm btn-del-sec" title="Delete section">Delete</button>` : ''}
          </div>
        </div>

        <!-- Inline Edit Panel (collapsed by default) -->
        <div class="section-inline-edit" style="display:none; margin-top:14px; padding-top:14px; border-top:1px dashed var(--border-color);">
          <div class="form-group">
            <label>Section Title (as displayed on page and navbar)</label>
            <input type="text" class="form-control edit-sec-title" value="${escapeHtml(sec.label)}">
          </div>
          <div class="form-group">
            <label>Introductory Subtitle / Blurb (Optional)</label>
            <input type="text" class="form-control edit-sec-intro" value="${escapeHtml(sec.intro || '')}">
          </div>
          ${isCustom ? `
            <div class="form-group">
              <label>${sec.type === 'bullets' ? 'Bullet Items (one per line)' : 'Section Content (Paragraph / Markdown)'}</label>
              <textarea class="form-control edit-sec-content" style="min-height:90px;">${escapeHtml(Array.isArray(sec.content) ? sec.content.join('\n') : (sec.content || ''))}</textarea>
            </div>
          ` : `
            <p style="font-size:12px; color:#888; margin-bottom:10px;">
              <em>Note:</em> To add or edit items in this built-in section, click its dedicated tab in the left menu.
            </p>
          `}
          <div style="display:flex; gap:8px;">
            <button class="btn btn-primary btn-sm btn-save-edit-sec">Save Changes</button>
            <button class="btn btn-default btn-sm btn-cancel-edit-sec">Cancel</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // 1. Move Up
  container.querySelectorAll('.btn-move-up').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const card = e.target.closest('.section-item-card');
      const idx = parseInt(card.getAttribute('data-index'), 10);
      if (idx > 0) {
        const data = PortfolioStorage.getData();
        const temp = data.sections[idx];
        data.sections[idx] = data.sections[idx - 1];
        data.sections[idx - 1] = temp;
        await PortfolioStorage.saveData(data);
        renderSectionsManager(data.sections);
      }
    });
  });

  // 2. Move Down
  container.querySelectorAll('.btn-move-down').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const card = e.target.closest('.section-item-card');
      const idx = parseInt(card.getAttribute('data-index'), 10);
      const data = PortfolioStorage.getData();
      if (idx < data.sections.length - 1) {
        const temp = data.sections[idx];
        data.sections[idx] = data.sections[idx + 1];
        data.sections[idx + 1] = temp;
        await PortfolioStorage.saveData(data);
        renderSectionsManager(data.sections);
      }
    });
  });

  // 3. Visibility Toggle
  container.querySelectorAll('.sec-vis-toggle').forEach(chk => {
    chk.addEventListener('change', async (e) => {
      const card = e.target.closest('.section-item-card');
      const secId = card.getAttribute('data-sec-id');
      const data = PortfolioStorage.getData();
      const sec = data.sections.find(s => s.id === secId);
      if (sec) {
        sec.visible = e.target.checked;
        await PortfolioStorage.saveData(data);
      }
    });
  });

  // 4. Toggle Edit Form
  container.querySelectorAll('.btn-edit-sec').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.section-item-card');
      const editBox = card.querySelector('.section-inline-edit');
      const isVisible = editBox.style.display !== 'none';
      editBox.style.display = isVisible ? 'none' : 'block';
      btn.textContent = isVisible ? 'Edit' : 'Close';
    });
  });

  // 5. Cancel Edit Form
  container.querySelectorAll('.btn-cancel-edit-sec').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.section-item-card');
      card.querySelector('.section-inline-edit').style.display = 'none';
      const editBtn = card.querySelector('.btn-edit-sec');
      if (editBtn) editBtn.textContent = 'Edit';
    });
  });

  // 6. Save Edit Form
  container.querySelectorAll('.btn-save-edit-sec').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const card = e.target.closest('.section-item-card');
      const secId = card.getAttribute('data-sec-id');
      const data = PortfolioStorage.getData();
      const sec = data.sections.find(s => s.id === secId);
      if (sec) {
        const titleInput = card.querySelector('.edit-sec-title');
        const introInput = card.querySelector('.edit-sec-intro');
        const contentInput = card.querySelector('.edit-sec-content');

        if (titleInput && titleInput.value.trim()) {
          sec.label = titleInput.value.trim();
        }
        if (introInput) {
          sec.intro = introInput.value.trim();
        }
        if (contentInput) {
          sec.content = contentInput.value;
        }

        await showSaveStatus(btn, PortfolioStorage.saveData(data));
        renderSectionsManager(data.sections);
      }
    });
  });

  // 7. Delete Custom Section
  container.querySelectorAll('.btn-del-sec').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const card = e.target.closest('.section-item-card');
      const secId = card.getAttribute('data-sec-id');
      const data = PortfolioStorage.getData();
      const sec = data.sections.find(s => s.id === secId);
      if (!sec) return;

      if (confirm(`Delete the section "${sec.label}"? This action cannot be undone.`)) {
        data.sections = data.sections.filter(s => s.id !== secId);
        await PortfolioStorage.saveData(data);
        renderSectionsManager(data.sections);
      }
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
