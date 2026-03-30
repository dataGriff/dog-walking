/**
 * Stardogwalker API client
 * Wraps all calls to the backend REST API at /v1
 *
 * API base URL resolution order:
 *   1. window.SDW_API_BASE (set in index.html or via config)
 *   2. Same-origin /v1 (for production deployments where UI and API share a host)
 *   3. Fallback to http://localhost:3000/v1 (local development)
 */

const API_BASE = (typeof window !== 'undefined' && window.SDW_API_BASE)
  ? window.SDW_API_BASE
  : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000/v1'
      : `${window.location.origin}/v1`);

// ---- Token storage ----

function getAccessToken() {
  return localStorage.getItem('sdw_access_token');
}

function getRefreshToken() {
  return localStorage.getItem('sdw_refresh_token');
}

function saveTokens(accessToken, refreshToken) {
  localStorage.setItem('sdw_access_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('sdw_refresh_token', refreshToken);
  }
}

function clearTokens() {
  localStorage.removeItem('sdw_access_token');
  localStorage.removeItem('sdw_refresh_token');
  localStorage.removeItem('sdw_user');
}

function saveUser(user) {
  localStorage.setItem('sdw_user', JSON.stringify(user));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('sdw_user'));
  } catch {
    return null;
  }
}

// ---- Core request helper ----

let isRefreshing = false;
let refreshPromise = null;

async function request(method, path, body, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token && !opts.noAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Auto-refresh on 401
  if (res.status === 401 && !opts.noAuth && !opts.noRefresh) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request(method, path, body, { ...opts, noRefresh: true });
    } else {
      clearTokens();
      window.location.hash = '#/login';
      throw new ApiError(401, 'Session expired. Please log in again.');
    }
  }

  // Parse JSON (or empty body)
  let data = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    data = await res.json();
  }

  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new ApiError(res.status, msg, data);
  }

  return data;
}

async function tryRefresh() {
  if (isRefreshing) return refreshPromise;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const data = await request('POST', '/auth/refresh', { refreshToken }, { noAuth: true, noRefresh: true });
      saveTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
    }
  })();
  return refreshPromise;
}

class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// ---- Auth ----

async function register(email, password, firstName, lastName, role) {
  return request('POST', '/auth/register', { email, password, firstName, lastName, role }, { noAuth: true });
}

async function login(email, password) {
  return request('POST', '/auth/login', { email, password }, { noAuth: true });
}

async function logout() {
  return request('POST', '/auth/logout');
}

async function refreshToken(token) {
  return request('POST', '/auth/refresh', { refreshToken: token }, { noAuth: true });
}

// ---- Interest Requests ----

async function createInterestRequest(data) {
  return request('POST', '/interest-requests', data, { noAuth: true });
}

async function listInterestRequests(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request('GET', `/interest-requests${q ? '?' + q : ''}`);
}

async function getInterestRequest(id) {
  return request('GET', `/interest-requests/${id}`);
}

async function acceptInterestRequest(id) {
  return request('POST', `/interest-requests/${id}/accept`);
}

async function declineInterestRequest(id, reason) {
  return request('POST', `/interest-requests/${id}/decline`, reason ? { reason } : {});
}

// ---- Owners ----

async function listOwners(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request('GET', `/owners${q ? '?' + q : ''}`);
}

async function getOwner(id) {
  return request('GET', `/owners/${id}`);
}

async function updateOwner(id, data) {
  return request('PUT', `/owners/${id}`, data);
}

async function createOwner(data) {
  return request('POST', '/owners', data);
}

async function deleteOwner(id) {
  return request('DELETE', `/owners/${id}`);
}

// ---- Walkers ----

async function listWalkers() {
  return request('GET', '/walkers');
}

async function getWalker(id) {
  return request('GET', `/walkers/${id}`);
}

async function createWalker(data) {
  return request('POST', '/walkers', data);
}

async function updateWalker(id, data) {
  return request('PUT', `/walkers/${id}`, data);
}

// ---- Dogs ----

async function listDogs(ownerId) {
  return request('GET', `/owners/${ownerId}/dogs`);
}

async function createDog(ownerId, data) {
  return request('POST', `/owners/${ownerId}/dogs`, data);
}

async function updateDog(ownerId, dogId, data) {
  return request('PUT', `/owners/${ownerId}/dogs/${dogId}`, data);
}

async function deleteDog(ownerId, dogId) {
  return request('DELETE', `/owners/${ownerId}/dogs/${dogId}`);
}

// ---- Walk Requests ----

async function listWalkRequests(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request('GET', `/walk-requests${q ? '?' + q : ''}`);
}

async function createWalkRequest(data) {
  return request('POST', '/walk-requests', data);
}

async function getWalkRequest(id) {
  return request('GET', `/walk-requests/${id}`);
}

async function cancelWalkRequest(id) {
  return request('POST', `/walk-requests/${id}/cancel`);
}

async function acceptWalkRequest(id) {
  return request('POST', `/walk-requests/${id}/accept`);
}

async function declineWalkRequest(id, reason) {
  return request('POST', `/walk-requests/${id}/decline`, reason ? { reason } : {});
}

// ---- Walks ----

async function listWalks(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request('GET', `/walks${q ? '?' + q : ''}`);
}

async function getWalk(id) {
  return request('GET', `/walks/${id}`);
}

async function startWalk(id) {
  return request('POST', `/walks/${id}/start`);
}

async function completeWalk(id, data) {
  return request('POST', `/walks/${id}/complete`, data);
}

async function cancelWalk(id, reason) {
  return request('POST', `/walks/${id}/cancel`, { reason });
}

// ---- Walk Updates ----

async function listWalkUpdates(walkId) {
  return request('GET', `/walks/${walkId}/updates`);
}

async function createWalkUpdate(walkId, data) {
  return request('POST', `/walks/${walkId}/updates`, data);
}

async function deleteWalkUpdate(walkId, updateId) {
  return request('DELETE', `/walks/${walkId}/updates/${updateId}`);
}

// ---- Recurring Walks ----

async function listRecurringWalks(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request('GET', `/recurring-walks${q ? '?' + q : ''}`);
}

async function createRecurringWalk(data) {
  return request('POST', '/recurring-walks', data);
}

async function updateRecurringWalk(id, data) {
  return request('PUT', `/recurring-walks/${id}`, data);
}

async function pauseRecurringWalk(id) {
  return request('POST', `/recurring-walks/${id}/pause`);
}

async function resumeRecurringWalk(id) {
  return request('POST', `/recurring-walks/${id}/resume`);
}

async function cancelRecurringWalk(id) {
  return request('POST', `/recurring-walks/${id}/cancel`);
}

// ---- Invoices ----

async function listInvoices(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request('GET', `/invoices${q ? '?' + q : ''}`);
}

async function createInvoice(data) {
  return request('POST', '/invoices', data);
}

async function getInvoice(id) {
  return request('GET', `/invoices/${id}`);
}

async function updateInvoice(id, data) {
  return request('PUT', `/invoices/${id}`, data);
}

async function sendInvoice(id) {
  return request('POST', `/invoices/${id}/send`);
}

async function payInvoice(id) {
  return request('POST', `/invoices/${id}/pay`);
}

// ---- Exports ----

window.API = {
  ApiError,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  saveUser,
  getUser,
  // Auth
  register,
  login,
  logout,
  refreshToken,
  // Interest
  createInterestRequest,
  listInterestRequests,
  getInterestRequest,
  acceptInterestRequest,
  declineInterestRequest,
  // Owners
  listOwners,
  getOwner,
  updateOwner,
  createOwner,
  deleteOwner,
  // Walkers
  listWalkers,
  getWalker,
  createWalker,
  updateWalker,
  // Dogs
  listDogs,
  createDog,
  updateDog,
  deleteDog,
  // Walk Requests
  listWalkRequests,
  createWalkRequest,
  getWalkRequest,
  cancelWalkRequest,
  acceptWalkRequest,
  declineWalkRequest,
  // Walks
  listWalks,
  getWalk,
  startWalk,
  completeWalk,
  cancelWalk,
  // Walk Updates
  listWalkUpdates,
  createWalkUpdate,
  deleteWalkUpdate,
  // Recurring Walks
  listRecurringWalks,
  createRecurringWalk,
  updateRecurringWalk,
  pauseRecurringWalk,
  resumeRecurringWalk,
  cancelRecurringWalk,
  // Invoices
  listInvoices,
  createInvoice,
  getInvoice,
  updateInvoice,
  sendInvoice,
  payInvoice,
};
