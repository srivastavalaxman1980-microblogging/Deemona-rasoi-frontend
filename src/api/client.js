const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "rasoi.token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}
export function setToken(t) {
  try {
    localStorage.setItem(TOKEN_KEY, t);
  } catch {}
}
export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

async function request(path, options = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(BASE + path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(`Can't reach the API at ${BASE}. Is the backend running?`);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* non-JSON error body */
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  base: BASE,

  health: () => request("/health"),

  // ---- auth ----
  register: (body) => request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/api/auth/me"),

  // ---- households ----
  listHouseholds: () => request("/api/households"),
  createHousehold: (body) =>
    request("/api/households", { method: "POST", body: JSON.stringify(body) }),
  getHousehold: (id) => request(`/api/households/${id}`),
  updateHousehold: (id, body) =>
    request(`/api/households/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  // ---- plans ----
  listPlans: (householdId) => request(`/api/households/${householdId}/meal-plans`),
  generatePlan: (householdId, body) =>
    request(`/api/households/${householdId}/meal-plans`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getPlan: (planId) => request(`/api/meal-plans/${planId}`),
  deletePlan: (planId) => request(`/api/meal-plans/${planId}`, { method: "DELETE" }),

  swapMeal: (mealId) => request(`/api/meals/${mealId}/swap`, { method: "POST" }),

  buildGrocery: (planId) =>
    request(`/api/meal-plans/${planId}/grocery`, { method: "POST" }),
  getGrocery: (planId) => request(`/api/meal-plans/${planId}/grocery`),

  listPantry: (householdId) => request(`/api/households/${householdId}/pantry`),
  addPantryItem: (householdId, body) =>
    request(`/api/households/${householdId}/pantry`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updatePantryItem: (id, body) =>
    request(`/api/pantry/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deletePantryItem: (id) => request(`/api/pantry/${id}`, { method: "DELETE" }),

  getDishImage: (name) => request(`/api/dish-image?name=${encodeURIComponent(name)}`),
  getRecipe: (mealId, lang) =>
    request(`/api/meals/${mealId}/recipe${lang ? `?lang=${encodeURIComponent(lang)}` : ""}`),

  assistant: (body) =>
    request("/api/assistant", { method: "POST", body: JSON.stringify(body) }),
};
