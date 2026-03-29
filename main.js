/* ============================================
   HyperNext CSP — App Bootstrap
   Wires auth, navigation, and page routing.
   ============================================ */

// ── Page title map ───────────────────────────
const PAGE_TITLES = {
    dashboard:  'Dashboard',
    deployment: 'Deployment Configuration',
    compute:    'Compute Services',
    storage:    'Storage Services',
    catalog:    'Service Catalog',
    cost:       'Cost Calculator',
    boq:        'BOQ Generator',
    profile:    'My Profile',
    admin:      'Admin Panel'
};

// ── Override navigateTo to include new pages ─
navigateTo = async function(page) {
    currentPage = page;
    document.getElementById('pageTitle').textContent = PAGE_TITLES[page] || page;
    renderNavMenu();
    destroyCharts();

    const area = document.getElementById('contentArea');
    area.scrollTop = 0;

    if (page === 'profile') {
        area.innerHTML = renderProfilePage();
        bindInputs();
        return;
    }
    if (page === 'admin') {
        area.innerHTML = '<div class="empty-state"><h3>Loading…</h3></div>';
        area.innerHTML = await renderAdminPage();
        return;
    }

    // Standard pages from app.js
    area.innerHTML = pages[page]();
    bindInputs();
    if (page === 'dashboard') requestAnimationFrame(renderDashboardCharts);

    // Close mobile sidebar on navigate
    document.getElementById('sidebar').classList.remove('open');
};

// ── User menu dropdown ───────────────────────
function toggleUserMenu() {
    const dd = document.getElementById('userDropdown');
    dd.classList.toggle('open');
}
document.addEventListener('click', (e) => {
    const badge = document.getElementById('userBadge');
    if (badge && !badge.contains(e.target)) {
        document.getElementById('userDropdown')?.classList.remove('open');
    }
});

// ── Override Save button → open modal ────────
function _wireButtons() {
    document.getElementById('saveBtn').onclick = openSaveModal;
    document.getElementById('exportBtn').onclick = exportConfig;
    document.getElementById('menuToggle').onclick = () =>
        document.getElementById('sidebar').classList.toggle('open');
}

// ── Bootstrap ────────────────────────────────
async function bootstrap() {
    _wireButtons();

    // Check existing session
    const session = await supa.getSession();
    if (session?.user) {
        await _initSession(session.user);
    } else {
        showAuthOverlay('login');
    }

    // Listen for auth state changes (e.g. after email confirmation)
    supa.db.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user && !authState.user) {
            await _initSession(session.user);
        } else if (!session && authState.user) {
            authState.user = null;
            authState.profile = null;
            authState.isAdmin = false;
            showAuthOverlay('login');
        }
    });
}

document.addEventListener('DOMContentLoaded', bootstrap);
