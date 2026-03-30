/**
 * Stardogwalker – Single-Page Application
 * Hash-based router, page rendering, and UI interactions.
 */

// ---- Utilities ----

function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `sdw-toast toast-${type}`;
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

function loading(html = '') {
  return `<div class="loading-spinner"><div class="spinner-ring"></div>${html ? `<p>${html}</p>` : ''}</div>`;
}

function emptyState(icon, title, body = '') {
  return `<div class="empty-state">
    <div class="empty-icon">${icon}</div>
    <h5>${title}</h5>
    ${body ? `<p>${body}</p>` : ''}
  </div>`;
}

function statusBadge(status) {
  return `<span class="status-badge status-${status}">${status.replace('_', ' ')}</span>`;
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function fmtDateTime(dateStr) {
  if (!dateStr) return '—';
  return `${fmt(dateStr)} ${fmtTime(dateStr)}`;
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function initials(first, last) {
  return `${(first || '?')[0]}${(last || '?')[0]}`.toUpperCase();
}

// ---- Auth helpers ----

function isLoggedIn() { return !!API.getAccessToken(); }

function currentUser() { return API.getUser(); }

function isWalker() {
  const u = currentUser();
  return u && u.role === 'walker';
}

function isOwner() {
  const u = currentUser();
  return u && u.role === 'owner';
}

// ---- Modal helper ----

function showModal(title, bodyHtml, footerHtml = '') {
  $('#modal-title').innerHTML = title;
  $('#modal-body').innerHTML = bodyHtml;
  $('#modal-footer').innerHTML = footerHtml ||
    `<button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>`;
  const m = new bootstrap.Modal(document.getElementById('main-modal'));
  m.show();
  return m;
}

function hideModal() {
  bootstrap.Modal.getInstance(document.getElementById('main-modal'))?.hide();
}

// ---- Router ----

const routes = {};

function route(hash, fn) {
  routes[hash] = fn;
}

function navigate(hash) {
  window.location.hash = hash;
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('load', handleRoute);

function handleRoute() {
  const hash = window.location.hash || '#/';
  const key = hash.split('?')[0];

  // Check auth for protected routes
  if (key.startsWith('#/dashboard') && !isLoggedIn()) {
    navigate('#/login');
    return;
  }

  const fn = routes[key] || routes['*'];
  if (fn) fn(hash);
}

// ---- Navbar ----

function renderNavbar() {
  const user = currentUser();
  const navbar = document.getElementById('navbar');
  navbar.innerHTML = `
  <nav class="navbar navbar-expand-lg">
    <div class="container">
      <a class="navbar-brand" href="#/">🐾 <span>Star<span class="paw">dog</span>walker</span></a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navCollapse">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navCollapse">
        <ul class="navbar-nav me-auto">
          <li class="nav-item"><a class="nav-link" href="#/">Home</a></li>
          <li class="nav-item"><a class="nav-link" href="#/register-interest">Register Interest</a></li>
        </ul>
        <div class="d-flex align-items-center gap-2">
          ${user ? `
            <span class="text-white-50 d-none d-lg-inline" style="font-size:0.85rem">
              👋 ${esc(user.firstName)}
            </span>
            <a href="#/dashboard" class="btn btn-nav-cta btn-sm">Dashboard</a>
            <button class="btn btn-outline-light btn-sm" id="btn-logout">Logout</button>
          ` : `
            <a href="#/login" class="btn btn-outline-light btn-sm">Log in</a>
            <a href="#/register" class="btn btn-nav-cta btn-sm">Get started</a>
          `}
        </div>
      </div>
    </div>
  </nav>`;

  document.getElementById('btn-logout')?.addEventListener('click', doLogout);
}

async function doLogout() {
  try { await API.logout(); } catch {}
  API.clearTokens();
  renderNavbar();
  navigate('#/');
  toast('You have been logged out.', 'info');
}

// ---- Landing page ----

route('#/', () => {
  document.getElementById('app').innerHTML = `
  <!-- Hero -->
  <section class="hero">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg-6">
          <div class="hero-badge">🐕 Cardiff, South Wales</div>
          <h1>Professional Dog Walking You Can <span>Trust</span></h1>
          <p class="lead">Stardogwalker keeps your beloved dog happy, safe and active. Book online, track walks in real time, and stay connected.</p>
          <div class="d-flex flex-wrap gap-3 mt-4">
            <a href="#/register-interest" class="btn btn-primary btn-lg px-4">Register your interest</a>
            <a href="#/register" class="btn btn-outline-light btn-lg px-4">Create an account</a>
          </div>
        </div>
        <div class="col-lg-6 d-none d-lg-flex justify-content-center" style="font-size:9rem;opacity:0.8">
          🐕
        </div>
      </div>
    </div>
  </section>

  <!-- Services -->
  <section class="py-5 bg-white">
    <div class="container">
      <div class="text-center mb-4">
        <h2 class="fw-800" style="font-weight:800">Our Services</h2>
        <p class="text-muted">Flexible dog walking packages to suit your schedule</p>
      </div>
      <div class="row g-4">
        <div class="col-md-4">
          <div class="card service-card h-100">
            <span class="icon">🐾</span>
            <h5>Solo Walk</h5>
            <p class="text-muted small">One-to-one attention for your dog. Perfect for anxious or special-needs pups.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card service-card h-100">
            <span class="icon">🐕‍🦺</span>
            <h5>Group Walk</h5>
            <p class="text-muted small">Socialise with other friendly dogs in a small group, up to 4 dogs.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card service-card h-100">
            <span class="icon">🏡</span>
            <h5>Puppy Visit</h5>
            <p class="text-muted small">Short home visits for puppies not yet ready for longer walks.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section class="py-5">
    <div class="container">
      <div class="row g-4 align-items-center">
        <div class="col-lg-6">
          <h2 style="font-weight:800">Everything managed in one place</h2>
          <p class="text-muted mb-4">No more WhatsApp threads or missed bookings. Stardogwalker gives you a clear, professional platform for managing every walk.</p>
          <div class="d-flex flex-column gap-3">
            <div class="d-flex gap-3 align-items-start">
              <div class="feature-icon">📅</div>
              <div>
                <h6 class="fw-bold mb-1">Easy online booking</h6>
                <p class="text-muted small mb-0">Submit walk requests with date, time, duration and which dogs to include.</p>
              </div>
            </div>
            <div class="d-flex gap-3 align-items-start">
              <div class="feature-icon">📍</div>
              <div>
                <h6 class="fw-bold mb-1">Real-time walk updates</h6>
                <p class="text-muted small mb-0">Receive photos and notes while your dog is out on a walk.</p>
              </div>
            </div>
            <div class="d-flex gap-3 align-items-start">
              <div class="feature-icon">🧾</div>
              <div>
                <h6 class="fw-bold mb-1">Simple invoicing</h6>
                <p class="text-muted small mb-0">View and pay invoices online. No manual bank transfers needed.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6 text-center" style="font-size:7rem;opacity:0.7">🦮</div>
      </div>
    </div>
  </section>

  <!-- Testimonials -->
  <section class="py-5 bg-white">
    <div class="container">
      <h2 class="text-center mb-4" style="font-weight:800">Happy owners, happy dogs 🐶</h2>
      <div class="row g-4">
        <div class="col-md-4">
          <div class="testimonial-card">
            <p class="quote">"Booking walks has never been easier. I can see exactly when my dog is out and get little updates during the walk."</p>
            <div class="author">— Sarah T., Roath</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="testimonial-card">
            <p class="quote">"Max loves his group walks. The profile system means the walker always knows about his little quirks!"</p>
            <div class="author">— James K., Canton</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="testimonial-card">
            <p class="quote">"The invoicing is brilliant. I just press pay and it's done. No more fiddling with bank transfers."</p>
            <div class="author">— Priya M., Pontprennau</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Banner -->
  <section class="py-5" style="background:var(--sdw-orange)">
    <div class="container text-center text-white">
      <h2 style="font-weight:800">Ready to get started?</h2>
      <p class="lead opacity-90 mb-4">Register your interest today and we'll be in touch within 24 hours.</p>
      <a href="#/register-interest" class="btn btn-light btn-lg px-5 fw-bold" style="color:var(--sdw-orange)">Register Interest</a>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="container">
      <div class="row">
        <div class="col-md-4 mb-3">
          <h5 class="text-white fw-bold">🐾 Stardogwalker</h5>
          <p class="small">Professional dog walking services in Cardiff, South Wales.</p>
        </div>
        <div class="col-md-4 mb-3">
          <h6 class="text-white fw-bold mb-2">Links</h6>
          <ul class="list-unstyled small">
            <li><a href="#/">Home</a></li>
            <li><a href="#/register-interest">Register Interest</a></li>
            <li><a href="#/login">Log in</a></li>
          </ul>
        </div>
        <div class="col-md-4 mb-3">
          <h6 class="text-white fw-bold mb-2">Contact</h6>
          <p class="small">📧 hello@stardogwalker.co.uk<br>📞 07700 900000<br>📍 Cardiff, CF10</p>
        </div>
      </div>
      <hr style="border-color:rgba(255,255,255,0.1)">
      <p class="small text-center mb-0">© 2026 Stardogwalker. All rights reserved.</p>
    </div>
  </footer>
  `;
});

// ---- Register Interest (public) ----

route('#/register-interest', () => {
  document.getElementById('app').innerHTML = `
  <section class="interest-section">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-7">
          <div class="text-center mb-4">
            <div style="font-size:3rem">🐾</div>
            <h2 style="font-weight:800">Register Your Interest</h2>
            <p class="text-muted">Tell us about yourself and your dog(s). We'll review your request and be in touch within 24 hours.</p>
          </div>
          <div class="card">
            <div class="card-body p-4">
              <form id="interest-form">
                <div class="row g-3">
                  <div class="col-sm-6">
                    <label class="form-label">First name</label>
                    <input type="text" class="form-control" name="firstName" required>
                  </div>
                  <div class="col-sm-6">
                    <label class="form-label">Last name</label>
                    <input type="text" class="form-control" name="lastName" required>
                  </div>
                  <div class="col-sm-6">
                    <label class="form-label">Email address</label>
                    <input type="email" class="form-control" name="email" required>
                  </div>
                  <div class="col-sm-6">
                    <label class="form-label">Phone number</label>
                    <input type="tel" class="form-control" name="phone" required>
                  </div>
                  <div class="col-sm-6">
                    <label class="form-label">Postcode</label>
                    <input type="text" class="form-control" name="postcode" placeholder="e.g. CF10 1AA" required>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Tell us about your dog(s)</label>
                    <textarea class="form-control" name="dogDescription" rows="4" required
                      placeholder="Breed, age, temperament, any special needs..."></textarea>
                  </div>
                  <div class="col-12 mt-2">
                    <button type="submit" class="btn btn-primary btn-lg w-100">Send Interest Request 🐾</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  document.getElementById('interest-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const btn = e.target.querySelector('[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      await API.createInterestRequest({
        firstName: fd.get('firstName'),
        lastName: fd.get('lastName'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        postcode: fd.get('postcode'),
        dogDescription: fd.get('dogDescription'),
      });
      document.getElementById('app').innerHTML = `
      <section class="interest-section">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-lg-6 text-center">
              <div style="font-size:4rem;margin-bottom:16px">🎉</div>
              <h2 style="font-weight:800">Request Received!</h2>
              <p class="text-muted">Thanks for getting in touch. We'll review your details and get back to you within 24 hours.</p>
              <a href="#/" class="btn btn-primary mt-3">Back to home</a>
            </div>
          </div>
        </div>
      </section>`;
    } catch (err) {
      toast(err.message || 'Failed to submit. Please try again.', 'error');
      btn.disabled = false;
      btn.textContent = 'Send Interest Request 🐾';
    }
  });
});

// ---- Login ----

route('#/login', () => {
  if (isLoggedIn()) { navigate('#/dashboard'); return; }
  document.getElementById('app').innerHTML = `
  <div class="container">
    <div class="auth-card">
      <div class="card">
        <div class="card-header">
          <h4 class="mb-0">🐾 Log in to Stardogwalker</h4>
        </div>
        <div class="card-body">
          <form id="login-form">
            <div class="mb-3">
              <label class="form-label">Email address</label>
              <input type="email" class="form-control" name="email" required autofocus>
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" name="password" required>
            </div>
            <button type="submit" class="btn btn-primary w-100 btn-lg">Log in</button>
          </form>
          <div class="divider"></div>
          <p class="text-center text-muted small mb-0">
            Don't have an account? <a href="#/register">Register here</a>
          </p>
        </div>
      </div>
    </div>
  </div>`;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const btn = e.target.querySelector('[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Logging in…';
    try {
      const data = await API.login(fd.get('email'), fd.get('password'));
      API.saveTokens(data.accessToken, data.refreshToken);
      API.saveUser(data.user);
      renderNavbar();
      navigate('#/dashboard');
      toast(`Welcome back, ${data.user.firstName}! 🐾`, 'success');
    } catch (err) {
      toast(err.message || 'Login failed. Check your credentials.', 'error');
      btn.disabled = false;
      btn.textContent = 'Log in';
    }
  });
});

// ---- Register ----

route('#/register', () => {
  if (isLoggedIn()) { navigate('#/dashboard'); return; }
  document.getElementById('app').innerHTML = `
  <div class="container">
    <div class="auth-card">
      <div class="card">
        <div class="card-header">
          <h4 class="mb-0">🐾 Create your account</h4>
        </div>
        <div class="card-body">
          <form id="reg-form">
            <div class="row g-3">
              <div class="col-sm-6">
                <label class="form-label">First name</label>
                <input type="text" class="form-control" name="firstName" required>
              </div>
              <div class="col-sm-6">
                <label class="form-label">Last name</label>
                <input type="text" class="form-control" name="lastName" required>
              </div>
              <div class="col-12">
                <label class="form-label">Email address</label>
                <input type="email" class="form-control" name="email" required>
              </div>
              <div class="col-12">
                <label class="form-label">Password</label>
                <input type="password" class="form-control" name="password" required minlength="8">
                <div class="form-text">Minimum 8 characters.</div>
              </div>
              <div class="col-12">
                <label class="form-label">I am a…</label>
                <select class="form-select" name="role" required>
                  <option value="owner">Dog Owner</option>
                  <option value="walker">Dog Walker</option>
                </select>
              </div>
              <div class="col-12 mt-2">
                <button type="submit" class="btn btn-primary w-100 btn-lg">Create account</button>
              </div>
            </div>
          </form>
          <div class="divider"></div>
          <p class="text-center text-muted small mb-0">
            Already have an account? <a href="#/login">Log in</a>
          </p>
        </div>
      </div>
    </div>
  </div>`;

  document.getElementById('reg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const btn = e.target.querySelector('[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Creating account…';
    try {
      const data = await API.register(
        fd.get('email'), fd.get('password'),
        fd.get('firstName'), fd.get('lastName'), fd.get('role')
      );
      API.saveTokens(data.accessToken, data.refreshToken);
      API.saveUser(data.user);
      renderNavbar();
      navigate('#/dashboard');
      toast(`Welcome to Stardogwalker, ${data.user.firstName}! 🎉`, 'success');
    } catch (err) {
      toast(err.message || 'Registration failed. Please try again.', 'error');
      btn.disabled = false;
      btn.textContent = 'Create account';
    }
  });
});

// ---- Dashboard router ----

route('#/dashboard', () => {
  if (!isLoggedIn()) { navigate('#/login'); return; }
  if (isWalker()) {
    navigate('#/dashboard/walker/interest-requests');
  } else {
    navigate('#/dashboard/owner/walk-requests');
  }
});

// ============================================================
// OWNER DASHBOARD
// ============================================================

function ownerSidebar(active) {
  const user = currentUser();
  return `
  <div class="sidebar">
    <div class="sidebar-user">
      <div class="avatar">${initials(user?.firstName, user?.lastName)}</div>
      <div class="user-name">${esc(user?.firstName)} ${esc(user?.lastName)}</div>
      <div class="user-role">Dog Owner</div>
    </div>
    <ul class="sidebar-nav">
      <li><a href="#/dashboard/owner/walk-requests" class="${active==='walk-requests'?'active':''}"><span class="nav-icon">📋</span> Walk Requests</a></li>
      <li><a href="#/dashboard/owner/walks" class="${active==='walks'?'active':''}"><span class="nav-icon">🦮</span> My Walks</a></li>
      <li><a href="#/dashboard/owner/dogs" class="${active==='dogs'?'active':''}"><span class="nav-icon">🐶</span> My Dogs</a></li>
      <li><a href="#/dashboard/owner/invoices" class="${active==='invoices'?'active':''}"><span class="nav-icon">🧾</span> Invoices</a></li>
      <li><a href="#/dashboard/owner/recurring" class="${active==='recurring'?'active':''}"><span class="nav-icon">🔁</span> Recurring Walks</a></li>
    </ul>
    <div class="sidebar-footer">
      <a href="#" id="sidebar-logout">🚪 Log out</a>
    </div>
  </div>`;
}

function walkerSidebar(active) {
  const user = currentUser();
  return `
  <div class="sidebar">
    <div class="sidebar-user">
      <div class="avatar">${initials(user?.firstName, user?.lastName)}</div>
      <div class="user-name">${esc(user?.firstName)} ${esc(user?.lastName)}</div>
      <div class="user-role">Dog Walker</div>
    </div>
    <ul class="sidebar-nav">
      <li><a href="#/dashboard/walker/interest-requests" class="${active==='interest-requests'?'active':''}"><span class="nav-icon">📥</span> Interest Requests</a></li>
      <li><a href="#/dashboard/walker/walk-requests" class="${active==='walk-requests'?'active':''}"><span class="nav-icon">📋</span> Walk Requests</a></li>
      <li><a href="#/dashboard/walker/walks" class="${active==='walks'?'active':''}"><span class="nav-icon">🦮</span> Walks</a></li>
      <li><a href="#/dashboard/walker/owners" class="${active==='owners'?'active':''}"><span class="nav-icon">👤</span> Owners</a></li>
      <li><a href="#/dashboard/walker/invoices" class="${active==='invoices'?'active':''}"><span class="nav-icon">🧾</span> Invoices</a></li>
    </ul>
    <div class="sidebar-footer">
      <a href="#" id="sidebar-logout">🚪 Log out</a>
    </div>
  </div>`;
}

function dashLayout(sidebar, content) {
  return `<div class="dashboard-layout">${sidebar}<div class="main-content">${content}</div></div>`;
}

function bindSidebarLogout() {
  document.getElementById('sidebar-logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    doLogout();
  });
}

// ---- Owner: Walk Requests ----

route('#/dashboard/owner/walk-requests', async () => {
  if (!isLoggedIn() || !isOwner()) { navigate('#/login'); return; }
  document.getElementById('app').innerHTML = dashLayout(
    ownerSidebar('walk-requests'),
    `<div class="section-header">
       <div><div class="page-title">Walk Requests</div><div class="page-subtitle">Submit and track walk bookings</div></div>
       <button class="btn btn-primary" id="btn-new-request">+ New Request</button>
     </div>
     <div id="walk-requests-content">${loading()}</div>`
  );
  bindSidebarLogout();
  document.getElementById('btn-new-request').addEventListener('click', showNewWalkRequestModal);
  await loadOwnerWalkRequests();
});

async function loadOwnerWalkRequests() {
  const el = document.getElementById('walk-requests-content');
  if (!el) return;
  try {
    const data = await API.listWalkRequests();
    const items = data.data || [];
    if (!items.length) {
      el.innerHTML = emptyState('📋', 'No walk requests yet', 'Submit your first walk request to get started.');
      return;
    }
    el.innerHTML = `
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead><tr>
              <th>Date</th><th>Time</th><th>Duration</th><th>Type</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              ${items.map(r => `
              <tr>
                <td>${fmt(r.requestedDate)}</td>
                <td>${r.requestedTime || '—'}</td>
                <td>${r.durationMinutes ? r.durationMinutes + ' min' : '—'}</td>
                <td>${esc(r.walkType || '—')}</td>
                <td>${statusBadge(r.status)}</td>
                <td>
                  ${r.status === 'pending' ? `<button class="btn btn-sm btn-outline-danger" onclick="cancelWalkReq('${r.id}')">Cancel</button>` : ''}
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  } catch (err) {
    el.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  }
}

window.cancelWalkReq = async (id) => {
  if (!confirm('Cancel this walk request?')) return;
  try {
    await API.cancelWalkRequest(id);
    toast('Walk request cancelled.', 'info');
    await loadOwnerWalkRequests();
  } catch (err) {
    toast(err.message, 'error');
  }
};

async function showNewWalkRequestModal() {
  const user = currentUser();
  let dogsHtml = '';
  try {
    const dogsData = await API.listDogs(user.profileId || user.id);
    const dogs = dogsData.data || [];
    dogsHtml = dogs.length
      ? dogs.map(d => `<div class="form-check">
          <input class="form-check-input" type="checkbox" name="dogIds" value="${d.id}" id="dog_${d.id}">
          <label class="form-check-label" for="dog_${d.id}">${esc(d.name)} (${esc(d.breed)})</label>
        </div>`).join('')
      : '<p class="text-muted small">No dogs found. <a href="#/dashboard/owner/dogs">Add a dog first.</a></p>';
  } catch {
    dogsHtml = '<p class="text-muted small">Could not load dogs.</p>';
  }

  // Default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  showModal('📋 New Walk Request', `
    <form id="new-walk-req-form">
      <div class="row g-3">
        <div class="col-sm-6">
          <label class="form-label">Date</label>
          <input type="date" class="form-control" name="requestedDate" value="${defaultDate}" required>
        </div>
        <div class="col-sm-6">
          <label class="form-label">Time</label>
          <input type="time" class="form-control" name="requestedTime" value="09:00" required>
        </div>
        <div class="col-sm-6">
          <label class="form-label">Duration (minutes)</label>
          <select class="form-select" name="durationMinutes" required>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60" selected>60 minutes</option>
            <option value="90">90 minutes</option>
          </select>
        </div>
        <div class="col-sm-6">
          <label class="form-label">Walk type</label>
          <select class="form-select" name="walkType" required>
            <option value="solo">Solo</option>
            <option value="group">Group</option>
            <option value="puppy_visit">Puppy Visit</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label">Select dogs</label>
          ${dogsHtml}
        </div>
        <div class="col-12">
          <label class="form-label">Notes (optional)</label>
          <textarea class="form-control" name="notes" rows="2" placeholder="Any special instructions…"></textarea>
        </div>
      </div>
    </form>`,
    `<button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
     <button class="btn btn-primary" id="submit-walk-req">Submit Request</button>`
  );

  document.getElementById('submit-walk-req').addEventListener('click', async () => {
    const form = document.getElementById('new-walk-req-form');
    const fd = new FormData(form);
    const dogIds = fd.getAll('dogIds');
    const btn = document.getElementById('submit-walk-req');
    btn.disabled = true;
    btn.textContent = 'Submitting…';
    try {
      await API.createWalkRequest({
        ownerId: user.profileId || user.id,
        requestedDate: fd.get('requestedDate'),
        requestedTime: fd.get('requestedTime'),
        durationMinutes: parseInt(fd.get('durationMinutes')),
        walkType: fd.get('walkType'),
        dogIds,
        notes: fd.get('notes') || undefined,
      });
      hideModal();
      toast('Walk request submitted! 🐾', 'success');
      await loadOwnerWalkRequests();
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Submit Request';
    }
  });
}

// ---- Owner: Walks ----

route('#/dashboard/owner/walks', async () => {
  if (!isLoggedIn() || !isOwner()) { navigate('#/login'); return; }
  document.getElementById('app').innerHTML = dashLayout(
    ownerSidebar('walks'),
    `<div class="section-header">
       <div><div class="page-title">My Walks</div><div class="page-subtitle">View your scheduled and completed walks</div></div>
     </div>
     <div id="walks-content">${loading()}</div>`
  );
  bindSidebarLogout();

  try {
    const data = await API.listWalks();
    const items = data.data || [];
    const el = document.getElementById('walks-content');
    if (!items.length) {
      el.innerHTML = emptyState('🦮', 'No walks yet', 'Your scheduled walks will appear here once a walk request is accepted.');
      return;
    }
    el.innerHTML = `
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead><tr><th>Date</th><th>Time</th><th>Duration</th><th>Type</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${items.map(w => `
              <tr>
                <td>${fmt(w.scheduledDate)}</td>
                <td>${w.scheduledTime || '—'}</td>
                <td>${w.durationMinutes ? w.durationMinutes + ' min' : '—'}</td>
                <td>${esc(w.walkType || '—')}</td>
                <td>${statusBadge(w.status)}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary" onclick="viewWalkUpdates('${w.id}', '${esc(w.status)}')">View</button>
                  ${w.status === 'scheduled' ? `<button class="btn btn-sm btn-outline-danger ms-1" onclick="ownerCancelWalk('${w.id}')">Cancel</button>` : ''}
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  } catch (err) {
    document.getElementById('walks-content').innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  }
});

window.ownerCancelWalk = async (id) => {
  const reason = prompt('Reason for cancellation:');
  if (reason === null) return;
  try {
    await API.cancelWalk(id, reason || 'Cancelled by owner');
    toast('Walk cancelled.', 'info');
    navigate('#/dashboard/owner/walks');
  } catch (err) {
    toast(err.message, 'error');
  }
};

window.viewWalkUpdates = async (walkId, status) => {
  const el = document.createElement('div');
  el.innerHTML = loading('Loading updates…');
  showModal('🦮 Walk Updates', el.innerHTML);
  try {
    const data = await API.listWalkUpdates(walkId);
    const updates = data.data || [];
    const body = updates.length
      ? updates.map(u => `
        <div class="update-card">
          <div class="update-meta">${fmtDateTime(u.createdAt)}</div>
          <p class="mb-0">${esc(u.note || u.message || '')}</p>
        </div>`).join('')
      : emptyState('📝', 'No updates yet', status === 'in_progress' ? 'Updates will appear here during the walk.' : '');
    $('#modal-body').innerHTML = body;
  } catch (err) {
    $('#modal-body').innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  }
};

// ---- Owner: Dogs ----

route('#/dashboard/owner/dogs', async () => {
  if (!isLoggedIn() || !isOwner()) { navigate('#/login'); return; }
  document.getElementById('app').innerHTML = dashLayout(
    ownerSidebar('dogs'),
    `<div class="section-header">
       <div><div class="page-title">My Dogs</div><div class="page-subtitle">Manage your dog profiles</div></div>
       <button class="btn btn-primary" id="btn-add-dog">+ Add Dog</button>
     </div>
     <div id="dogs-content">${loading()}</div>`
  );
  bindSidebarLogout();
  document.getElementById('btn-add-dog').addEventListener('click', () => showDogModal());
  await loadOwnerDogs();
});

async function loadOwnerDogs() {
  const el = document.getElementById('dogs-content');
  if (!el) return;
  const user = currentUser();
  try {
    const data = await API.listDogs(user.profileId || user.id);
    const dogs = data.data || [];
    if (!dogs.length) {
      el.innerHTML = emptyState('🐶', 'No dogs yet', 'Add your first dog to start booking walks.');
      return;
    }
    el.innerHTML = `<div class="row g-3">
      ${dogs.map(d => `
      <div class="col-md-6 col-lg-4">
        <div class="dog-card">
          <div class="dog-avatar">🐕</div>
          <div class="flex-grow-1">
            <h6 class="mb-1 fw-bold">${esc(d.name)}</h6>
            <div class="text-muted small">${esc(d.breed || '—')} · ${d.dateOfBirth ? fmt(d.dateOfBirth) : 'DOB unknown'}</div>
            ${d.medicalNotes ? `<div class="small mt-1"><strong>Medical:</strong> ${esc(d.medicalNotes)}</div>` : ''}
            <div class="mt-2 d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary" onclick="editDog('${d.id}')">Edit</button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteDogById('${d.id}')">Delete</button>
            </div>
          </div>
        </div>
      </div>`).join('')}
    </div>`;
  } catch (err) {
    el.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  }
}

async function showDogModal(dogId) {
  const user = currentUser();
  const ownerId = user.profileId || user.id;
  let dog = null;
  if (dogId) {
    try {
      const d = await API.listDogs(ownerId);
      dog = (d.data || []).find(x => x.id === dogId);
    } catch {}
  }

  showModal(dog ? `✏️ Edit ${esc(dog.name)}` : '🐶 Add a Dog', `
    <form id="dog-form">
      <div class="row g-3">
        <div class="col-sm-6">
          <label class="form-label">Dog's name</label>
          <input type="text" class="form-control" name="name" value="${esc(dog?.name||'')}" required>
        </div>
        <div class="col-sm-6">
          <label class="form-label">Breed</label>
          <input type="text" class="form-control" name="breed" value="${esc(dog?.breed||'')}">
        </div>
        <div class="col-sm-6">
          <label class="form-label">Date of birth</label>
          <input type="date" class="form-control" name="dateOfBirth" value="${dog?.dateOfBirth ? dog.dateOfBirth.split('T')[0] : ''}">
        </div>
        <div class="col-sm-6">
          <label class="form-label">Vet name</label>
          <input type="text" class="form-control" name="vetName" value="${esc(dog?.vetContact?.name||'')}">
        </div>
        <div class="col-sm-6">
          <label class="form-label">Vet phone</label>
          <input type="text" class="form-control" name="vetPhone" value="${esc(dog?.vetContact?.phone||'')}">
        </div>
        <div class="col-12">
          <label class="form-label">Medical notes</label>
          <textarea class="form-control" name="medicalNotes" rows="2">${esc(dog?.medicalNotes||'')}</textarea>
        </div>
        <div class="col-12">
          <label class="form-label">Behaviour notes</label>
          <textarea class="form-control" name="behaviourNotes" rows="2">${esc(dog?.behaviourNotes||'')}</textarea>
        </div>
      </div>
    </form>`,
    `<button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
     <button class="btn btn-primary" id="save-dog-btn">${dog ? 'Save Changes' : 'Add Dog'}</button>`
  );

  document.getElementById('save-dog-btn').addEventListener('click', async () => {
    const form = document.getElementById('dog-form');
    const fd = new FormData(form);
    const btn = document.getElementById('save-dog-btn');
    btn.disabled = true;
    const payload = {
      name: fd.get('name'),
      breed: fd.get('breed') || undefined,
      dateOfBirth: fd.get('dateOfBirth') || undefined,
      vetContact: (fd.get('vetName') || fd.get('vetPhone'))
        ? { name: fd.get('vetName') || undefined, phone: fd.get('vetPhone') || undefined }
        : undefined,
      medicalNotes: fd.get('medicalNotes') || undefined,
      behaviourNotes: fd.get('behaviourNotes') || undefined,
    };
    try {
      if (dogId) {
        await API.updateDog(ownerId, dogId, payload);
        toast('Dog profile updated.', 'success');
      } else {
        await API.createDog(ownerId, payload);
        toast('Dog added! 🐶', 'success');
      }
      hideModal();
      await loadOwnerDogs();
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
}

window.editDog = (id) => showDogModal(id);

window.deleteDogById = async (id) => {
  if (!confirm('Delete this dog profile?')) return;
  const user = currentUser();
  try {
    await API.deleteDog(user.profileId || user.id, id);
    toast('Dog profile deleted.', 'info');
    await loadOwnerDogs();
  } catch (err) {
    toast(err.message, 'error');
  }
};

// ---- Owner: Invoices ----

route('#/dashboard/owner/invoices', async () => {
  if (!isLoggedIn() || !isOwner()) { navigate('#/login'); return; }
  document.getElementById('app').innerHTML = dashLayout(
    ownerSidebar('invoices'),
    `<div class="section-header">
       <div><div class="page-title">Invoices</div><div class="page-subtitle">View and pay your invoices</div></div>
     </div>
     <div id="invoices-content">${loading()}</div>`
  );
  bindSidebarLogout();

  try {
    const data = await API.listInvoices();
    const items = data.data || [];
    const el = document.getElementById('invoices-content');
    if (!items.length) {
      el.innerHTML = emptyState('🧾', 'No invoices yet', 'Invoices from your walker will appear here.');
      return;
    }
    el.innerHTML = `
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead><tr><th>Invoice #</th><th>Date</th><th>Due</th><th>Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${items.map(inv => `
              <tr>
                <td><strong>${esc(inv.invoiceNumber || inv.id.slice(0,8))}</strong></td>
                <td>${fmt(inv.issuedDate || inv.createdAt)}</td>
                <td>${fmt(inv.dueDate)}</td>
                <td>£${(inv.totalAmount || 0).toFixed(2)}</td>
                <td>${statusBadge(inv.status)}</td>
                <td>${inv.status === 'sent' ? `<button class="btn btn-sm btn-success" onclick="markInvoicePaid('${inv.id}')">Mark Paid</button>` : ''}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  } catch (err) {
    document.getElementById('invoices-content').innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  }
});

window.markInvoicePaid = async (id) => {
  if (!confirm('Mark this invoice as paid?')) return;
  try {
    await API.payInvoice(id);
    toast('Invoice marked as paid. ✅', 'success');
    navigate('#/dashboard/owner/invoices');
  } catch (err) {
    toast(err.message, 'error');
  }
};

// ---- Owner: Recurring Walks ----

route('#/dashboard/owner/recurring', async () => {
  if (!isLoggedIn() || !isOwner()) { navigate('#/login'); return; }
  document.getElementById('app').innerHTML = dashLayout(
    ownerSidebar('recurring'),
    `<div class="section-header">
       <div><div class="page-title">Recurring Walks</div><div class="page-subtitle">Set up a weekly walking schedule</div></div>
       <button class="btn btn-primary" id="btn-new-recurring">+ New Schedule</button>
     </div>
     <div id="recurring-content">${loading()}</div>`
  );
  bindSidebarLogout();
  document.getElementById('btn-new-recurring').addEventListener('click', showNewRecurringModal);
  await loadOwnerRecurring();
});

async function loadOwnerRecurring() {
  const el = document.getElementById('recurring-content');
  if (!el) return;
  try {
    const data = await API.listRecurringWalks();
    const items = data.data || [];
    if (!items.length) {
      el.innerHTML = emptyState('🔁', 'No recurring walks set up', 'Set up a weekly schedule to auto-book walks.');
      return;
    }
    el.innerHTML = `
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead><tr><th>Day</th><th>Time</th><th>Duration</th><th>Type</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${items.map(r => `
              <tr>
                <td>${esc(r.dayOfWeek || '—')}</td>
                <td>${esc(r.time || '—')}</td>
                <td>${r.durationMinutes ? r.durationMinutes + ' min' : '—'}</td>
                <td>${esc(r.walkType || '—')}</td>
                <td>${statusBadge(r.status)}</td>
                <td class="d-flex gap-1">
                  ${r.status === 'active' ? `<button class="btn btn-sm btn-outline-warning" onclick="pauseRecurring('${r.id}')">Pause</button>` : ''}
                  ${r.status === 'paused' ? `<button class="btn btn-sm btn-outline-success" onclick="resumeRecurring('${r.id}')">Resume</button>` : ''}
                  ${r.status !== 'cancelled' ? `<button class="btn btn-sm btn-outline-danger" onclick="cancelRecurring('${r.id}')">Cancel</button>` : ''}
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  } catch (err) {
    el.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  }
}

async function showNewRecurringModal() {
  const user = currentUser();
  let dogsHtml = '';
  try {
    const dogsData = await API.listDogs(user.profileId || user.id);
    const dogs = dogsData.data || [];
    dogsHtml = dogs.map(d => `<div class="form-check">
      <input class="form-check-input" type="checkbox" name="dogIds" value="${d.id}" id="rec_dog_${d.id}">
      <label class="form-check-label" for="rec_dog_${d.id}">${esc(d.name)}</label>
    </div>`).join('') || '<p class="text-muted small">No dogs yet. Add a dog first.</p>';
  } catch {}

  showModal('🔁 New Recurring Walk Schedule', `
    <form id="rec-form">
      <div class="row g-3">
        <div class="col-sm-6">
          <label class="form-label">Day of week</label>
          <select class="form-select" name="dayOfWeek" required>
            ${['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d =>
              `<option value="${d}">${d.charAt(0).toUpperCase()+d.slice(1)}</option>`
            ).join('')}
          </select>
        </div>
        <div class="col-sm-6">
          <label class="form-label">Time</label>
          <input type="time" class="form-control" name="time" value="09:00" required>
        </div>
        <div class="col-sm-6">
          <label class="form-label">Duration (minutes)</label>
          <select class="form-select" name="durationMinutes">
            <option value="30">30</option>
            <option value="45">45</option>
            <option value="60" selected>60</option>
            <option value="90">90</option>
          </select>
        </div>
        <div class="col-sm-6">
          <label class="form-label">Walk type</label>
          <select class="form-select" name="walkType">
            <option value="solo">Solo</option>
            <option value="group">Group</option>
            <option value="puppy_visit">Puppy Visit</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label">Dogs</label>
          ${dogsHtml}
        </div>
      </div>
    </form>`,
    `<button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
     <button class="btn btn-primary" id="save-rec-btn">Create Schedule</button>`
  );

  document.getElementById('save-rec-btn').addEventListener('click', async () => {
    const form = document.getElementById('rec-form');
    const fd = new FormData(form);
    const btn = document.getElementById('save-rec-btn');
    btn.disabled = true;
    try {
      await API.createRecurringWalk({
        dayOfWeek: fd.get('dayOfWeek'),
        time: fd.get('time'),
        durationMinutes: parseInt(fd.get('durationMinutes')),
        walkType: fd.get('walkType'),
        dogIds: fd.getAll('dogIds'),
      });
      hideModal();
      toast('Recurring walk schedule created! 🔁', 'success');
      await loadOwnerRecurring();
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
}

window.pauseRecurring  = async (id) => { try { await API.pauseRecurringWalk(id);  toast('Schedule paused.', 'info');    await loadOwnerRecurring(); } catch(e){ toast(e.message,'error'); }};
window.resumeRecurring = async (id) => { try { await API.resumeRecurringWalk(id); toast('Schedule resumed.','success'); await loadOwnerRecurring(); } catch(e){ toast(e.message,'error'); }};
window.cancelRecurring = async (id) => {
  if (!confirm('Cancel this recurring schedule permanently?')) return;
  try { await API.cancelRecurringWalk(id); toast('Schedule cancelled.', 'info'); await loadOwnerRecurring(); }
  catch(e){ toast(e.message,'error'); }
};

// ============================================================
// WALKER DASHBOARD
// ============================================================

// ---- Walker: Interest Requests ----

route('#/dashboard/walker/interest-requests', async () => {
  if (!isLoggedIn() || !isWalker()) { navigate('#/login'); return; }
  document.getElementById('app').innerHTML = dashLayout(
    walkerSidebar('interest-requests'),
    `<div class="section-header">
       <div><div class="page-title">Interest Requests</div><div class="page-subtitle">Review and manage prospective client requests</div></div>
     </div>
     <div id="interest-content">${loading()}</div>`
  );
  bindSidebarLogout();
  await loadWalkerInterestRequests();
});

async function loadWalkerInterestRequests() {
  const el = document.getElementById('interest-content');
  if (!el) return;
  try {
    const data = await API.listInterestRequests();
    const items = data.data || [];
    if (!items.length) {
      el.innerHTML = emptyState('📥', 'No interest requests', 'New requests from prospective clients will appear here.');
      return;
    }
    el.innerHTML = `
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead><tr><th>Name</th><th>Email</th><th>Postcode</th><th>Dog(s)</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${items.map(r => `
              <tr>
                <td><strong>${esc(r.firstName)} ${esc(r.lastName)}</strong></td>
                <td>${esc(r.email)}</td>
                <td>${esc(r.postcode)}</td>
                <td class="small" style="max-width:200px">${esc(r.dogDescription || '—')}</td>
                <td>${statusBadge(r.status)}</td>
                <td class="d-flex gap-1">
                  ${r.status === 'pending' ? `
                    <button class="btn btn-sm btn-success" onclick="acceptInterest('${r.id}')">Accept</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="declineInterest('${r.id}')">Decline</button>
                  ` : '—'}
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  } catch (err) {
    el.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  }
}

window.acceptInterest = async (id) => {
  if (!confirm('Accept this interest request? This will create a new dog owner account.')) return;
  try {
    await API.acceptInterestRequest(id);
    toast('Interest request accepted! New owner account created.', 'success');
    await loadWalkerInterestRequests();
  } catch (err) {
    toast(err.message, 'error');
  }
};

window.declineInterest = async (id) => {
  const reason = prompt('Reason for declining (optional):');
  if (reason === null) return;
  try {
    await API.declineInterestRequest(id, reason);
    toast('Interest request declined.', 'info');
    await loadWalkerInterestRequests();
  } catch (err) {
    toast(err.message, 'error');
  }
};

// ---- Walker: Walk Requests ----

route('#/dashboard/walker/walk-requests', async () => {
  if (!isLoggedIn() || !isWalker()) { navigate('#/login'); return; }
  document.getElementById('app').innerHTML = dashLayout(
    walkerSidebar('walk-requests'),
    `<div class="section-header">
       <div><div class="page-title">Walk Requests</div><div class="page-subtitle">Review pending requests from dog owners</div></div>
     </div>
     <div id="walk-req-content">${loading()}</div>`
  );
  bindSidebarLogout();
  await loadWalkerWalkRequests();
});

async function loadWalkerWalkRequests() {
  const el = document.getElementById('walk-req-content');
  if (!el) return;
  try {
    const data = await API.listWalkRequests({ status: 'pending' });
    const items = data.data || [];
    if (!items.length) {
      el.innerHTML = emptyState('📋', 'No pending walk requests', 'New requests from owners will appear here.');
      return;
    }
    el.innerHTML = `
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead><tr><th>Owner</th><th>Date</th><th>Time</th><th>Duration</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${items.map(r => `
              <tr>
                <td>${esc(r.ownerName || r.ownerId || '—')}</td>
                <td>${fmt(r.requestedDate)}</td>
                <td>${r.requestedTime || '—'}</td>
                <td>${r.durationMinutes ? r.durationMinutes + ' min' : '—'}</td>
                <td>${esc(r.walkType || '—')}</td>
                <td>${statusBadge(r.status)}</td>
                <td class="d-flex gap-1">
                  <button class="btn btn-sm btn-success" onclick="acceptWalkReq('${r.id}')">Accept</button>
                  <button class="btn btn-sm btn-outline-danger" onclick="declineWalkReq('${r.id}')">Decline</button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  } catch (err) {
    el.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  }
}

window.acceptWalkReq = async (id) => {
  if (!confirm('Accept this walk request? A walk will be scheduled.')) return;
  try {
    await API.acceptWalkRequest(id);
    toast('Walk request accepted! Walk scheduled. 🦮', 'success');
    await loadWalkerWalkRequests();
  } catch (err) {
    toast(err.message, 'error');
  }
};

window.declineWalkReq = async (id) => {
  const reason = prompt('Reason for declining (optional):');
  if (reason === null) return;
  try {
    await API.declineWalkRequest(id, reason);
    toast('Walk request declined.', 'info');
    await loadWalkerWalkRequests();
  } catch (err) {
    toast(err.message, 'error');
  }
};

// ---- Walker: Walks ----

route('#/dashboard/walker/walks', async () => {
  if (!isLoggedIn() || !isWalker()) { navigate('#/login'); return; }
  document.getElementById('app').innerHTML = dashLayout(
    walkerSidebar('walks'),
    `<div class="section-header">
       <div><div class="page-title">Walks</div><div class="page-subtitle">Manage and execute scheduled walks</div></div>
     </div>
     <div id="walker-walks-content">${loading()}</div>`
  );
  bindSidebarLogout();
  await loadWalkerWalks();
});

async function loadWalkerWalks() {
  const el = document.getElementById('walker-walks-content');
  if (!el) return;
  try {
    const data = await API.listWalks();
    const items = data.data || [];
    if (!items.length) {
      el.innerHTML = emptyState('🦮', 'No walks yet', 'Accepted walk requests will generate walks here.');
      return;
    }
    el.innerHTML = `
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead><tr><th>Date</th><th>Time</th><th>Duration</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${items.map(w => `
              <tr>
                <td>${fmt(w.scheduledDate)}</td>
                <td>${w.scheduledTime || '—'}</td>
                <td>${w.durationMinutes ? w.durationMinutes + ' min' : '—'}</td>
                <td>${esc(w.walkType || '—')}</td>
                <td>${statusBadge(w.status)}</td>
                <td class="d-flex flex-wrap gap-1">
                  ${w.status === 'scheduled' ? `<button class="btn btn-sm btn-primary" onclick="startWalkById('${w.id}')">Start</button>` : ''}
                  ${w.status === 'in_progress' ? `
                    <button class="btn btn-sm btn-success" onclick="completeWalkById('${w.id}')">Complete</button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="addWalkUpdate('${w.id}')">Post Update</button>
                  ` : ''}
                  ${(w.status === 'scheduled' || w.status === 'in_progress') ? `<button class="btn btn-sm btn-outline-danger" onclick="walkerCancelWalk('${w.id}')">Cancel</button>` : ''}
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  } catch (err) {
    el.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  }
}

window.startWalkById = async (id) => {
  try {
    await API.startWalk(id);
    toast('Walk started! 🏃 Safe walking!', 'success');
    await loadWalkerWalks();
  } catch (err) {
    toast(err.message, 'error');
  }
};

window.completeWalkById = (id) => {
  showModal('✅ Complete Walk', `
    <form id="complete-form">
      <div class="mb-3">
        <label class="form-label">Distance walked (km)</label>
        <input type="number" class="form-control" name="distanceKm" step="0.1" min="0" placeholder="e.g. 3.5">
      </div>
      <div class="mb-3">
        <label class="form-label">Summary notes</label>
        <textarea class="form-control" name="notes" rows="3" placeholder="How did the walk go?"></textarea>
      </div>
    </form>`,
    `<button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
     <button class="btn btn-success" id="do-complete-btn">Mark as Complete</button>`
  );
  document.getElementById('do-complete-btn').addEventListener('click', async () => {
    const form = document.getElementById('complete-form');
    const fd = new FormData(form);
    const btn = document.getElementById('do-complete-btn');
    btn.disabled = true;
    try {
      await API.completeWalk(id, {
        distanceKm: fd.get('distanceKm') ? parseFloat(fd.get('distanceKm')) : undefined,
        notes: fd.get('notes') || undefined,
      });
      hideModal();
      toast('Walk completed! Great work! 🎉', 'success');
      await loadWalkerWalks();
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
};

window.addWalkUpdate = (walkId) => {
  showModal('📸 Post Walk Update', `
    <form id="update-form">
      <div class="mb-3">
        <label class="form-label">Update / note</label>
        <textarea class="form-control" name="note" rows="3" placeholder="Share how the walk is going…" required></textarea>
      </div>
    </form>`,
    `<button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
     <button class="btn btn-primary" id="post-update-btn">Post Update</button>`
  );
  document.getElementById('post-update-btn').addEventListener('click', async () => {
    const fd = new FormData(document.getElementById('update-form'));
    const btn = document.getElementById('post-update-btn');
    btn.disabled = true;
    try {
      await API.createWalkUpdate(walkId, { note: fd.get('note') });
      hideModal();
      toast('Update posted! 📸', 'success');
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
};

window.walkerCancelWalk = async (id) => {
  const reason = prompt('Reason for cancellation:');
  if (reason === null) return;
  try {
    await API.cancelWalk(id, reason || 'Cancelled by walker');
    toast('Walk cancelled.', 'info');
    await loadWalkerWalks();
  } catch (err) {
    toast(err.message, 'error');
  }
};

// ---- Walker: Owners ----

route('#/dashboard/walker/owners', async () => {
  if (!isLoggedIn() || !isWalker()) { navigate('#/login'); return; }
  document.getElementById('app').innerHTML = dashLayout(
    walkerSidebar('owners'),
    `<div class="section-header">
       <div><div class="page-title">Dog Owners</div><div class="page-subtitle">View and manage registered owners</div></div>
     </div>
     <div id="owners-content">${loading()}</div>`
  );
  bindSidebarLogout();

  try {
    const data = await API.listOwners();
    const owners = data.data || [];
    const el = document.getElementById('owners-content');
    if (!owners.length) {
      el.innerHTML = emptyState('👤', 'No owners yet', 'Owners are created when you accept an interest request.');
      return;
    }
    el.innerHTML = `
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Actions</th></tr></thead>
            <tbody>
              ${owners.map(o => `
              <tr>
                <td><strong>${esc(o.firstName)} ${esc(o.lastName)}</strong></td>
                <td>${esc(o.email || '—')}</td>
                <td>${esc(o.phone || '—')}</td>
                <td>${esc(o.address || '—')}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary" onclick="viewOwnerDogs('${o.id}','${esc(o.firstName)} ${esc(o.lastName)}')">View Dogs</button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  } catch (err) {
    document.getElementById('owners-content').innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  }
});

window.viewOwnerDogs = async (ownerId, ownerName) => {
  showModal(`🐶 Dogs – ${ownerName}`, loading('Loading dogs…'));
  try {
    const data = await API.listDogs(ownerId);
    const dogs = data.data || [];
    if (!dogs.length) {
      $('#modal-body').innerHTML = emptyState('🐶', 'No dogs', 'This owner has not added any dogs yet.');
      return;
    }
    $('#modal-body').innerHTML = dogs.map(d => `
    <div class="dog-card mb-3">
      <div class="dog-avatar">🐕</div>
      <div>
        <h6 class="mb-1 fw-bold">${esc(d.name)}</h6>
        <div class="text-muted small">${esc(d.breed || '—')} · ${d.dateOfBirth ? fmt(d.dateOfBirth) : '—'}</div>
        ${d.medicalNotes ? `<div class="small"><strong>Medical:</strong> ${esc(d.medicalNotes)}</div>` : ''}
        ${d.behaviourNotes ? `<div class="small"><strong>Behaviour:</strong> ${esc(d.behaviourNotes)}</div>` : ''}
        ${d.vetContact ? `<div class="small"><strong>Vet:</strong> ${esc(d.vetContact.name || '')}${d.vetContact.phone ? ` · ${esc(d.vetContact.phone)}` : ''}</div>` : ''}
      </div>
    </div>`).join('');
  } catch (err) {
    $('#modal-body').innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  }
};

// ---- Walker: Invoices ----

route('#/dashboard/walker/invoices', async () => {
  if (!isLoggedIn() || !isWalker()) { navigate('#/login'); return; }
  document.getElementById('app').innerHTML = dashLayout(
    walkerSidebar('invoices'),
    `<div class="section-header">
       <div><div class="page-title">Invoices</div><div class="page-subtitle">Create and manage invoices for dog owners</div></div>
       <button class="btn btn-primary" id="btn-new-invoice">+ New Invoice</button>
     </div>
     <div id="walker-invoices-content">${loading()}</div>`
  );
  bindSidebarLogout();
  document.getElementById('btn-new-invoice').addEventListener('click', showNewInvoiceModal);
  await loadWalkerInvoices();
});

async function loadWalkerInvoices() {
  const el = document.getElementById('walker-invoices-content');
  if (!el) return;
  try {
    const data = await API.listInvoices();
    const items = data.data || [];
    if (!items.length) {
      el.innerHTML = emptyState('🧾', 'No invoices yet', 'Create an invoice to bill a dog owner.');
      return;
    }
    el.innerHTML = `
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead><tr><th>Invoice #</th><th>Owner</th><th>Date</th><th>Due</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${items.map(inv => `
              <tr>
                <td><strong>${esc(inv.invoiceNumber || inv.id.slice(0,8))}</strong></td>
                <td>${esc(inv.ownerName || inv.ownerId || '—')}</td>
                <td>${fmt(inv.issuedDate || inv.createdAt)}</td>
                <td>${fmt(inv.dueDate)}</td>
                <td>£${(inv.totalAmount || 0).toFixed(2)}</td>
                <td>${statusBadge(inv.status)}</td>
                <td class="d-flex gap-1">
                  ${inv.status === 'draft' ? `
                    <button class="btn btn-sm btn-primary" onclick="sendInvoiceById('${inv.id}')">Send</button>
                  ` : ''}
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  } catch (err) {
    el.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  }
}

async function showNewInvoiceModal() {
  let ownersHtml = '';
  let walksHtml = '';
  try {
    const [ownersData, walksData] = await Promise.all([
      API.listOwners(),
      API.listWalks({ status: 'completed' }),
    ]);
    const owners = ownersData.data || [];
    const walks = walksData.data || [];
    ownersHtml = owners.map(o =>
      `<option value="${o.id}">${esc(o.firstName)} ${esc(o.lastName)}</option>`
    ).join('') || '<option disabled>No owners found</option>';
    walksHtml = walks.map(w =>
      `<div class="form-check">
        <input class="form-check-input" type="checkbox" name="walkIds" value="${w.id}" id="walk_${w.id}">
        <label class="form-check-label" for="walk_${w.id}">${fmt(w.scheduledDate)} – ${esc(w.walkType||'Walk')}</label>
      </div>`
    ).join('') || '<p class="text-muted small">No completed walks to invoice.</p>';
  } catch {}

  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);

  showModal('🧾 New Invoice', `
    <form id="invoice-form">
      <div class="row g-3">
        <div class="col-12">
          <label class="form-label">Owner</label>
          <select class="form-select" name="ownerId" required>
            <option value="" disabled selected>Select owner…</option>
            ${ownersHtml}
          </select>
        </div>
        <div class="col-sm-6">
          <label class="form-label">Due date</label>
          <input type="date" class="form-control" name="dueDate" value="${nextMonth.toISOString().split('T')[0]}" required>
        </div>
        <div class="col-sm-6">
          <label class="form-label">Total amount (£)</label>
          <input type="number" class="form-control" name="totalAmount" step="0.01" min="0" placeholder="0.00" required>
        </div>
        <div class="col-12">
          <label class="form-label">Include walks</label>
          ${walksHtml}
        </div>
        <div class="col-12">
          <label class="form-label">Notes (optional)</label>
          <textarea class="form-control" name="notes" rows="2"></textarea>
        </div>
      </div>
    </form>`,
    `<button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
     <button class="btn btn-primary" id="create-inv-btn">Create Invoice</button>`
  );

  document.getElementById('create-inv-btn').addEventListener('click', async () => {
    const form = document.getElementById('invoice-form');
    const fd = new FormData(form);
    const btn = document.getElementById('create-inv-btn');
    btn.disabled = true;
    try {
      await API.createInvoice({
        ownerId: fd.get('ownerId'),
        dueDate: fd.get('dueDate'),
        totalAmount: parseFloat(fd.get('totalAmount')),
        walkIds: fd.getAll('walkIds'),
        notes: fd.get('notes') || undefined,
      });
      hideModal();
      toast('Invoice created! 🧾', 'success');
      await loadWalkerInvoices();
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
}

window.sendInvoiceById = async (id) => {
  if (!confirm('Send this invoice to the owner?')) return;
  try {
    await API.sendInvoice(id);
    toast('Invoice sent! 📧', 'success');
    await loadWalkerInvoices();
  } catch (err) {
    toast(err.message, 'error');
  }
};

// ---- 404 ----

route('*', () => {
  document.getElementById('app').innerHTML = `
  <div class="container text-center" style="padding:80px 20px">
    <div style="font-size:5rem">🐾</div>
    <h2 style="font-weight:800">Page not found</h2>
    <p class="text-muted">The page you're looking for doesn't exist.</p>
    <a href="#/" class="btn btn-primary mt-2">Back to home</a>
  </div>`;
});

// ---- Init ----

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  handleRoute();
});
