/* ============================================
   HyperNext CSP — Auth, Profile & Admin Pages
   ============================================ */

window.authState = { user: null, profile: null, isAdmin: false };

// ── Overlay control ──────────────────────────
function showAuthOverlay(mode = 'login') {
  document.getElementById('authOverlay').style.display = 'flex';
  document.getElementById('appContainer').style.display = 'none';
  renderAuthForm(mode);
}

function hideAuthOverlay() {
  document.getElementById('authOverlay').style.display = 'none';
  document.getElementById('appContainer').style.display = 'flex';
}

// ── Auth form renderers ──────────────────────
function renderAuthForm(mode) {
  document.getElementById('authBox').innerHTML =
    mode === 'register' ? _regForm() :
    mode === 'forgot'   ? _forgotForm() : _loginForm();
}

function _loginForm() { return `
  <div class="auth-logo">
    <span class="logo-icon">H</span>
    <div><div class="auth-brand">HyperNext</div><div class="auth-brand-sub">CSP Cloud Capacity Planner</div></div>
  </div>
  <h2 class="auth-title">Sign In</h2>
  <p class="auth-sub">Access your CSP capacity dashboard</p>
  <div class="form-group"><label class="form-label">Email</label>
    <input class="form-input" type="email" id="liEmail" placeholder="you@company.com" autocomplete="email" onkeydown="if(event.key==='Enter')handleLogin()">
  </div>
  <div class="form-group"><label class="form-label">Password</label>
    <input class="form-input" type="password" id="liPw" placeholder="••••••••" autocomplete="current-password" onkeydown="if(event.key==='Enter')handleLogin()">
  </div>
  <div class="auth-error" id="liErr" style="display:none"></div>
  <button class="btn btn-primary auth-btn" id="liBtn" onclick="handleLogin()">Sign In</button>
  <div class="auth-links">
    <a href="#" onclick="renderAuthForm('forgot')">Forgot password?</a>
    <span>·</span>
    <a href="#" onclick="renderAuthForm('register')">Create account</a>
  </div>`; }

function _regForm() { return `
  <div class="auth-logo">
    <span class="logo-icon">H</span>
    <div><div class="auth-brand">HyperNext</div><div class="auth-brand-sub">CSP Cloud Capacity Planner</div></div>
  </div>
  <h2 class="auth-title">Create CSP Account</h2>
  <p class="auth-sub">Register your Cloud Service Provider</p>
  <div class="form-row">
    <div class="form-group"><label class="form-label">Company Name *</label>
      <input class="form-input" type="text" id="rComp" placeholder="Acme Cloud Ltd."></div>
    <div class="form-group"><label class="form-label">Contact Name *</label>
      <input class="form-input" type="text" id="rName" placeholder="John Smith"></div>
  </div>
  <div class="form-row">
    <div class="form-group"><label class="form-label">Email *</label>
      <input class="form-input" type="email" id="rEmail" placeholder="john@acme.com"></div>
    <div class="form-group"><label class="form-label">Phone</label>
      <input class="form-input" type="tel" id="rPhone" placeholder="+1 234 567 8900"></div>
  </div>
  <div class="form-row">
    <div class="form-group"><label class="form-label">Country</label>
      <select class="form-select" id="rCountry"><option value="">Select...</option>${_countries()}</select></div>
    <div class="form-group"><label class="form-label">Managed Tier</label>
      <select class="form-select" id="rTier"><option>Essential</option><option>Advance</option></select></div>
  </div>
  <div class="form-row">
    <div class="form-group"><label class="form-label">Password *</label>
      <input class="form-input" type="password" id="rPw" placeholder="Min 8 characters"></div>
    <div class="form-group"><label class="form-label">Confirm Password *</label>
      <input class="form-input" type="password" id="rPw2" placeholder="Repeat password"></div>
  </div>
  <div class="auth-error" id="rErr" style="display:none"></div>
  <button class="btn btn-primary auth-btn" onclick="handleRegister()">Create Account</button>
  <div class="auth-links"><span>Already have an account?</span><a href="#" onclick="renderAuthForm('login')">Sign in</a></div>`; }

function _forgotForm() { return `
  <div class="auth-logo"><span class="logo-icon">H</span></div>
  <h2 class="auth-title">Reset Password</h2>
  <p class="auth-sub">Enter your email to receive a reset link</p>
  <div class="form-group"><label class="form-label">Email Address</label>
    <input class="form-input" type="email" id="fEmail" placeholder="you@company.com"></div>
  <div class="auth-error" id="fErr" style="display:none"></div>
  <div class="auth-success" id="fOk" style="display:none"></div>
  <button class="btn btn-primary auth-btn" onclick="handleForgot()">Send Reset Link</button>
  <div class="auth-links"><a href="#" onclick="renderAuthForm('login')">← Back to sign in</a></div>`; }

function _countries() {
  return ['Australia','Bahrain','Bangladesh','Belgium','Brazil','Canada','China','Egypt',
    'France','Germany','Ghana','India','Indonesia','Iraq','Ireland','Israel','Italy',
    'Japan','Jordan','Kenya','Kuwait','Lebanon','Malaysia','Mexico','Morocco',
    'Netherlands','Nigeria','Norway','Oman','Pakistan','Philippines','Qatar',
    'Saudi Arabia','Singapore','South Africa','South Korea','Spain','Sweden',
    'Switzerland','UAE','UK','USA','Turkey','Vietnam'].map(c => `<option>${c}</option>`).join('');
}

// ── Auth handlers ────────────────────────────
async function handleLogin() {
  const email = document.getElementById('liEmail').value.trim();
  const pw    = document.getElementById('liPw').value;
  const err   = document.getElementById('liErr');
  const btn   = document.getElementById('liBtn');
  if (!email || !pw) { _authErr(err, 'Enter email and password.'); return; }
  btn.textContent = 'Signing in…'; btn.disabled = true; err.style.display = 'none';
  const { data, error } = await supa.signIn(email, pw);
  if (error) { _authErr(err, error.message); btn.textContent = 'Sign In'; btn.disabled = false; return; }
  await _initSession(data.user);
}

async function handleRegister() {
  const comp = document.getElementById('rComp').value.trim();
  const name = document.getElementById('rName').value.trim();
  const email= document.getElementById('rEmail').value.trim();
  const phone= document.getElementById('rPhone').value.trim();
  const ctry = document.getElementById('rCountry').value;
  const tier = document.getElementById('rTier').value;
  const pw   = document.getElementById('rPw').value;
  const pw2  = document.getElementById('rPw2').value;
  const err  = document.getElementById('rErr');
  if (!comp || !name || !email || !pw) { _authErr(err, 'Fill in all required fields.'); return; }
  if (pw.length < 8) { _authErr(err, 'Password must be at least 8 characters.'); return; }
  if (pw !== pw2)    { _authErr(err, 'Passwords do not match.'); return; }
  err.style.display = 'none';
  const { data, error } = await supa.signUp(email, pw, { company_name: comp, contact_name: name });
  if (error) { _authErr(err, error.message); return; }
  if (data.user) {
    await supa.upsertProfile(data.user.id, { company_name: comp, contact_name: name, contact_email: email, phone, country: ctry, managed_tier: tier });
    await _initSession(data.user);
  } else {
    document.getElementById('authBox').innerHTML = `
      <div style="text-align:center;padding:48px 20px">
        <div style="font-size:56px;margin-bottom:20px">📧</div>
        <h2>Check your email</h2>
        <p style="color:var(--text-secondary);margin-top:8px">Confirmation sent to <strong>${email}</strong>.<br>Click the link to activate your account.</p>
        <button class="btn btn-outline" style="margin-top:24px" onclick="renderAuthForm('login')">Back to Sign In</button>
      </div>`;
  }
}

async function handleForgot() {
  const email = document.getElementById('fEmail').value.trim();
  const err   = document.getElementById('fErr');
  const ok    = document.getElementById('fOk');
  if (!email) { _authErr(err, 'Enter your email.'); return; }
  err.style.display = 'none';
  const { error } = await supa.resetPassword(email);
  if (error) { _authErr(err, error.message); return; }
  ok.textContent = 'Reset link sent! Check your email.'; ok.style.display = 'block';
}

function _authErr(el, msg) { el.textContent = msg; el.style.display = 'block'; }

// ── Session init ─────────────────────────────
async function _initSession(user) {
  let { data: profile } = await supa.getProfile(user.id);
  if (!profile) {
    await supa.upsertProfile(user.id, {
      company_name: user.user_metadata?.company_name || '',
      contact_name: user.user_metadata?.contact_name || '',
      contact_email: user.email
    });
    const { data: p2 } = await supa.getProfile(user.id);
    profile = p2;
  }
  authState.user    = user;
  authState.profile = profile;
  authState.isAdmin = profile?.role === 'admin';
  hideAuthOverlay();
  _updateBadge();
  renderNavMenu();
  navigateTo('dashboard');
}

async function handleLogout() {
  await supa.signOut();
  authState.user = null; authState.profile = null; authState.isAdmin = false;
  showAuthOverlay('login');
}

// ── Header badge ─────────────────────────────
function _updateBadge() {
  const p = authState.profile;
  const badge = document.getElementById('userBadge');
  if (!p) { badge.style.display = 'none'; return; }
  badge.style.display = 'flex';
  document.getElementById('userAvatar').textContent = (p.company_name || 'C')[0].toUpperCase();
  document.getElementById('userName').textContent  = p.company_name || 'CSP User';
  document.getElementById('userRole').textContent  = authState.isAdmin ? 'Administrator' : (p.managed_tier || 'CSP');
}

// ── Sidebar nav ──────────────────────────────
function renderNavMenu() {
  const items = [
    { p:'dashboard',  l:'Dashboard',        i:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' },
    { p:'deployment', l:'Deployment Config', i:'<circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m-7-7H1m22 0h-4"/>' },
    { p:'compute',    l:'Compute Services',  i:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>' },
    { p:'storage',    l:'Storage Services',  i:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>' },
    { p:'catalog',    l:'Service Catalog',   i:'<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>' },
    { p:'cost',       l:'Cost Calculator',   i:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>' },
    { p:'boq',        l:'BOQ Generator',     i:'<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' },
    { p:'profile',    l:'My Profile',        i:'<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>' }
  ];
  if (authState.isAdmin) items.push(
    { p:'admin', l:'Admin Panel', i:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', admin:true }
  );
  document.getElementById('navMenu').innerHTML = items.map(({ p, l, i, admin }) => `
    <li class="nav-item ${currentPage === p ? 'active' : ''} ${admin ? 'nav-admin' : ''}"
        data-page="${p}" onclick="navigateTo('${p}')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${i}</svg>
      <span>${l}</span>
    </li>`).join('');
}

// ── Save modal ───────────────────────────────
function openSaveModal() {
  document.getElementById('saveModal').style.display = 'flex';
}
function closeSaveModal() {
  document.getElementById('saveModal').style.display = 'none';
}
async function confirmSave() {
  const name   = document.getElementById('configName').value.trim() || 'Default';
  const region = document.getElementById('configRegion').value.trim() || 'Region 1';
  const az     = document.getElementById('configAZ').value.trim() || 'AZ1';
  if (!authState.user) { showToast('Not logged in', 'error'); return; }
  const { data, error } = await supa.saveConfig(authState.user.id, name, region, az, state);
  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  closeSaveModal();
  showToast(`Configuration "${name}" saved to cloud ✓`, 'success');
}

// ── Profile page ─────────────────────────────
function renderProfilePage() {
  const p = authState.profile || {};
  const html = `
    <div class="grid-2 mb-28">
      <div class="card">
        <div class="section-header"><span class="section-number">P</span><h2>CSP Profile</h2></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Company Name</label>
            <input class="form-input" id="pComp" value="${esc(p.company_name)}"></div>
          <div class="form-group"><label class="form-label">Contact Name</label>
            <input class="form-input" id="pName" value="${esc(p.contact_name)}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Email</label>
            <input class="form-input" value="${esc(p.contact_email)}" disabled></div>
          <div class="form-group"><label class="form-label">Phone</label>
            <input class="form-input" id="pPhone" value="${esc(p.phone)}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Country</label>
            <input class="form-input" id="pCountry" value="${esc(p.country)}"></div>
          <div class="form-group"><label class="form-label">Managed Tier</label>
            <select class="form-select" id="pTier">
              <option ${p.managed_tier==='Essential'?'selected':''}>Essential</option>
              <option ${p.managed_tier==='Advance'?'selected':''}>Advance</option>
            </select></div>
        </div>
        <button class="btn btn-primary" onclick="saveProfile()">Save Profile</button>
      </div>
      <div class="card">
        <div class="section-header"><span class="section-number">A</span><h2>Account Info</h2></div>
        ${inlineStat('Account ID', `<span style="font-family:monospace;font-size:11px">${(p.id||'').substring(0,20)}…</span>`)}
        ${inlineStat('Role', `<span class="badge ${p.role==='admin'?'badge-danger':'badge-primary'}">${p.role||'csp'}</span>`)}
        ${inlineStat('Status', `<span class="badge ${p.status==='active'?'badge-success':'badge-warning'}"><span class="badge-dot"></span>${p.status||'active'}</span>`)}
        ${inlineStat('Tier', `<span class="badge badge-primary">${p.managed_tier||'Essential'}</span>`)}
        ${inlineStat('Member Since', p.created_at ? new Date(p.created_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}) : '—')}
        ${inlineStat('Last Updated', p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '—')}
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <div><div class="card-title">Saved Configurations</div>
          <div class="card-subtitle">Capacity configurations stored in the cloud</div></div>
        <button class="btn btn-primary btn-sm" onclick="openSaveModal()">+ Save Current</button>
      </div>
      <div id="cfgList"><div class="empty-state"><h3>Loading…</h3></div></div>
    </div>`;
  // Load configs async after render
  setTimeout(loadProfileConfigs, 50);
  return html;
}

async function loadProfileConfigs() {
  const el = document.getElementById('cfgList');
  if (!el || !authState.user) return;
  const { data, error } = await supa.getConfigs(authState.user.id);
  if (error || !data?.length) {
    el.innerHTML = `<div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
      <h3>No saved configurations</h3><p>Click "+ Save Current" to save your first config</p></div>`;
    return;
  }
  el.innerHTML = `<div class="table-container"><table>
    <thead><tr><th>Name</th><th>Region</th><th>AZ</th><th>Last Saved</th><th>Actions</th></tr></thead>
    <tbody>${data.map(c => `<tr>
      <td class="fw-600">${esc(c.name)}</td>
      <td>${esc(c.region)}</td><td>${esc(c.az)}</td>
      <td class="text-muted">${new Date(c.updated_at).toLocaleDateString()}</td>
      <td><div style="display:flex;gap:8px">
        <button class="btn btn-sm btn-outline" onclick="loadConfig('${c.id}')">Load</button>
        <button class="btn btn-sm btn-danger" onclick="deleteConfigUI('${c.id}','${esc(c.name)}')">Delete</button>
      </div></td></tr>`).join('')}
    </tbody></table></div>`;
}

async function saveProfile() {
  const { data, error } = await supa.updateProfile(authState.user.id, {
    company_name: document.getElementById('pComp').value.trim(),
    contact_name: document.getElementById('pName').value.trim(),
    phone:        document.getElementById('pPhone').value.trim(),
    country:      document.getElementById('pCountry').value.trim(),
    managed_tier: document.getElementById('pTier').value
  });
  if (error) { showToast('Save failed: ' + error.message, 'error'); return; }
  authState.profile = data;
  _updateBadge();
  showToast('Profile updated ✓', 'success');
}

async function loadConfig(id) {
  const { data, error } = await supa.getConfigById(id);
  if (error || !data) { showToast('Failed to load config', 'error'); return; }
  deepMerge(state, data.state);
  showToast(`"${data.name}" loaded ✓`, 'success');
  navigateTo('dashboard');
}

async function deleteConfigUI(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  const { error } = await supa.deleteConfig(id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  showToast('Configuration deleted', 'success');
  loadProfileConfigs();
}

// ── Admin page ───────────────────────────────
async function renderAdminPage() {
  const { data: profiles, error } = await supa.getAllProfiles();
  if (error) return `<div class="card"><div class="empty-state"><h3>Access denied or error</h3><p>${error.message}</p></div></div>`;
  const total  = profiles?.length || 0;
  const active = profiles?.filter(p => p.status === 'active').length || 0;
  const adv    = profiles?.filter(p => p.managed_tier === 'Advance').length || 0;
  return `
    <div class="stats-grid mb-28">
      <div class="stat-card"><div class="stat-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/></svg></div>
        <div class="stat-value">${total}</div><div class="stat-label">Total CSPs</div></div>
      <div class="stat-card"><div class="stat-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
        <div class="stat-value">${active}</div><div class="stat-label">Active CSPs</div></div>
      <div class="stat-card"><div class="stat-icon blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
        <div class="stat-value">${adv}</div><div class="stat-label">Advance Tier</div></div>
      <div class="stat-card"><div class="stat-icon orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
        <div class="stat-value">${total - active}</div><div class="stat-label">Suspended</div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <div><div class="card-title">CSP Directory</div>
          <div class="card-subtitle">All registered Cloud Service Providers</div></div>
      </div>
      <div class="table-container"><table>
        <thead><tr><th>Company</th><th>Contact</th><th>Country</th><th>Tier</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
        <tbody>${(profiles||[]).map(p => `<tr>
          <td><div class="fw-600">${esc(p.company_name)||'—'}</div>
            <div class="text-sm text-muted">${esc(p.contact_email)}</div></td>
          <td>${esc(p.contact_name)||'—'}</td>
          <td>${esc(p.country)||'—'}</td>
          <td><span class="badge badge-primary">${p.managed_tier||'Essential'}</span></td>
          <td><span class="badge ${p.role==='admin'?'badge-danger':'badge-muted'}">${p.role||'csp'}</span></td>
          <td><span class="badge ${p.status==='active'?'badge-success':'badge-warning'}">
            <span class="badge-dot"></span>${p.status||'active'}</span></td>
          <td class="text-muted">${new Date(p.created_at).toLocaleDateString()}</td>
          <td><div style="display:flex;gap:6px">
            <button class="btn btn-sm btn-outline" onclick="adminToggle('${p.id}','${p.status||'active'}')">${(p.status||'active')==='active'?'Suspend':'Activate'}</button>
            ${p.role!=='admin'?`<button class="btn btn-sm btn-outline" onclick="adminPromote('${p.id}')">Make Admin</button>`:''}
          </div></td></tr>`).join('')}
        </tbody>
      </table></div>
    </div>`;
}

async function adminToggle(id, status) {
  const next = status === 'active' ? 'suspended' : 'active';
  const { error } = await supa.updateAnyProfile(id, { status: next });
  if (error) { showToast('Error: ' + error.message, 'error'); return; }
  showToast(`CSP ${next}`, 'success'); navigateTo('admin');
}

async function adminPromote(id) {
  if (!confirm('Promote this user to admin? They will see all CSP profiles.')) return;
  const { error } = await supa.updateAnyProfile(id, { role: 'admin' });
  if (error) { showToast('Error: ' + error.message, 'error'); return; }
  showToast('User promoted to admin ✓', 'success'); navigateTo('admin');
}

function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
