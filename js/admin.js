/**
 * admin.js - CRUD Admin Dashboard for Amit's Plain-Academic Website
 */

import { PortfolioStorage } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
  initAdminTabs();
  loadAdminData();
  setupFormHandlers();
});

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
  setVal('adm-pin', profile.pin || '1527');
  setVal('adm-updated', profile.lastUpdated);

  // Render CRUD Lists
  renderVisibilityToggles(data.sectionVisibility || {});
  renderAdminResearch(researchList);
  renderAdminProjects(projectsList);
  renderAdminExperience(experienceList);
  renderAdminEducation(educationList);
  renderAdminAwards(awardsList);
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setupFormHandlers() {
  // 1. Profile Form Save
  const profForm = document.getElementById('admin-profile-form');
  if (profForm) {
    profForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = PortfolioStorage.getData();
      data.profile = {
        ...data.profile,
        name: getVal('adm-name'),
        title: getVal('adm-title'),
        institution: getVal('adm-institution'),
        address: getVal('adm-address'),
        email: getVal('adm-email'),
        github: getVal('adm-github'),
        linkedin: getVal('adm-linkedin'),
        photoUrl: getVal('adm-photo') || 'amit_profile_photo.png',
        statusText: getVal('adm-status'),
        introBio: getVal('adm-bio'),
        pin: getVal('adm-pin') || '1527',
        lastUpdated: getVal('adm-updated') || 'August 2026'
      };
      PortfolioStorage.saveData(data);
      alert('Profile details saved successfully!');
    });
  }

  // 2. Add Research Paper
  const addResBtn = document.getElementById('adm-add-res-btn');
  if (addResBtn) {
    addResBtn.addEventListener('click', () => {
      const data = PortfolioStorage.getData();
      const newRes = {
        id: `res-${Date.now()}`,
        title: "New Research Paper / Preprint Title",
        venue: "Preprint",
        year: "2026",
        pdfUrl: "#",
        githubUrl: "https://github.com/amit1527",
        abstract: "Short abstract description of the research paper with MathJax LaTeX formulas like $\\operatorname{Var}(\\hat{\\theta}) \\ge \\frac{1}{I(\\theta)}$."
      };
      data.researchList.unshift(newRes);
      PortfolioStorage.saveData(data);
      renderAdminResearch(data.researchList);
      alert('New research item added!');
    });
  }

  // 3. Add Project
  const addProjBtn = document.getElementById('adm-add-proj-btn');
  if (addProjBtn) {
    addProjBtn.addEventListener('click', () => {
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
      PortfolioStorage.saveData(data);
      renderAdminProjects(data.projectsList);
      alert('New project added!');
    });
  }

  // 3b. Add Experience
  const addExpBtn = document.getElementById('adm-add-exp-btn');
  if (addExpBtn) {
    addExpBtn.addEventListener('click', () => {
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
      PortfolioStorage.saveData(data);
      renderAdminExperience(data.experienceList);
      alert('Experience entry added!');
    });
  }

  // 3c. Add Education
  const addEduBtn = document.getElementById('adm-add-edu-btn');
  if (addEduBtn) {
    addEduBtn.addEventListener('click', () => {
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
      PortfolioStorage.saveData(data);
      renderAdminEducation(data.educationList);
      alert('Education record added!');
    });
  }

  // 4. Save Awards Form
  const awardsForm = document.getElementById('admin-awards-form');
  if (awardsForm) {
    awardsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = PortfolioStorage.getData();
      const text = getVal('adm-awards-textarea');
      data.awardsList = text.split('\n').map(l => l.trim()).filter(Boolean);
      PortfolioStorage.saveData(data);
      alert('Honors & Awards saved!');
    });
  }

  // 5. Data Backup Export / Import / Reset
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
      reader.onload = (evt) => {
        const res = PortfolioStorage.importJSON(evt.target.result);
        if (res.success) {
          loadAdminData();
          alert('Data imported successfully!');
        } else {
          alert('Import failed: ' + res.error);
        }
      };
      reader.readAsText(file);
    });
  }

  const resetBtn = document.getElementById('adm-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset portfolio to original default data?')) {
        PortfolioStorage.resetToDefaults();
        loadAdminData();
        alert('Data reset to default.');
      }
    });
  }
}

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
        item.title = card.querySelector('.res-title').value.trim();
        item.venue = card.querySelector('.res-venue').value.trim();
        item.year = card.querySelector('.res-year').value.trim();
        item.pdfUrl = card.querySelector('.res-pdf').value.trim();
        item.githubUrl = card.querySelector('.res-github').value.trim();
        item.abstract = card.querySelector('.res-abstract').value.trim();
        PortfolioStorage.saveData(data);
        alert('Research paper saved!');
      }
    });
  });

  container.querySelectorAll('.delete-res-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('[data-id]');
      const id = card.getAttribute('data-id');
      if (confirm('Delete this paper?')) {
        const data = PortfolioStorage.getData();
        data.researchList = data.researchList.filter(x => x.id !== id);
        PortfolioStorage.saveData(data);
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
        item.title = card.querySelector('.proj-title').value.trim();
        item.venue = card.querySelector('.proj-venue').value.trim();
        item.year = card.querySelector('.proj-year').value.trim();
        item.githubUrl = card.querySelector('.proj-github').value.trim();
        item.abstract = card.querySelector('.proj-abstract').value.trim();
        PortfolioStorage.saveData(data);
        alert('Project saved!');
      }
    });
  });

  container.querySelectorAll('.delete-proj-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('[data-id]');
      const id = card.getAttribute('data-id');
      if (confirm('Delete project?')) {
        const data = PortfolioStorage.getData();
        data.projectsList = data.projectsList.filter(x => x.id !== id);
        PortfolioStorage.saveData(data);
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
        item.title = card.querySelector('.exp-title').value.trim();
        item.institution = card.querySelector('.exp-institution').value.trim();
        item.year = card.querySelector('.exp-year').value.trim();
        item.details = card.querySelector('.exp-details').value.trim();
        PortfolioStorage.saveData(data);
        alert('Experience entry saved!');
      }
    });
  });

  container.querySelectorAll('.delete-exp-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('[data-id]');
      const id = card.getAttribute('data-id');
      if (confirm('Delete this experience entry?')) {
        const data = PortfolioStorage.getData();
        data.experienceList = data.experienceList.filter(x => x.id !== id);
        PortfolioStorage.saveData(data);
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
        item.degree = card.querySelector('.edu-degree').value.trim();
        item.institution = card.querySelector('.edu-institution').value.trim();
        item.year = card.querySelector('.edu-year').value.trim();
        item.score = card.querySelector('.edu-score').value.trim();
        PortfolioStorage.saveData(data);
        alert('Education record saved!');
      }
    });
  });

  container.querySelectorAll('.delete-edu-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('[data-id]');
      const id = card.getAttribute('data-id');
      if (confirm('Delete this education entry?')) {
        const data = PortfolioStorage.getData();
        data.educationList = data.educationList.filter(x => x.id !== id);
        PortfolioStorage.saveData(data);
        renderAdminEducation(data.educationList);
      }
    });
  });
}

function renderAdminAwards(list) {
  const area = document.getElementById('adm-awards-textarea');
  if (area) area.value = (list || []).join('\n');
}

function renderVisibilityToggles(vis) {
  const container = document.getElementById('visibility-toggles');
  if (!container) return;

  const sections = [
    { key: 'research',   label: 'Research & Preprints', desc: 'Your academic papers and ongoing research projects.' },
    { key: 'projects',   label: 'Selected Projects',    desc: 'Software and applied statistics projects with GitHub links.' },
    { key: 'experience', label: 'Experience',            desc: 'Internships and industry roles.' },
    { key: 'education',  label: 'Education',             desc: 'Degrees, boards and academic qualifications.' },
    { key: 'awards',     label: 'Honors & Awards',       desc: 'Competitive exam results and recognitions.' },
  ];

  container.innerHTML = sections.map(s => `
    <div class="visibility-row">
      <div>
        <div class="visibility-label">${s.label}</div>
        <div class="visibility-desc">${s.desc}</div>
      </div>
      <label class="toggle-switch" title="Toggle ${s.label} visibility">
        <input type="checkbox" class="vis-checkbox" data-section="${s.key}" ${vis[s.key] !== false ? 'checked' : ''}>
        <span class="toggle-slider"></span>
      </label>
    </div>
  `).join('');

  // Each toggle saves and applies instantly — no Save button needed
  container.querySelectorAll('.vis-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const section = e.target.getAttribute('data-section');
      const data = PortfolioStorage.getData();
      if (!data.sectionVisibility) data.sectionVisibility = {};
      data.sectionVisibility[section] = e.target.checked;
      PortfolioStorage.saveData(data);
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
